import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Generate unique referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get user's referral links
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    // Admin can view any user's referrals
    // Master agent can view their sub-agents' referrals
    // Agent can only view their own

    let userId = user.id;

    if (targetUserId && targetUserId !== user.id) {
      if (user.role === "admin") {
        userId = targetUserId;
      } else if (user.role === "distributor") {
        // Check if target is a sub-agent
        const targetUser = await prisma.user.findFirst({
          where: { id: targetUserId, parentId: user.id },
        });
        if (targetUser) {
          userId = targetUserId;
        } else {
          return NextResponse.json({ error: "Không có quyền xem" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Không có quyền xem" }, { status: 403 });
      }
    }

    const referralLinks = await prisma.referralLink.findMany({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get orders that used this referral
    const referredOrders = await prisma.order.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        referralCode: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Calculate stats
    const stats = {
      totalClicks: referralLinks.reduce((sum, link) => sum + link.clickCount, 0),
      totalOrders: referralLinks.reduce((sum, link) => sum + link.orderCount, 0),
      totalRevenue: referralLinks.reduce((sum, link) => sum + link.revenue, 0),
      conversionRate: 0,
    };

    if (stats.totalClicks > 0) {
      stats.conversionRate = Math.round((stats.totalOrders / stats.totalClicks) * 100);
    }

    return NextResponse.json({
      referralLinks,
      referredOrders,
      stats,
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new referral link
export async function POST() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin, distributor, agent, senior_collaborator, collaborator can create referral links
    if (!["admin", "distributor", "agent", "senior_collaborator", "collaborator"].includes(user.role)) {
      return NextResponse.json(
        { error: "Không có quyền tạo mã giới thiệu" },
        { status: 403 }
      );
    }

    // Check if user already has an active referral link
    const existingLink = await prisma.referralLink.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (existingLink) {
      return NextResponse.json({
        referralLink: existingLink,
        message: "Bạn đã có mã giới thiệu",
      });
    }

    // Generate unique code
    let code: string;
    let attempts = 0;
    do {
      code = generateReferralCode();
      const exists = await prisma.referralLink.findUnique({ where: { code } });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Không thể tạo mã giới thiệu" },
        { status: 500 }
      );
    }

    const referralLink = await prisma.referralLink.create({
      data: {
        code,
        userId: user.id,
      },
    });

    return NextResponse.json({ referralLink });
  } catch (error) {
    console.error("Create referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

