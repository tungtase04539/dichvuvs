import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Get current user profile
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser, error } = await supabase
      .from("User")
      .select("id, email, name, phone, role, avatar, createdAt")
      .eq("email", user.email)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
    }

    // Update user in database
    const { error: updateError } = await supabase
      .from("User")
      .update({
        name,
        phone: phone || null,
        updatedAt: new Date().toISOString(),
      })
      .eq("email", user.email);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
    }

    // Update Supabase auth metadata
    await supabase.auth.updateUser({
      data: { name },
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

