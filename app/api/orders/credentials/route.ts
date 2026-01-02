import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Get credentials for an order (customer view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");
    const phone = searchParams.get("phone");

    if (!orderCode || !phone) {
      return NextResponse.json(
        { error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    // Find order and verify phone
    const order = await prisma.order.findFirst({
      where: {
        orderCode,
        customerPhone: phone,
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalPrice: true,
        notes: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            chatbotLink: true,
          }
        },
        credential: true,
        chatbotData: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Only show credentials for confirmed orders
    if (order.status !== "confirmed" && order.status !== "completed") {
      return NextResponse.json({
        order: {
          orderCode: order.orderCode,
          status: order.status,
          service: order.service.name,
        },
        message: "Đơn hàng chưa được thanh toán",
        credential: null,
      });
    }

    const isPremium = (order.notes || "").toLowerCase().includes("gold") ||
      (order.notes || "").toLowerCase().includes("platinum");

    // Return chatbot data (new system)
    if (order.chatbotData) {
      return NextResponse.json({
        order: {
          orderCode: order.orderCode,
          status: order.status,
          service: order.service.name,
        },
        credential: {
          chatbotLink: order.service.chatbotLink,
          activationCode: order.chatbotData.activationCode,
          accountInfo: order.service.chatbotLink,
          password: order.chatbotData.activationCode,
          notes: order.notes,
          isPremium,
        },
      });
    }

    // Return credentials (legacy system)
    if (order.credential) {
      return NextResponse.json({
        order: {
          orderCode: order.orderCode,
          status: order.status,
          service: order.service.name,
        },
        credential: {
          accountInfo: order.credential.accountInfo,
          password: order.credential.password,
          apiKey: order.credential.apiKey,
          notes: order.credential.notes,
          isPremium,
        },
      });
    }

    // Return fallback for confirmed orders without formal records (e.g. Premium packages where link is in notes)
    // Try to extract dedicated link from notes if it's a premium package
    let displayLink = order.service.chatbotLink || "Xem hướng dẫn bên dưới";
    const dedicatedLinkMatch = (order.notes || "").match(/✅ Đã bàn giao Link (?:GOLD|PLATINUM): (https?:\/\/\S+)/i);
    if (dedicatedLinkMatch && dedicatedLinkMatch[1]) {
      displayLink = dedicatedLinkMatch[1];
    }

    return NextResponse.json({
      order: {
        orderCode: order.orderCode,
        status: order.status,
        service: order.service.name,
      },
      credential: {
        accountInfo: displayLink,
        password: "Đã bàn giao",
        notes: order.notes || "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.",
        isPremium,
      },
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
