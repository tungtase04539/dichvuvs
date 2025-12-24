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
      include: {
        service: true,
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

    // Return chatbot data (new system)
    if (order.chatbotData) {
      return NextResponse.json({
        order: {
          orderCode: order.orderCode,
          status: order.status,
          service: order.service.name,
        },
        credential: {
          chatbotLink: order.chatbotData.chatbotLink,
          activationCode: order.chatbotData.activationCode,
          accountInfo: order.chatbotData.chatbotLink,
          password: order.chatbotData.activationCode,
          notes: order.notes,
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
        },
      });
    }

    return NextResponse.json({
      order: {
        orderCode: order.orderCode,
        status: order.status,
        service: order.service.name,
      },
      message: "Tài khoản đang được chuẩn bị, vui lòng liên hệ hỗ trợ hoặc chờ trong giây lát",
      credential: null,
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
