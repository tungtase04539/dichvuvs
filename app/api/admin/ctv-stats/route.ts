import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Admin xem thống kê tổng quan CTV/Agent
export async function GET() {
  try {
    const user = await getSession();
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Đếm số lượng theo role
    const [ctvCount, agentCount, distributorCount] = await Promise.all([
      prisma.user.count({ where: { role: "collaborator" } }),
      prisma.user.count({ where: { role: "agent" } }),
      prisma.user.count({ where: { role: "distributor" } })
    ]);

    // Tổng commission pending
    const pendingCommission = await prisma.commission.aggregate({
      where: { status: "pending" },
      _sum: { amount: true },
      _count: true
    });

    // Tổng commission đã trả tháng này
    const paidThisMonth = await prisma.commission.aggregate({
      where: {
        status: "paid",
        updatedAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    });

    // Yêu cầu rút tiền pending
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { status: "pending" },
      _sum: { amount: true },
      _count: true
    });

    // Top 10 CTV/Agent theo doanh số tháng này
    const topPerformers = await prisma.order.groupBy({
      by: ["referrerId"],
      where: {
        referrerId: { not: null },
        status: { in: ["confirmed", "completed"] },
        createdAt: { gte: startOfMonth }
      },
      _sum: { totalPrice: true },
      _count: true,
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 10
    });

    // Lấy thông tin user cho top performers
    const performerIds = topPerformers.map(p => p.referrerId).filter(Boolean) as string[];
    const performerUsers = await prisma.user.findMany({
      where: { id: { in: performerIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    const performerMap = new Map(performerUsers.map(u => [u.id, u]));
    const topPerformersWithInfo = topPerformers.map(p => ({
      user: performerMap.get(p.referrerId!),
      orders: p._count,
      revenue: p._sum.totalPrice || 0
    }));

    // Đơn hàng từ referral tháng này
    const referralOrders = await prisma.order.aggregate({
      where: {
        referrerId: { not: null },
        createdAt: { gte: startOfMonth }
      },
      _sum: { totalPrice: true },
      _count: true
    });

    return NextResponse.json({
      partners: {
        ctv: ctvCount,
        agent: agentCount,
        distributor: distributorCount,
        total: ctvCount + agentCount + distributorCount
      },
      commission: {
        pending: {
          amount: pendingCommission._sum.amount || 0,
          count: pendingCommission._count
        },
        paidThisMonth: paidThisMonth._sum.amount || 0
      },
      withdrawals: {
        pending: {
          amount: pendingWithdrawals._sum.amount || 0,
          count: pendingWithdrawals._count
        }
      },
      referralOrders: {
        count: referralOrders._count,
        revenue: referralOrders._sum.totalPrice || 0
      },
      topPerformers: topPerformersWithInfo
    });
  } catch (error) {
    console.error("[Admin CTV Stats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
