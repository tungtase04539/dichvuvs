import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { calculateAndCreateCommissions } from "@/lib/commission";

// Standard SePay Webhook Payload
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
    console.log("[Webhook] Starting SePay processing...");
    const transaction: SepayWebhookPayload = await request.json();
    console.log("[Webhook] Payload received:", JSON.stringify(transaction));

    // 1. Filter incoming transfers
    if (transaction.transferType !== "in") {
      console.log("[Webhook] Ignoring outgoing transfer");
      return NextResponse.json({ success: true, message: "Outgoing transfer ignored" });
    }

    // 2. Extract Order Code
    const content = transaction.content || transaction.description || "";
    const orderCodeMatch = content.match(/VS\d{6}[A-Z0-9]{4}/i);

    if (!orderCodeMatch) {
      console.warn("[Webhook] No order code found in content:", content);
      return NextResponse.json({ success: true, message: "No order code found" });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();
    console.log("[Webhook] Searching for order:", orderCode);

    // 3. Find Order with resilient select
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
      console.warn("[Webhook] Order not found in DB:", orderCode);
      return NextResponse.json({ success: true, message: "Order not found" });
    }

    if (order.status !== "pending") {
      console.log(`[Webhook] Order ${orderCode} already processed (status: ${order.status})`);
      return NextResponse.json({ success: true, message: "Order already processed" });
    }

    // 4. Verify Amount
    const tolerance = 1000;
    const expected = order.totalPrice;
    const received = transaction.transferAmount;
    const isAmountMatch = Math.abs(received - expected) <= tolerance;

    if (!isAmountMatch) {
      console.error(`[Webhook] Price mismatch. Order: ${expected}, Received: ${received}`);
      return NextResponse.json({
        success: false,
        message: `Sai số tiền thanh toán. Mong đợi: ${expected.toLocaleString()}đ, Nhận: ${received.toLocaleString()}đ`,
        error: "Price mismatch"
      }, { status: 400 });
    }

    // 5. Detect Package Type (Resilient detection from notes)
    let packageType = "standard";
    const notesLower = (order.notes || "").toLowerCase();
    if (notesLower.includes("gold") || notesLower.includes("(gold)") || notesLower.includes("[package: gold]")) {
      packageType = "gold";
    } else if (notesLower.includes("platinum") || notesLower.includes("(platinum)") || notesLower.includes("[package: platinum]")) {
      packageType = "platinum";
    }
    console.log(`[Webhook] Package detected: ${packageType}`);

    // 6. Transactional Update
    console.log("[Webhook] Starting transaction block...");
    await prisma.$transaction(async (tx) => {

      // A. Premium Logic
      if (packageType === "gold" || packageType === "platinum") {
        console.log(`[Webhook] Processing premium package: ${packageType}`);
        const globalLinks = await tx.setting.findMany({
          where: { key: { in: ["chatbot_link_gold", "chatbot_link_platinum"] } },
          select: { key: true, value: true }
        });
        const linksMap = new Map(globalLinks.map(s => [s.key, s.value]));

        const dedicatedLink = packageType === "gold"
          ? linksMap.get("chatbot_link_gold")
          : linksMap.get("chatbot_link_platinum");

        const msg = dedicatedLink
          ? `✅ Đã bàn giao Link ${packageType.toUpperCase()}: ${dedicatedLink}`
          : `⚠️ Gói ${packageType.toUpperCase()} chưa có link bàn giao riêng.`;

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes ? `${order.notes}\n\n${msg}` : msg
          },
          select: { id: true } // CRITICAL: Only return ID to avoid missing columns
        });
        console.log("[Webhook] Premium order updated");
        return;
      }

      // B. Standard Logic
      console.log("[Webhook] Processing standard activation code...");
      const available = await tx.chatbotInventory.findFirst({
        where: { serviceId: order.serviceId, isUsed: false },
        orderBy: { createdAt: "asc" },
        select: { id: true, activationCode: true }
      });

      const count = await tx.chatbotInventory.count({
        where: { serviceId: order.serviceId }
      });

      const isShared = count === 1;

      if (available) {
        if (!isShared) {
          await tx.chatbotInventory.update({
            where: { id: available.id },
            data: { isUsed: true, orderId: order.id },
            select: { id: true } // CRITICAL: Only return ID
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n✅ Đã bàn giao: ${available.activationCode}`
              : `✅ Đã bàn giao: ${available.activationCode}`
          },
          select: { id: true } // CRITICAL: Only return ID
        });
        console.log("[Webhook] Standard order updated with code");
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes
              ? `${order.notes}\n\n⚠️ Không có sẵn mã để bàn giao.`
              : `⚠️ Không có sẵn mã để bàn giao.`
          },
          select: { id: true } // CRITICAL: Only return ID
        });
        console.log("[Webhook] Standard order confirmed without code");
      }
    });

    // 7. Auto-Account Logic (Non-blocking but safe-selected)
    try {
      if (order.customerEmail && order.customerEmail.trim()) {
        console.log("[Webhook] Checking auto-account for:", order.customerEmail);
        const existing = await prisma.user.findFirst({
          where: { email: order.customerEmail },
          select: { id: true }
        });

        if (!existing) {
          console.log("[Webhook] Creating account...");
          const adminSupabase = createAdminSupabaseClient();
          if (adminSupabase) {
            const { data: auth, error: authErr } = await adminSupabase.auth.admin.createUser({
              email: order.customerEmail,
              password: order.customerPhone || "Aa123456",
              email_confirm: true,
              user_metadata: { name: order.customerName, role: "customer" }
            });

            if (authErr) {
              console.error("[Webhook] Auth Error:", authErr.message);
            } else if (auth?.user) {
              await prisma.user.create({
                data: {
                  id: auth.user.id,
                  email: order.customerEmail,
                  name: order.customerName,
                  phone: order.customerPhone,
                  role: "customer",
                  password: ""
                },
                select: { id: true } // CRITICAL: Only return ID
              });
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  notes: `${order.notes || ""}\n\n🔑 Đã tạo tài khoản: ${order.customerEmail} / ${order.customerPhone || "Aa123456"}`
                },
                select: { id: true } // CRITICAL: Only return ID
              });
              console.log("[Webhook] Auto-account created");
            }
          }
        }
      }
    } catch (err: any) {
      console.error("[Webhook] Auto-account error (ignored):", err.message);
    }

    console.log(`[Webhook] SUCCESS: Order ${orderCode} finished`);
    
    // 8. Tính commission cho CTV/Đại lý nếu có referrer
    try {
      const orderWithReferrer = await prisma.order.findUnique({
        where: { id: order.id },
        select: { id: true, referrerId: true }
      });
      
      if (orderWithReferrer?.referrerId) {
        console.log(`[Webhook] Calculating commission for order ${orderCode}...`);
        const commissions = await calculateAndCreateCommissions(order.id);
        console.log(`[Webhook] Created ${commissions.length} commission(s)`);
      }
    } catch (commErr: any) {
      console.error("[Webhook] Commission calculation error (non-blocking):", commErr.message);
    }
    
    return NextResponse.json({
      success: true,
      message: `Order ${orderCode} confirmed`,
      data: { orderCode, packageType }
    });

  } catch (error: any) {
    console.error("[Webhook] CRITICAL ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Lỗi hệ thống khi xử lý thanh toán",
      error: error.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: "Active" });
}
