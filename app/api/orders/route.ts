import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
          service: { select: { id: true, name: true, icon: true } },
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
          service: { select: { id: true, name: true, icon: true } },
          assignedTo: { select: { id: true, name: true } },
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
      customerName,
      customerPhone,
      phone,
      email,
      notes,
      items,
    } = body;

    const finalPhone = customerPhone || phone;

    // Validation
    if (!customerName || !finalPhone) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ tên và số điện thoại" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất 1 sản phẩm" },
        { status: 400 }
      );
    }

    // Get all services in ONE query (optimized)
    const serviceIds = items.map((item: { serviceId: string }) => item.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, price: true },
    });

    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Calculate total
    let totalPrice = 0;
    let totalQuantity = 0;
    const orderDetails: string[] = [];

    for (const item of items) {
      const service = serviceMap.get(item.serviceId);
      if (!service) {
        return NextResponse.json(
          { error: "Sản phẩm không tồn tại" },
          { status: 400 }
        );
      }
      totalPrice += service.price * item.quantity;
      totalQuantity += item.quantity;
      orderDetails.push(`${service.name} x${item.quantity}`);
    }

    // Generate order code (simple, no loop)
    const orderCode = generateOrderCode();

    // Get main service
    const mainService = serviceMap.get(items[0].serviceId);

    // Create order in ONE query
    const order = await prisma.order.create({
      data: {
        orderCode,
        serviceId: items[0].serviceId,
        quantity: totalQuantity,
        unit: "bot",
        customerName,
        customerPhone: finalPhone,
        customerEmail: email || null,
        address: "Online",
        district: "Online",
        scheduledDate: new Date(),
        scheduledTime: "Giao ngay",
        notes: notes ? `${notes}\n---\nChi tiết: ${orderDetails.join(", ")}` : `Chi tiết: ${orderDetails.join(", ")}`,
        basePrice: mainService?.price || 30000,
        totalPrice,
        status: "pending",
      },
      include: {
        service: { select: { id: true, name: true, icon: true } },
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
