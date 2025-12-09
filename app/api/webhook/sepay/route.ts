import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// SePay API Key - đặt trong Environment Variables
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || "";

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
    // Verify SePay authorization
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Apikey ", "");
    
    if (SEPAY_API_KEY && token !== SEPAY_API_KEY) {
      console.log("Invalid SePay API key");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
    
    // Find order
    const order = await prisma.order.findUnique({
      where: { orderCode },
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

    // Update order status to confirmed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "confirmed",
        notes: order.notes 
          ? `${order.notes}\n\n✅ Đã thanh toán ${transaction.transferAmount.toLocaleString('vi-VN')}đ qua ${transaction.gateway} lúc ${transaction.transactionDate}${!isAmountMatch ? ' (Số tiền không khớp)' : ''}`
          : `✅ Đã thanh toán ${transaction.transferAmount.toLocaleString('vi-VN')}đ qua ${transaction.gateway} lúc ${transaction.transactionDate}${!isAmountMatch ? ' (Số tiền không khớp)' : ''}`,
      },
    });

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

