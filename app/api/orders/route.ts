import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

// Generate order code inline (no external call)
function generateOrderCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VS${dateStr}${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");
    const phone = searchParams.get("phone");

    // Guest lookup
    if (orderCode && phone) {
      const order = await prisma.order.findFirst({
        where: { orderCode, customerPhone: phone },
        select: {
          id: true,
          orderCode: true,
          customerName: true,
          customerPhone: true,
          status: true,
          totalPrice: true,
          quantity: true,
          createdAt: true,
          notes: true,
          service: { select: { id: true, name: true } },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    // Admin/CTV access
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = searchParams.get("status");
    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    
    // CTV chỉ xem đơn hàng của khách mình giới thiệu
    if (user.role === "ctv" || user.role === "collaborator") {
      where.referrerId = user.id;
    } else if (user.role === "staff") {
      where.assignedToId = user.id;
    }
    // Admin xem tất cả (không filter)
    
    console.log("Orders filter - User:", user.email, "Role:", user.role, "Where:", where);

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        status: true,
        totalPrice: true,
        quantity: true,
        notes: true,
        referralCode: true,
        scheduledDate: true,
        scheduledTime: true,
        createdAt: true,
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, phone, email, notes, items, referralCode } = body;

    const finalPhone = customerPhone || phone;

    if (!customerName || !finalPhone) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên và số điện thoại" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Vui lòng nhập email để nhận tài khoản quản lý ChatBot" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Vui lòng chọn ít nhất 1 sản phẩm" }, { status: 400 });
    }

    // Get products from cache or DB
    let products = getCache<{ id: string; name: string; price: number }[]>("products_map");
    
    if (!products) {
      const dbProducts = await prisma.service.findMany({
        where: { active: true },
        select: { id: true, name: true, price: true },
      });
      products = dbProducts;
      setCache("products_map", products, 300);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate total
    let totalPrice = 0;
    let totalQuantity = 0;
    const details: string[] = [];

    for (const item of items) {
      const product = productMap.get(item.serviceId);
      if (!product) {
        return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 400 });
      }
      totalPrice += product.price * item.quantity;
      totalQuantity += item.quantity;
      details.push(`${product.name} x${item.quantity}`);
    }

    const mainProduct = productMap.get(items[0].serviceId);
    const orderCode = generateOrderCode();

    // Find referrer if referral code provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referralLink = await prisma.referralLink.findUnique({
        where: { code: referralCode },
        select: { userId: true },
      });
      if (referralLink) {
        referrerId = referralLink.userId;
      }
    }

    // Single insert query - Tài khoản sẽ được tạo sau khi thanh toán thành công
    const order = await prisma.order.create({
      data: {
        orderCode,
        serviceId: items[0].serviceId,
        quantity: totalQuantity,
        unit: "bot",
        customerName,
        customerPhone: finalPhone,
        customerEmail: email,
        address: "Online",
        district: "Online",
        scheduledDate: new Date(),
        scheduledTime: "Giao ngay",
        notes: notes ? `${notes}\n---\n${details.join(", ")}` : details.join(", "),
        basePrice: mainProduct?.price || 29000,
        totalPrice,
        status: "pending",
        referralCode: referralCode || null,
        referrerId: referrerId,
      },
      select: {
        id: true,
        orderCode: true,
        totalPrice: true,
        status: true,
        customerEmail: true,
        service: { select: { name: true } },
      },
    });

    // Note: Referral stats (orderCount, revenue) sẽ được cập nhật 
    // khi đơn hàng được xác nhận thanh toán, không phải khi tạo đơn

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Lỗi tạo đơn hàng" }, { status: 500 });
  }
}
