import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const body = await request.json();
    const { action, rejectReason, reviewer } = body;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const payload: Record<string, any> = {
      status: action,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewer || null,
      rejectReason: action === "rejected" ? rejectReason || null : null,
    };

    const application = await prisma.cTVApplication.update({
      where: { id: params.id },
      data: payload,
    });

    // Nếu duyệt, tự động nâng cấp User và tạo mã Referral mẫu
    if (action === "approved") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "ctv" },
      });

      // Tạo mã giới thiệu mặc định nếu chưa có
      const existingLink = await prisma.referralLink.findFirst({
        where: { userId: application.userId },
      });

      if (!existingLink) {
        const randomCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.referralLink.create({
          data: {
            code: randomCode,
            userId: application.userId,
          },
        });
      }
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Update CTV application error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

