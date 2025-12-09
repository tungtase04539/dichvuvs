import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");
    const phone = searchParams.get("phone");

    // Guest lookup by order code and phone
    if (orderCode && phone) {
      const order = await prisma.order.findFirst({
        where: {
          orderCode,
          customerPhone: phone,
        },
        include: {
          service: true,
          assignedTo: {
            select: { id: true, name: true, phone: true },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Không tìm thấy đơn hàng" },
          { status: 404 }
        );
      }

      return NextResponse.json({ order });
    }

    // Admin/staff access - get all orders
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (user.role === "staff") {
      where.assignedToId = user.id;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: true,
          assignedTo: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      quantity,
      customerName,
      customerPhone,
      customerEmail,
      address,
      district,
      scheduledDate,
      scheduledTime,
      notes,
      basePrice,
      totalPrice,
      unit,
    } = body;

    // Validation
    if (!serviceId || !customerName || !customerPhone || !address || !district) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Vui lòng chọn thời gian thực hiện" },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Dịch vụ không tồn tại" },
        { status: 400 }
      );
    }

    // Generate unique order code
    let orderCode = generateOrderCode();
    let existingOrder = await prisma.order.findUnique({ where: { orderCode } });
    while (existingOrder) {
      orderCode = generateOrderCode();
      existingOrder = await prisma.order.findUnique({ where: { orderCode } });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderCode,
        serviceId,
        quantity: parseFloat(quantity) || 1,
        unit: unit || service.unit,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        address,
        district,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        notes: notes || null,
        basePrice: basePrice || service.price,
        totalPrice: totalPrice || service.price * (parseFloat(quantity) || 1),
        status: "pending",
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

