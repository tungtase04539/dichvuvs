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

    // Assign chatbot data if available
    if (availableChatbot) {
      // Use transaction to ensure both are updated or none
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
      // Just confirm order if no chatbot data (legacy or missing)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "confirmed",
          notes: order.notes
            ? `${order.notes}\n\n⚠️ Không có sẵn dữ liệu ChatBot để bàn giao tự động.`
            : `⚠️ Không có sẵn dữ liệu ChatBot để bàn giao tự động.`,
        },
      });
      console.log(`⚠️ No chatbot data available for service ${order.service.name} (ID: ${order.serviceId}) - Order ${orderCode} confirmed without delivery`);
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
