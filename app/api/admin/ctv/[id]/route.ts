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

    // If approved, create Auth user, update role to CTV and create referral link
    if (action === "approve") {
      // Get user data for creating Auth account
      const { data: userData } = await supabase
        .from("User")
        .select("email, password, name")
        .eq("id", application.userId)
        .single();

      if (userData) {
        // Create user in Supabase Auth
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check if auth user already exists
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
        const authUserExists = existingAuthUsers?.users?.some(u => u.email === userData.email);

        if (!authUserExists) {
          const { error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password, // Mật khẩu = số điện thoại
            email_confirm: true,
            user_metadata: {
              name: userData.name,
              role: "ctv",
            },
          });

          if (authError) {
            console.error("Error creating auth user:", authError);
            return NextResponse.json({ error: `Không thể tạo tài khoản: ${authError.message}` }, { status: 500 });
          }
        }
      }

      // Mã giới thiệu mặc định = số điện thoại của CTV
      const refCode = application.phone.replace(/\D/g, ''); // Chỉ lấy số
      
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

