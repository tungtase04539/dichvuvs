import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Track referral click
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Mã giới thiệu không hợp lệ" }, { status: 400 });
    }

    // Find referral link
    const referralLink = await prisma.referralLink.findUnique({
      where: { code },
    });

    if (!referralLink || !referralLink.isActive) {
      return NextResponse.json({ error: "Mã giới thiệu không tồn tại" }, { status: 404 });
    }

    // Get request info
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    // Create click record
    await prisma.referralClick.create({
      data: {
        referralLinkId: referralLink.id,
        ipAddress,
        userAgent,
        referer,
      },
    });

    // Update click count
    await prisma.referralLink.update({
      where: { id: referralLink.id },
      data: {
        clickCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      referrerId: referralLink.userId,
      code: referralLink.code,
    });
  } catch (error) {
    console.error("Track referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Validate referral code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ valid: false });
    }

    const referralLink = await prisma.referralLink.findUnique({
      where: { code },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!referralLink || !referralLink.isActive) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      referrerName: referralLink.user.name,
      code: referralLink.code,
    });
  } catch (error) {
    console.error("Validate referral error:", error);
    return NextResponse.json({ valid: false });
  }
}

