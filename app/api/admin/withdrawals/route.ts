import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Admin xem tất cả yêu cầu rút tiền
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const isAdminUser = user?.role === "admin" || user?.email === "admin@admin.com";
    
    if (!user || !isAdminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, phone: true, balance: true }
        },
        processor: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Thống kê
    const stats = await prisma.withdrawal.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: true
    });

    const statsMap = stats.reduce((acc, s) => {
      acc[s.status] = { amount: s._sum.amount || 0, count: s._count };
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return NextResponse.json({
      withdrawals,
      stats: {
        pending: statsMap.pending || { amount: 0, count: 0 },
        approved: statsMap.approved || { amount: 0, count: 0 },
        paid: statsMap.paid || { amount: 0, count: 0 },
        rejected: statsMap.rejected || { amount: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error("[Admin Withdrawals GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Admin xử lý yêu cầu rút tiền
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    const isAdminUser = user?.role === "admin" || user?.email === "admin@admin.com";
    
    if (!user || !isAdminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { withdrawalId, action, adminNote } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Yêu cầu này đã được xử lý" }, { status: 400 });
    }

    if (action === "approve") {
      // Duyệt yêu cầu
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "approved",
          adminNote,
          processedBy: user.id,
          processedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Đã duyệt yêu cầu rút tiền"
      });
    }

    if (action === "mark_paid") {
      // Đánh dấu đã thanh toán
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "paid",
          adminNote,
          processedBy: user.id,
          processedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Đã đánh dấu thanh toán thành công"
      });
    }

    if (action === "reject") {
      // Từ chối và hoàn tiền vào balance
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "rejected",
            adminNote,
            processedBy: user.id,
            processedAt: new Date()
          }
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: "Đã từ chối yêu cầu và hoàn tiền vào số dư"
      });
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("[Admin Withdrawals POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
