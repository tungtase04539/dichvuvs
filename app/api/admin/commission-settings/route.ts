import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Lấy cấu hình commission
export async function GET() {
  try {
    const user = await getSession();
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.commissionSetting.findMany({
      orderBy: [{ role: "asc" }, { type: "asc" }]
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[Commission Settings GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Cập nhật cấu hình commission
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    // Cập nhật từng setting
    for (const setting of settings) {
      if (!setting.key || setting.percent === undefined) continue;

      await prisma.commissionSetting.upsert({
        where: { key: setting.key },
        update: {
          percent: setting.percent,
          description: setting.description,
          updatedAt: new Date()
        },
        create: {
          key: setting.key,
          role: setting.role,
          type: setting.type,
          percent: setting.percent,
          description: setting.description
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình thành công"
    });
  } catch (error) {
    console.error("[Commission Settings POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
