import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from("CTVApplication")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json({ error: "Không tìm thấy đơn đăng ký" }, { status: 404 });
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: "Đơn đăng ký đã được xử lý" }, { status: 400 });
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("CTVApplication")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
    }

    // If approved, update user role to CTV and create referral link
    if (action === "approve") {
      // Generate random 5-character referral code
      const refCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      
      await supabase
        .from("User")
        .update({ role: "ctv", updatedAt: new Date().toISOString() })
        .eq("id", application.userId);

      // Create referral link for the new CTV
      await supabase
        .from("ReferralLink")
        .insert({
          id: crypto.randomUUID(),
          code: refCode,
          userId: application.userId,
          clickCount: 0,
          orderCount: 0,
          revenue: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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

