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
    // Format: "VS241209XXXX" - mã đơn hàng
    const content = transaction.content || transaction.description || "";
    const orderCodeMatch = content.match(/VS\d{6}[A-Z0-9]{4}/i);

    if (!orderCodeMatch) {
      console.log("No order code found in:", content);
      return NextResponse.json({ success: true, message: "No order code found" });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    // Find order with service info
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { service: true },
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

    // Check if payment amount matches (allow 1000đ tolerance)
    const tolerance = 1000;
    const isAmountMatch = Math.abs(transaction.transferAmount - order.totalPrice) <= tolerance;

    // Count codes for this service
    const inventoryCount = await prisma.chatbotInventory.count({
      where: { serviceId: order.serviceId }
    });

    if (inventoryCount === 1) {
      // Reusable code logic: if only ONE code exists, use it for everyone
      const sharedChatbot = await prisma.chatbotInventory.findFirst({
        where: { serviceId: order.serviceId },
      });

      if (sharedChatbot) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n✅ Đã tự động bàn giao ChatBot: ${sharedChatbot.activationCode}`
              : `✅ Đã tự động bàn giao ChatBot: ${sharedChatbot.activationCode}`,
          },
        });
        console.log(`✅ SHARED Chatbot data [${sharedChatbot.activationCode}] assigned to order ${orderCode}`);
      }
    } else {
      // Single-use logic: Find available chatbot data (FIFO)
      const availableChatbot = await prisma.chatbotInventory.findFirst({
        where: {
          serviceId: order.serviceId,
          isUsed: false,
        },
        orderBy: { createdAt: "asc" },
      });

      // Assign chatbot data if available
      if (availableChatbot) {
        await prisma.$transaction([
          prisma.chatbotInventory.update({
            where: { id: availableChatbot.id },
            data: {
              isUsed: true,
              orderId: order.id,
            },
          }),
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: "confirmed",
              notes: order.notes
                ? `${order.notes}\n\n✅ Đã tự động bàn giao ChatBot: ${availableChatbot.activationCode}`
                : `✅ Đã tự động bàn giao ChatBot: ${availableChatbot.activationCode}`,
            },
          })
        ]);
        console.log(`✅ Chatbot data [${availableChatbot.activationCode}] assigned and order ${orderCode} confirmed`);
      } else {
        // Just confirm order if no chatbot data
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n⚠️ Không có sẵn dữ liệu ChatBot để bàn giao tự động.`
              : `⚠️ Không có sẵn dữ liệu ChatBot để bàn giao tự động.`,
          },
        });
        console.log(`⚠️ No chatbot data available for service ${order.service.name} - Order ${orderCode} confirmed without delivery`);
      }
    }

    // --- Logic tạo tài khoản khách hàng tự động ---
    try {
      if (order.customerEmail) {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await prisma.user.findUnique({
          where: { email: order.customerEmail }
        });

        if (!existingUser) {
          console.log(`Creating auto-account for: ${order.customerEmail}`);
          const adminSupabase = createAdminSupabaseClient();

          if (adminSupabase) {
            // 1. Tạo user trong Supabase Auth
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
              email: order.customerEmail,
              password: order.customerPhone, // Mật khẩu mặc định là số điện thoại
              email_confirm: true,
              user_metadata: {
                name: order.customerName,
                role: "customer"
              }
            });

            if (authError) {
              console.error("Supabase Auth auto-creation error:", authError.message);
            } else if (authData.user) {
              // 2. Tạo record trong Prisma User
              await prisma.user.create({
                data: {
                  id: authData.user.id,
                  email: order.customerEmail,
                  name: order.customerName,
                  phone: order.customerPhone,
                  role: "customer",
                  password: "", // Auth managed by Supabase
                }
              });

              // 3. Cập nhật ghi chú đơn hàng với thông tin đăng nhập
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  notes: `${order.notes || ""}\n\n🔑 ĐÃ TẠO TÀI KHOÀN QUẢN LÝ:\n- Email: ${order.customerEmail}\n- Mật khẩu: ${order.customerPhone}\n- Đăng nhập tại: /dang-nhap`
                }
              });
              console.log(`✅ Auto-account created for ${order.customerEmail}`);
            }
          }
        }
      }
    } catch (accError) {
      console.error("Auto-account creation flow error:", accError);
      // Không crash webhook nếu lỗi tạo tài khoản
    }

    console.log(`✅ Order ${orderCode} confirmed with payment ${transaction.transferAmount}`);

    return NextResponse.json({
      success: true,
      message: `Order ${orderCode} confirmed`
    });
  } catch (error) {
    console.error("SePay webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// SePay may send GET to verify endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SePay webhook endpoint is active"
  });
}
