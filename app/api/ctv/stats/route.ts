import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Lấy thống kê cho CTV/Agent
export async function GET() {
  try {
    const user = await getSession();
    console.log("[CTV Stats] User from session:", user?.email, user?.id, user?.role);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["collaborator", "senior_collaborator", "agent", "distributor", "admin"];
    if (!allowedRoles.includes(user.role)) {
      console.log("[CTV Stats] Role not allowed:", user.role);
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    // Lấy user info với balance
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true }
    });

    // Lấy commission stats đơn giản
    const [pendingCommission, paidCommission, totalCommission] = await Promise.all([
      prisma.commission.aggregate({
        where: { userId: user.id, status: 'pending' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.commission.aggregate({
        where: { userId: user.id, status: 'paid' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.commission.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
        _count: true
      })
    ]);

    // Lấy orders stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [ordersThisMonth, totalOrders, pendingOrders] = await Promise.all([
      prisma.order.aggregate({
        where: {
          referrerId: user.id,
          createdAt: { gte: startOfMonth },
          status: { in: ["confirmed", "completed"] }
        },
        _sum: { totalPrice: true },
        _count: true
      }),
      prisma.order.aggregate({
        where: {
          referrerId: user.id,
          status: { in: ["confirmed", "completed"] }
        },
        _sum: { totalPrice: true },
        _count: true
      }),
      prisma.order.count({
        where: { referrerId: user.id, status: "pending" }
      })
    ]);

    // Referral links
    const referralLinks = await prisma.referralLink.findMany({
      where: { userId: user.id },
      select: { code: true, clickCount: true, orderCount: true, revenue: true }
    });

    const totalClicks = referralLinks.reduce((sum, link) => sum + link.clickCount, 0);

    // Team count
    const teamCount = await prisma.user.count({
      where: { parentId: user.id }
    });

    return NextResponse.json({
      balance: userInfo?.balance || 0,
      commission: {
        pending: { amount: pendingCommission._sum.amount || 0, count: pendingCommission._count },
        paid: { amount: paidCommission._sum.amount || 0, count: paidCommission._count },
        total: { amount: totalCommission._sum.amount || 0, count: totalCommission._count }
      },
      thisMonth: {
        orders: ordersThisMonth._count,
        revenue: ordersThisMonth._sum.totalPrice || 0
      },
      lastMonth: { orders: 0, revenue: 0 },
      total: {
        orders: totalOrders._count,
        revenue: totalOrders._sum.totalPrice || 0
      },
      pendingOrders,
      referral: {
        links: referralLinks,
        totalClicks,
        conversionRate: totalClicks > 0 ? Math.round((totalOrders._count / totalClicks) * 100) : 0
      },
      team: { count: teamCount, commission: 0 }
    });
  } catch (error) {
    console.error("[CTV Stats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
