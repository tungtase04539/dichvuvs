import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Casso webhook secret key - đặt trong Environment Variables
const CASSO_SECRET = process.env.CASSO_SECRET_KEY || "";

interface CassoTransaction {
  id: number;
  tid: string;
  description: string;
  amount: number;
  cusum_balance: number;
  when: string;
  bank_sub_acc_id: string;
  subAccId: string;
  virtualAccount: string;
  virtualAccountName: string;
  corresponsiveName: string;
  corresponsiveAccount: string;
  corresponsiveBankId: string;
  corresponsiveBankName: string;
}

interface CassoWebhookPayload {
  error: number;
  data: CassoTransaction[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify Casso signature
    const signature = request.headers.get("secure-token");
    
    if (CASSO_SECRET && signature !== CASSO_SECRET) {
      console.log("Invalid Casso signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: CassoWebhookPayload = await request.json();
    
    if (payload.error !== 0 || !payload.data || payload.data.length === 0) {
      return NextResponse.json({ success: true, message: "No transactions" });
    }

    // Process each transaction
    for (const transaction of payload.data) {
      // Only process incoming transactions (positive amount)
      if (transaction.amount <= 0) continue;

      // Extract order code from description
      // Format: "VS241209XXXX" - mã đơn hàng
      const orderCodeMatch = transaction.description.match(/VS\d{6}[A-Z0-9]{4}/i);
      
      if (!orderCodeMatch) {
        console.log("No order code found in:", transaction.description);
        continue;
      }

      const orderCode = orderCodeMatch[0].toUpperCase();
      
      // Find order
      const order = await prisma.order.findUnique({
        where: { orderCode },
      });

      if (!order) {
        console.log("Order not found:", orderCode);
        continue;
      }

      // Check if payment amount matches (allow 1% tolerance)
      const tolerance = order.totalPrice * 0.01;
      const isAmountMatch = Math.abs(transaction.amount - order.totalPrice) <= tolerance;

      if (!isAmountMatch) {
        console.log(`Amount mismatch for ${orderCode}: expected ${order.totalPrice}, got ${transaction.amount}`);
        // Still update but with note
      }

      // Update order status to confirmed if pending
      if (order.status === "pending") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            notes: order.notes 
              ? `${order.notes}\n\n✅ Đã thanh toán ${transaction.amount.toLocaleString('vi-VN')}đ qua ${transaction.corresponsiveBankName || 'Chuyển khoản'} lúc ${transaction.when}`
              : `✅ Đã thanh toán ${transaction.amount.toLocaleString('vi-VN')}đ qua ${transaction.corresponsiveBankName || 'Chuyển khoản'} lúc ${transaction.when}`,
          },
        });

        console.log(`Order ${orderCode} confirmed with payment ${transaction.amount}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Casso webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Casso may send GET to verify endpoint
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Casso webhook endpoint" });
}

