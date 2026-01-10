import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createReferralLinksForAllEligibleUsers } from "@/lib/referral";

export const dynamic = "force-dynamic";

/**
 * POST - Tạo referral links cho tất cả users có vai trò CTV/Đại lý/NPP mà chưa có link
 * Dùng để sync/migrate data cũ
 */
export async function POST() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createReferralLinksForAllEligibleUsers();

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${result.created} referral links mới`,
      ...result
    });
  } catch (error) {
    console.error("Sync referral links error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
