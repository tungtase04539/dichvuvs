import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCommissionStats } from "@/lib/commission";

export const dynamic = "force-dynamic";

// GET - Lấy thống kê cho CTV/Agent
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["collaborator", "ctv", "agent", "master_agent", "admin"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Lấy thống kê commission
    const commissionStats = await getCommissionStats(user.id);

    // Lấy user info với balance
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true }
    });

    // Đơn hàng tháng này
    const ordersThisMonth = await prisma.order.aggregate({
      where: {
        referrerId: user.id,
        createdAt: { gte: startOfMonth },
        status: { in: ["confirmed", "completed"] }
      },
      _sum: { totalPrice: true },
      _count: true
    });

    // Đơn hàng tháng trước
    const ordersLastMonth = await prisma.order.aggregate({
      where: {
        referrerId: user.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { in: ["confirmed", "completed"] }
      },
      _sum: { totalPrice: true },
      _count: true
    });

    // Tổng đơn hàng
    const totalOrders = await prisma.order.aggregate({
      where: {
        referrerId: user.id,
        status: { in: ["confirmed", "completed"] }
      },
      _sum: { totalPrice: true },
      _count: true
    });

    // Đơn hàng pending
    const pendingOrders = await prisma.order.count({
      where: {
        referrerId: user.id,
        status: "pending"
      }
    });

    // Referral link stats
    const referralLinks = await prisma.referralLink.findMany({
      where: { userId: user.id },
      select: {
        code: true,
        clickCount: true,
        orderCount: true,
        revenue: true
      }
    });

    const totalClicks = referralLinks.reduce((sum, link) => sum + link.clickCount, 0);
    const conversionRate = totalClicks > 0 
      ? Math.round((totalOrders._count / totalClicks) * 100) 
      : 0;

    // Số thành viên đội nhóm (nếu là Agent/Master Agent)
    const teamCount = await prisma.user.count({
      where: { parentId: user.id }
    });

    // Commission từ đội nhóm (level > 1)
    const teamCommission = await prisma.commission.aggregate({
      where: {
        userId: user.id,
        level: { gt: 1 }
      },
      _sum: { amount: true }
    });

    return NextResponse.json({
      balance: userInfo?.balance || 0,
      commission: commissionStats,
      thisMonth: {
        orders: ordersThisMonth._count,
        revenue: ordersThisMonth._sum.totalPrice || 0
      },
      lastMonth: {
        orders: ordersLastMonth._count,
        revenue: ordersLastMonth._sum.totalPrice || 0
      },
      total: {
        orders: totalOrders._count,
        revenue: totalOrders._sum.totalPrice || 0
      },
      pendingOrders,
      referral: {
        links: referralLinks,
        totalClicks,
        conversionRate
      },
      team: {
        count: teamCount,
        commission: teamCommission._sum.amount || 0
      }
    });
  } catch (error) {
    console.error("[CTV Stats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
