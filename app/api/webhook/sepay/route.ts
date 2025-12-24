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

    // Find available chatbot data for this service
    const availableChatbot = await prisma.chatbotInventory.findFirst({
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

    // --- LOGIC HOA HỒNG (DORMANT - GIỮ LẠI THEO YÊU CẦU) ---
    /*
    if (order.referrerId) {
      // 1. Tính hoa hồng cho người giới thiệu trực tiếp
      const commissionSettings = await prisma.commissionSetting.findMany();
      const directPercent = commissionSettings.find(s => s.key === "direct_referral")?.percent || 10;
      
      const directAmount = (order.totalPrice * directPercent) / 100;
      await prisma.commission.create({
        data: {
          orderId: order.id,
          userId: order.referrerId,
          amount: directAmount,
          percent: directPercent,
          level: 1,
          status: "pending"
        }
      });
      
      // Cập nhật số dư cho người giới thiệu
      await prisma.user.update({
        where: { id: order.referrerId },
        data: { balance: { increment: directAmount } }
      });

      // 2. Tính hoa hồng tầng cho cấp trên (nếu có)
      const referrer = await prisma.user.findUnique({
        where: { id: order.referrerId },
        select: { parentId: true }
      });

      if (referrer?.parentId) {
        const overridePercent = commissionSettings.find(s => s.key === "override_referral")?.percent || 5;
        const overrideAmount = (order.totalPrice * overridePercent) / 100;
        
        await prisma.commission.create({
          data: {
            orderId: order.id,
            userId: referrer.parentId,
            amount: overrideAmount,
            percent: overridePercent,
            level: 2,
            status: "pending"
          }
        });

        await prisma.user.update({
          where: { id: referrer.parentId },
          data: { balance: { increment: overrideAmount } }
        });
      }
    }
    */
    // ---------------------------------------------------

    // Assign chatbot data if available
    if (availableChatbot) {
      await prisma.chatbotInventory.update({
        where: { id: availableChatbot.id },
        data: {
          isUsed: true,
          orderId: order.id,
        },
      });
      console.log(`✅ Chatbot data assigned to order ${orderCode}`);
    } else {
      console.log(`⚠️ No chatbot data available for service ${order.service.name}`);
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
