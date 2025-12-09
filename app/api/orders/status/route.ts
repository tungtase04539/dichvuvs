import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");

    if (!orderCode) {
      return NextResponse.json({ error: "Order code required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalPrice: true,
        customerName: true,
        notes: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Check order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

