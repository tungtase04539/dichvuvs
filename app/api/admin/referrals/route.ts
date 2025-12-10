import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Get all referrals (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [referralLinks, total] = await Promise.all([
      prisma.referralLink.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              parent: {
                select: { name: true, email: true },
              },
            },
          },
          _count: {
            select: { clicks: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.referralLink.count(),
    ]);

    // Get overall stats
    const stats = await prisma.referralLink.aggregate({
      _sum: {
        clickCount: true,
        orderCount: true,
        revenue: true,
      },
    });

    // Get top performers
    const topPerformers = await prisma.referralLink.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { revenue: "desc" },
      take: 5,
    });

    return NextResponse.json({
      referralLinks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalClicks: stats._sum.clickCount || 0,
        totalOrders: stats._sum.orderCount || 0,
        totalRevenue: stats._sum.revenue || 0,
      },
      topPerformers,
    });
  } catch (error) {
    console.error("Get all referrals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create referral for any user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Thiếu thông tin user" }, { status: 400 });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });
    }

    // Check if already has referral link
    const existingLink = await prisma.referralLink.findFirst({
      where: { userId, isActive: true },
    });

    if (existingLink) {
      return NextResponse.json({
        referralLink: existingLink,
        message: "User đã có mã giới thiệu",
      });
    }

    // Generate unique code
    let code: string;
    let attempts = 0;
    do {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      code = "REF-";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const exists = await prisma.referralLink.findUnique({ where: { code } });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json({ error: "Không thể tạo mã" }, { status: 500 });
    }

    const referralLink = await prisma.referralLink.create({
      data: {
        code: code!,
        userId,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ referralLink });
  } catch (error) {
    console.error("Create referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

