import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

interface SepayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
}

export async function POST(request: NextRequest) {
  try {
    const transaction: SepayWebhookPayload = await request.json();

    console.log("SePay webhook received:", transaction);

    // Only process incoming transfers (transferType = "in")
    if (transaction.transferType !== "in") {
      return NextResponse.json({ success: true, message: "Outgoing transfer ignored" });
    }

    // Extract order code from content
    const content = transaction.content || transaction.description || "";
    const orderCodeMatch = content.match(/VS\d{6}[A-Z0-9]{4}/i);

    if (!orderCodeMatch) {
      console.log("No order code found in:", content);
      return NextResponse.json({ success: true, message: "No order code found" });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    // Find order with service info - Using resilient select
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalPrice: true,
        notes: true,
        serviceId: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            chatbotLink: true,
          }
        },
      },
    });

    if (!order) {
      console.log("Order not found:", orderCode);
      return NextResponse.json({ success: true, message: "Order not found" });
    }

    // Check if already confirmed
    if (order.status !== "pending") {
      console.log("Order already processed:", orderCode);
      return NextResponse.json({ success: true, message: "Order already processed" });
    }

    // Verify order total price matches transaction amount
    const tolerance = 1000;
    const expectedPrice = order.totalPrice;
    const receivedAmount = transaction.transferAmount;
    const isAmountMatch = Math.abs(receivedAmount - expectedPrice) <= tolerance;

    if (!isAmountMatch) {
      console.error(`[SePay Webhook] Price mismatch for order ${orderCode}. Expected: ${expectedPrice}, Received: ${receivedAmount}`);
      return NextResponse.json({
        success: false,
        message: `Sai số tiền thanh toán. Mong đợi: ${expectedPrice.toLocaleString()}đ, Nhận được: ${receivedAmount.toLocaleString()}đ`,
        error: "Price mismatch"
      }, { status: 400 });
    }

    // Determine package type (handling fallback to notes since orderPackageType is not selected)
    let packageType = "standard";
    if (order.notes?.includes("[Package: gold]")) packageType = "gold";
    else if (order.notes?.includes("[Package: platinum]")) packageType = "platinum";

    console.log(`[SePay Webhook] Processing order ${orderCode} with package: ${packageType}`);

    // Consolidate inventory logic - Find available code first
    const availableChatbot = await prisma.chatbotInventory.findFirst({
      where: {
        serviceId: order.serviceId,
        isUsed: false,
      },
      orderBy: { createdAt: "asc" },
    });

    const inventoryCount = await prisma.chatbotInventory.count({
      where: { serviceId: order.serviceId }
    });

    const isShared = inventoryCount === 1;

    // Fetch global dedicated links
    const globalLinks = await prisma.setting.findMany({
      where: { key: { in: ["chatbot_link_gold", "chatbot_link_platinum"] } }
    });
    const linksMap = new Map(globalLinks.map(s => [s.key, s.value]));

    await prisma.$transaction(async (tx) => {
      // --- Special Logic for Premium Packages (Gold/Platinum) ---
      if (packageType === "gold" || packageType === "platinum") {
        const dedicatedLink = packageType === "gold"
          ? linksMap.get("chatbot_link_gold")
          : linksMap.get("chatbot_link_platinum");

        const deliveryMessage = dedicatedLink
          ? `✅ Đã tự động bàn giao Link ${packageType.toUpperCase()}: ${dedicatedLink}`
          : `⚠️ Gói ${packageType.toUpperCase()} chưa có link bàn giao riêng. Vui lòng liên hệ Admin.`;

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n${deliveryMessage}`
              : deliveryMessage,
          },
        });
        console.log(`✅ Dedicated link for ${packageType} assigned to order ${orderCode}`);
        return;
      }

      // --- Standard Logic (activation codes) ---
      if (availableChatbot) {
        if (!isShared) {
          await tx.chatbotInventory.update({
            where: { id: availableChatbot.id },
            data: { isUsed: true, orderId: order.id },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n✅ Đã tự động bàn giao Trợ lý AI: ${availableChatbot.activationCode}`
              : `✅ Đã tự động bàn giao Trợ lý AI: ${availableChatbot.activationCode}`,
          },
        });
        console.log(`✅ Chatbot data [${availableChatbot.activationCode}] assigned to order ${orderCode}`);
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n⚠️ Không có sẵn dữ liệu Trợ lý AI để bàn giao tự động.`
              : `⚠️ Không có sẵn dữ liệu Trợ lý AI để bàn giao tự động.`,
          },
        });
        console.log(`⚠️ No chatbot data available for service ${order.service.name} - Order ${orderCode} confirmed without delivery`);
      }
    });

    // --- Logic tạo tài khoản khách hàng tự động ---
    try {
      if (order.customerEmail && order.customerEmail.trim() !== "") {
        const existingUser = await prisma.user.findFirst({
          where: { email: order.customerEmail }
        });

        if (!existingUser) {
          console.log(`Creating auto-account for: ${order.customerEmail}`);
          const adminSupabase = createAdminSupabaseClient();

          if (adminSupabase) {
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
              email: order.customerEmail,
              password: order.customerPhone || "Aa123456", // Default password if phone not provided
              email_confirm: true,
              user_metadata: {
                name: order.customerName,
                role: "customer"
              }
            });

            if (authError) {
              console.error("Supabase Auth auto-creation error:", authError.message);
            } else if (authData.user) {
              await prisma.user.create({
                data: {
                  id: authData.user.id,
                  email: order.customerEmail,
                  name: order.customerName,
                  phone: order.customerPhone,
                  role: "customer",
                  password: "",
                }
              });

              await prisma.order.update({
                where: { id: order.id },
                data: {
                  notes: `${order.notes || ""}\n\n🔑 ĐÃ TẠO TÀI KHOÀN QUẢN LÝ:\n- Email: ${order.customerEmail}\n- Mật khẩu: ${order.customerPhone || "Aa123456"}\n- Đăng nhập tại: /dang-nhap`
                }
              });
              console.log(`✅ Auto-account created for ${order.customerEmail}`);
            }
          }
        }
      }
    } catch (accError) {
      console.error("Auto-account creation flow error:", accError);
    }

    console.log(`✅ Order ${orderCode} confirmed with payment ${receivedAmount}`);

    return NextResponse.json({
      success: true,
      message: `Order ${orderCode} confirmed`,
      data: { orderCode, packageType }
    });
  } catch (error: any) {
    console.error("SePay webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi hệ thống khi xử lý thanh toán",
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SePay webhook endpoint is active"
  });
}
