import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Admin xem tất cả commission
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, phone: true }
          },
          order: {
            select: {
              id: true,
              orderCode: true,
              customerName: true,
              totalPrice: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.commission.count({ where })
    ]);

    // Thống kê tổng
    const [pendingSum, paidSum] = await Promise.all([
      prisma.commission.aggregate({
        where: { status: "pending" },
        _sum: { amount: true },
        _count: true
      }),
      prisma.commission.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
        _count: true
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
        pending: {
          amount: pendingSum._sum.amount || 0,
          count: pendingSum._count
        },
        paid: {
          amount: paidSum._sum.amount || 0,
          count: paidSum._count
        }
      }
    });
  } catch (error) {
    console.error("[Admin Commissions GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Admin đánh dấu commission đã thanh toán
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { commissionIds, action } = body;

    if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json({ error: "Vui lòng chọn commission" }, { status: 400 });
    }

    if (action === "mark_paid") {
      await prisma.commission.updateMany({
        where: { id: { in: commissionIds }, status: "pending" },
        data: { status: "paid", updatedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        message: `Đã đánh dấu ${commissionIds.length} commission là đã thanh toán`
      });
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("[Admin Commissions POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
