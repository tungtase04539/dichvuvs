import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Guest lookup
    if (orderCode && phone) {
      const { data: order, error } = await supabase
        .from("Order")
        .select(`
          id, orderCode, customerName, customerPhone, status, 
          totalPrice, quantity, createdAt, notes, serviceId
        `)
        .eq("orderCode", orderCode)
        .eq("customerPhone", phone)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
      }

      // Get service name
      const { data: service } = await supabase
        .from("Service")
        .select("id, name")
        .eq("id", order.serviceId)
        .single();

      return NextResponse.json({
        order: { ...order, service: service || { name: "ChatBot" } }
      });
    }

    // Admin/CTV access - Get user from Supabase auth directly
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role from database
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, email, role")
      .eq("email", authUser.email)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const status = searchParams.get("status");

    let query = supabase
      .from("Order")
      .select(`
        id, orderCode, customerName, customerPhone, customerEmail,
        status, totalPrice, quantity, notes, referralCode,
        scheduledDate, scheduledTime, createdAt, serviceId, referrerId
      `)
      .order("createdAt", { ascending: false })
      .limit(200);

    // Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Nhân viên chỉ xem đơn hàng được gán cho mình
    if (dbUser.role === "staff") {
      query = query.eq("assignedToId", dbUser.id);
    }
    // Admin xem tất cả (không filter thêm)

    const { data: orders, error } = await query;

    if (error) {
      console.error("Get orders error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get service names for all orders
    const serviceIds = Array.from(new Set((orders || []).map(o => o.serviceId)));
    const { data: services } = await supabase
      .from("Service")
      .select("id, name")
      .in("id", serviceIds);

    const serviceMap = new Map((services || []).map(s => [s.id, s]));

    const ordersWithService = (orders || []).map(order => ({
      ...order,
      service: serviceMap.get(order.serviceId) || { name: "ChatBot" }
    }));

    return NextResponse.json({ orders: ordersWithService, total: ordersWithService.length });
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

    // Referral features are disabled in this MVP
    const referrerId = null;
    const finalReferralCode = null;

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
        referralCode: finalReferralCode,
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
