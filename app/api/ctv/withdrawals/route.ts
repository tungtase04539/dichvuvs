import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Lấy danh sách yêu cầu rút tiền của user
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (status && status !== "all") {
      where.status = status;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        processor: {
          select: { name: true }
        }
      }
    });

    // Tính tổng theo status
    const stats = await prisma.withdrawal.groupBy({
      by: ["status"],
      where: { userId: user.id },
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
    console.error("[CTV Withdrawals GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Tạo yêu cầu rút tiền mới
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["collaborator", "ctv", "agent", "master_agent"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Không có quyền rút tiền" }, { status: 403 });
    }

    const body = await request.json();
    const { amount, bankName, bankAccount, bankHolder, note } = body;

    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }

    if (!bankName || !bankAccount || !bankHolder) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin ngân hàng" }, { status: 400 });
    }

    // Kiểm tra số dư
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true }
    });

    if (!userInfo || userInfo.balance < amount) {
      return NextResponse.json({ 
        error: `Số dư không đủ. Số dư hiện tại: ${(userInfo?.balance || 0).toLocaleString()}đ` 
      }, { status: 400 });
    }

    // Kiểm tra có yêu cầu pending không
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: user.id, status: "pending" }
    });

    if (pendingWithdrawal) {
      return NextResponse.json({ 
        error: "Bạn đang có yêu cầu rút tiền chờ xử lý. Vui lòng đợi admin duyệt." 
      }, { status: 400 });
    }

    // Tạo yêu cầu rút tiền
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        bankName,
        bankAccount,
        bankHolder,
        note,
        status: "pending"
      }
    });

    // Trừ số dư tạm thời (sẽ hoàn lại nếu bị reject)
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: amount } }
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      message: "Yêu cầu rút tiền đã được gửi. Vui lòng chờ admin xử lý."
    });
  } catch (error) {
    console.error("[CTV Withdrawals POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
