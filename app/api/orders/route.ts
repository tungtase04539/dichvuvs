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
      console.error("[Orders GET] Supabase client initialization failed");
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
      console.warn("[Orders GET] No auth user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[Orders GET] Auth user:", authUser.email);

    // Get user role from database
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, email, role")
      .eq("email", authUser.email)
      .single();

    if (!dbUser) {
      console.error("[Orders GET] DB User not found for email:", authUser.email);
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    console.log("[Orders GET] DB User role:", dbUser.role);

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

    // CTV/Đại lý chỉ xem đơn hàng của mình (do mình giới thiệu)
    // Bao gồm: collaborator, ctv, senior_collaborator, agent
    if (["collaborator", "ctv", "senior_collaborator", "agent"].includes(dbUser.role)) {
      query = query.eq("referrerId", dbUser.id);
    }

    // NPP/Distributor xem đơn của mình và đội nhóm
    if (dbUser.role === "distributor" || dbUser.role === "master_agent") {
      // Lấy danh sách ID cấp dưới
      const { data: subUsers } = await supabase
        .from("User")
        .select("id")
        .eq("parentId", dbUser.id);
      
      const subIds = (subUsers || []).map(u => u.id);
      const allIds = [dbUser.id, ...subIds];
      
      query = query.in("referrerId", allIds);
    }

    // Admin xem tất cả (không filter thêm)

    const { data: orders, error } = await query;

    if (error) {
      console.error("[Orders GET] Supabase query error:", error);
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

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Vui lòng chọn ít nhất 1 sản phẩm" }, { status: 400 });
    }

    // Get products from cache or DB
    let products = getCache<any[]>("products_map");

    if (!products) {
      products = await prisma.service.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          price: true,
        },
      });
      setCache("products_map", products, 300);
    }

    // Fetch global package settings
    const globalSettings = await prisma.setting.findMany({
      where: { key: { in: ["price_gold", "price_platinum", "price_standard"] } }
    });
    const settingsMap = new Map(globalSettings.map(s => [s.key, s.value]));

    const priceGoldGlobal = parseFloat(settingsMap.get("price_gold") || "0");
    const pricePlatinumGlobal = parseFloat(settingsMap.get("price_platinum") || "0");
    const priceStandardGlobal = parseFloat(settingsMap.get("price_standard") || "0");

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

      // Determine price based on packageType
      let itemPrice = product.price;
      if (item.packageType === "gold") {
        itemPrice = priceGoldGlobal || product.price * 1.5;
      } else if (item.packageType === "platinum") {
        itemPrice = pricePlatinumGlobal || product.price * 2.5;
      } else if (item.packageType === "single") {
        // "single" = mua riêng, dùng giá gốc của sản phẩm
        itemPrice = product.price;
      } else {
        // "standard" = gói tiêu chuẩn
        itemPrice = priceStandardGlobal || product.price;
      }

      totalPrice += itemPrice * item.quantity;
      totalQuantity += item.quantity;
      details.push(`${product.name} (${item.packageType || "standard"}) x${item.quantity}`);
    }

    const mainItem = items[0];
    const mainProduct = productMap.get(mainItem.serviceId);

    let mainBasePrice = mainProduct?.price || 29000;
    if (mainItem.packageType === "gold") {
      mainBasePrice = priceGoldGlobal || mainBasePrice * 1.5;
    } else if (mainItem.packageType === "platinum") {
      mainBasePrice = pricePlatinumGlobal || mainBasePrice * 2.5;
    } else if (mainItem.packageType === "single") {
      // "single" = mua riêng, giữ nguyên giá gốc
      mainBasePrice = mainProduct?.price || 29000;
    } else {
      // "standard" = gói tiêu chuẩn
      mainBasePrice = priceStandardGlobal || mainBasePrice;
    }

    const orderCode = generateOrderCode();

    // 4. Referral tracking logic
    let referrerId = null;
    let finalReferralCode = referralCode || null;

    if (finalReferralCode) {
      try {
        const refLink = await prisma.referralLink.findUnique({
          where: { code: finalReferralCode }
        });
        if (refLink) {
          referrerId = refLink.userId;
          console.log(`[Orders POST] Referral link found. Referrer: ${referrerId}`);

          // Increment order count and revenue
          await prisma.referralLink.update({
            where: { id: refLink.id },
            data: {
              orderCount: { increment: 1 },
              revenue: { increment: totalPrice }
            }
          });
        } else {
          console.warn(`[Orders POST] Referral code ${finalReferralCode} not found.`);
          finalReferralCode = null;
        }
      } catch (e) {
        console.error("[Orders POST] Referral lookup error:", e);
      }
    }

    console.log("Creating order with data:", {
      customerName,
      customerPhone: finalPhone,
      totalPrice,
      packageType: mainItem.packageType
    });

    let order;
    try {
      console.log("[Orders POST] Attempting primary creation with orderPackageType...");
      order = await prisma.order.create({
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
          notes: notes
            ? `${notes}\n---\n[Package: ${mainItem.packageType || 'standard'}]\n---\n${details.join(", ")}`
            : `[Package: ${mainItem.packageType || 'standard'}]\n---\n${details.join(", ")}`,
          basePrice: mainBasePrice,
          totalPrice,
          status: "pending",
          orderPackageType: mainItem.packageType || "standard",
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
      console.log("[Orders POST] Primary order creation successful:", order.orderCode);
    } catch (createError: any) {
      console.warn("[Orders POST] Primary order creation failed:", createError.message);
      if (createError.code === 'P2021') {
        console.warn("[Orders POST] Table 'Order' does not exist according to Prisma");
      }

      console.log("[Orders POST] Trying fallback without orderPackageType...");
      // Fallback: Try without the new field in case DB is not updated
      try {
        order = await prisma.order.create({
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
            notes: notes
              ? `${notes}\n---\n[Package: ${mainItem.packageType || 'standard'}]\n---\n${details.join(", ")}`
              : `[Package: ${mainItem.packageType || 'standard'}]\n---\n${details.join(", ")}`,
            basePrice: mainBasePrice,
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
        console.log("[Orders POST] Fallback order creation successful:", order.orderCode);
      } catch (fallbackError: any) {
        console.error("[Orders POST] Fallback order creation ALSO failed:", fallbackError.message);
        throw fallbackError; // Re-throw to be caught by final catch
      }
    }

    console.log("Order created successfully:", order.orderCode);

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Create order error full:", error);
    return NextResponse.json({
      error: "Lỗi tạo đơn hàng",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}
