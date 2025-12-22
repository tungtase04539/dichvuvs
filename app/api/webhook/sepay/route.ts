import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Find available credential for this service
    const availableCredential = await prisma.productCredential.findFirst({
      where: {
        serviceId: order.serviceId,
        isUsed: false,
      },
      orderBy: { createdAt: "asc" }, // First in, first out
    });

    // Update order status to confirmed and assign credential
    const updateData: Record<string, unknown> = {
      status: "confirmed",
      notes: order.notes
        ? `${order.notes}\n\n✅ Đã thanh toán ${transaction.transferAmount.toLocaleString('vi-VN')}đ qua ${transaction.gateway} lúc ${transaction.transactionDate}${!isAmountMatch ? ' (Số tiền không khớp)' : ''}`
        : `✅ Đã thanh toán ${transaction.transferAmount.toLocaleString('vi-VN')}đ qua ${transaction.gateway} lúc ${transaction.transactionDate}${!isAmountMatch ? ' (Số tiền không khớp)' : ''}`,
    };

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    // --- LOGIC HOA HỒNG CTV/ĐẠI LÝ ---
    if (order.referrerId) {
      try {
        const referrer = await prisma.user.findUnique({
          where: { id: order.referrerId },
        });

        if (referrer) {
          let directCommissionPercent = 0;
          let indirectCommissionPercent = 0;
          let agentIdToCredit = null;

          // Xác định % dựa trên role (Phương án A)
          if (referrer.role === "ctv" || referrer.role === "collaborator") {
            directCommissionPercent = 15; // CTV hưởng 15%

            // Tìm cấp trên của CTV (nếu có) để hưởng hoa hồng chênh lệch
            if (referrer.parentId) {
              const parent = await prisma.user.findUnique({
                where: { id: referrer.parentId }
              });
              if (parent && parent.role === "agent") {
                agentIdToCredit = parent.id;
                indirectCommissionPercent = 5; // Đại lý hưởng 5% từ CTV
              }
            }
          } else if (referrer.role === "agent") {
            directCommissionPercent = 20; // Đại lý tự bán hưởng 20%
          }

          // 1. Cộng tiền cho người giới thiệu trực tiếp
          if (directCommissionPercent > 0) {
            const amount = (order.totalPrice * directCommissionPercent) / 100;
            await prisma.user.update({
              where: { id: referrer.id },
              data: { balance: { increment: amount } }
            });

            await prisma.commission.create({
              data: {
                orderId: order.id,
                userId: referrer.id,
                amount: amount,
                percent: directCommissionPercent,
                level: 1,
                status: "paid"
              }
            });
          }

          // 2. Cộng tiền cho Đại lý cấp trên (nếu có)
          if (agentIdToCredit && indirectCommissionPercent > 0) {
            const amount = (order.totalPrice * indirectCommissionPercent) / 100;
            await prisma.user.update({
              where: { id: agentIdToCredit },
              data: { balance: { increment: amount } }
            });

            await prisma.commission.create({
              data: {
                orderId: order.id,
                userId: agentIdToCredit,
                amount: amount,
                percent: indirectCommissionPercent,
                level: 2,
                status: "paid"
              }
            });
          }

          // 3. Cập nhật thống kê Link Referral
          if (order.referralCode) {
            await prisma.referralLink.update({
              where: { code: order.referralCode },
              data: {
                orderCount: { increment: 1 },
                revenue: { increment: order.totalPrice }
              }
            });
          }
        }
      } catch (commissionError) {
        console.error("Commission calculation failed:", commissionError);
        // Không block flow chính nếu lỗi tính hoa hồng
      }
    }
    // --------------------------------

    // Assign credential if available
    if (availableCredential) {
      await prisma.productCredential.update({
        where: { id: availableCredential.id },
        data: {
          isUsed: true,
          orderId: order.id,
        },
      });
      console.log(`✅ Credential assigned to order ${orderCode}`);
    } else {
      console.log(`⚠️ No credential available for service ${order.service.name}`);
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
