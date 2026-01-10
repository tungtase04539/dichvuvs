import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Lấy danh sách commission của CTV/Agent
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["collaborator", "ctv", "agent", "master_agent", "admin"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, paid, all
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status && status !== "all") {
      where.status = status;
    }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderCode: true,
              customerName: true,
              totalPrice: true,
              status: true,
              createdAt: true,
              service: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.commission.count({ where })
    ]);

    // Tính tổng theo status
    const [pendingSum, paidSum] = await Promise.all([
      prisma.commission.aggregate({
        where: { userId: user.id, status: "pending" },
        _sum: { amount: true }
      }),
      prisma.commission.aggregate({
        where: { userId: user.id, status: "paid" },
        _sum: { amount: true }
      })
    ]);

    return NextResponse.json({
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        pending: pendingSum._sum.amount || 0,
        paid: paidSum._sum.amount || 0,
        total: (pendingSum._sum.amount || 0) + (paidSum._sum.amount || 0)
      }
    });
  } catch (error) {
    console.error("[CTV Commissions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
