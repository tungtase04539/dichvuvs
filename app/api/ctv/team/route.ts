import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Lấy danh sách đội nhóm (cấp dưới trực tiếp)
// Quy tắc hiển thị:
// - Đại lý: Chỉ thấy CTV trực thuộc (không thấy khách của CTV)
// - NPP: Thấy Đại lý + CTV trực thuộc (không thấy khách của cấp dưới)
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Chỉ Agent, Distributor và Master Agent mới có đội nhóm
    const allowedRoles = ["agent", "distributor", "master_agent", "admin"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ 
        members: [],
        message: "Chỉ Đại lý và Nhà phân phối mới có đội nhóm" 
      });
    }

    // Lấy cấp dưới trực tiếp
    const directMembers = await prisma.user.findMany({
      where: { parentId: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            referredOrders: true,
            subAgents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Lấy thống kê doanh số cho từng member (chỉ đơn trực tiếp của họ)
    const membersWithStats = await Promise.all(
      directMembers.map(async (member) => {
        const orderStats = await prisma.order.aggregate({
          where: { 
            referrerId: member.id,
            status: { in: ['confirmed', 'completed'] }
          },
          _sum: { totalPrice: true },
          _count: true
        });

        return {
          ...member,
          totalOrders: orderStats._count,
          totalRevenue: orderStats._sum.totalPrice || 0
        };
      })
    );

    // Tính tổng commission override từ đội nhóm
    const teamCommission = await prisma.commission.aggregate({
      where: {
        userId: user.id,
        level: { gt: 1 } // Override commission từ cấp dưới
      },
      _sum: { amount: true },
      _count: true
    });

    // Nếu là NPP/Master Agent, lấy thêm số lượng cấp dưới của Đại lý
    let subTeamCount = 0;
    if (user.role === "distributor" || user.role === "master_agent") {
      const agentIds = directMembers
        .filter(m => m.role === "agent")
        .map(m => m.id);
      
      if (agentIds.length > 0) {
        subTeamCount = await prisma.user.count({
          where: { parentId: { in: agentIds } }
        });
      }
    }

    // Kiểm tra điều kiện nhận override
    const minSubAgentsRequired = 3;
    const isEligibleForOverride = directMembers.length >= minSubAgentsRequired;

    return NextResponse.json({
      members: membersWithStats,
      stats: {
        directCount: directMembers.length,
        subTeamCount,
        totalCommission: teamCommission._sum.amount || 0,
        commissionCount: teamCommission._count,
        isEligibleForOverride,
        minSubAgentsRequired
      }
    });
  } catch (error) {
    console.error("[CTV Team] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
