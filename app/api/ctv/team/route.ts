import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTeamMembers } from "@/lib/commission";

export const dynamic = "force-dynamic";

// GET - Lấy danh sách đội nhóm (cấp dưới)
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Chỉ Agent và Master Agent mới có đội nhóm
    const allowedRoles = ["agent", "master_agent", "admin"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ 
        members: [],
        message: "Chỉ Đại lý và Tổng đại lý mới có đội nhóm" 
      });
    }

    const members = await getTeamMembers(user.id);

    // Tính tổng doanh số và commission từ đội nhóm
    const teamStats = await prisma.commission.aggregate({
      where: {
        userId: user.id,
        level: { gt: 1 } // Override commission từ cấp dưới
      },
      _sum: { amount: true },
      _count: true
    });

    // Lấy thêm cấp dưới của cấp dưới (nếu là Master Agent)
    let subTeamCount = 0;
    if (user.role === "master_agent") {
      const memberIds = members.map(m => m.id);
      subTeamCount = await prisma.user.count({
        where: { parentId: { in: memberIds } }
      });
    }

    return NextResponse.json({
      members,
      stats: {
        directCount: members.length,
        subTeamCount,
        totalCommission: teamStats._sum.amount || 0,
        commissionCount: teamStats._count
      }
    });
  } catch (error) {
    console.error("[CTV Team] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
