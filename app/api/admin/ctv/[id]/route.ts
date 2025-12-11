import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the application
    const application = await prisma.cTVApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Không tìm thấy đơn đăng ký" }, { status: 404 });
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: "Đơn đăng ký đã được xử lý" }, { status: 400 });
    }

    // Update application status
    await prisma.cTVApplication.update({
      where: { id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });

    // If approved, update user role to CTV
    if (action === "approve") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "ctv" },
      });
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Đã duyệt thành CTV" : "Đã từ chối đơn đăng ký",
    });
  } catch (error) {
    console.error("Update CTV application error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

