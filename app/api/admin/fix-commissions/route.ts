import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateAndCreateCommissions } from "@/lib/commission";

export const dynamic = "force-dynamic";

// POST - Tính commission cho các đơn hàng đã confirmed nhưng chưa có commission
export async function POST() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tìm các đơn hàng confirmed có referrer nhưng chưa có commission
    const ordersWithoutCommission = await prisma.order.findMany({
      where: {
        status: { in: ["confirmed", "completed"] },
        referrerId: { not: null },
        commissions: { none: {} }
      },
      select: {
        id: true,
        orderCode: true,
        totalPrice: true,
        referrerId: true,
        referrer: { select: { email: true, role: true } }
      }
    });

    console.log(`[Fix Commissions] Found ${ordersWithoutCommission.length} orders without commission`);

    const results = [];
    for (const order of ordersWithoutCommission) {
      try {
        const commissions = await calculateAndCreateCommissions(order.id);
        results.push({
          orderCode: order.orderCode,
          referrer: order.referrer?.email,
          commissionsCreated: commissions.length,
          commissions: commissions.map(c => ({
            user: c.userName,
            role: c.role,
            amount: c.amount,
            percent: c.percent
          }))
        });
        console.log(`[Fix Commissions] Created ${commissions.length} commission(s) for order ${order.orderCode}`);
      } catch (err: any) {
        results.push({
          orderCode: order.orderCode,
          error: err.message
        });
        console.error(`[Fix Commissions] Error for order ${order.orderCode}:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      totalOrders: ordersWithoutCommission.length,
      results
    });
  } catch (error: any) {
    console.error("[Fix Commissions] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Kiểm tra số đơn hàng cần fix
export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.order.count({
      where: {
        status: { in: ["confirmed", "completed"] },
        referrerId: { not: null },
        commissions: { none: {} }
      }
    });

    return NextResponse.json({
      ordersNeedingCommission: count
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
