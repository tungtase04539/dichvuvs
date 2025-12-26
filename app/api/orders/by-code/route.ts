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

    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        service: true,
        credential: true,
        chatbotData: true,
      },
    });

    if (!order) {
      // Return default order data if not found (for demo/fallback)
      return NextResponse.json({
        order: {
          orderCode,
          totalPrice: 29000,
          status: "pending",
          customerName: "Khách hàng",
          customerPhone: "",
        }
      });
    }

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

