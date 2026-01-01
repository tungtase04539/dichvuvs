import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("code");

    if (!orderCode) {
      return NextResponse.json({ error: "Missing order code" }, { status: 400 });
    }

    console.log(`[by-code] Searching for order code: "${orderCode}"`);
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        service: true,
        credential: true,
        chatbotData: true,
      },
    });

    if (!order) {
      console.warn(`[by-code] Order not found for code: "${orderCode}"`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.log(`[by-code] Order found: ${order.orderCode}, status: ${order.status}, total: ${order.totalPrice}`);

    // Unify delivery data for the frontend
    const deliveryData = order.chatbotData ? {
      chatbotLink: order.service.chatbotLink,
      activationCode: order.chatbotData.activationCode,
      accountInfo: order.service.chatbotLink,
      password: order.chatbotData.activationCode,
      notes: order.notes,
    } : order.credential;

    return NextResponse.json({
      order: {
        ...order,
        deliveryData // New unified field
      }
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

