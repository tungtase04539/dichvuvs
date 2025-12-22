import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// PUT - Cập nhật tài khoản
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    const currentRole = authUser?.user_metadata?.role || "admin";
    if (!authUser || currentRole !== "admin") {
      return NextResponse.json({ error: "Chỉ Admin mới có quyền" }, { status: 403 });
    }

    const body = await request.json();
    const { name, role, phone, password, parentId } = body;

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Update Supabase Auth user
    const updatePayload: Record<string, any> = {
      user_metadata: {
        name,
        role,
        phone: phone || "",
        parentId: parentId || null
      },
    };

    if (password) {
      updatePayload.password = password;
    }

    const { data: updatedAuth, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      params.id,
      updatePayload
    );

    if (authError) {
      console.error("Update auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Sync with Prisma User table
    // Important: We use upsert because the user might not exist in Prisma table yet
    await prisma.user.upsert({
      where: { id: params.id },
      update: {
        name,
        role,
        phone,
        parentId: parentId || null
      },
      create: {
        id: params.id,
        email: updatedAuth.user.email!,
        password: "SUPABASE_AUTH_USER", // Password is managed by Supabase
        name,
        role,
        phone,
        parentId: parentId || null
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedAuth.user.id,
        email: updatedAuth.user.email,
        name,
        role,
      },
    });
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// DELETE - Xóa tài khoản
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userRole = user?.user_metadata?.role || "admin";
    if (!user || userRole !== "admin") {
      return NextResponse.json({ error: "Chỉ Admin mới có quyền" }, { status: 403 });
    }

    // Không cho xóa chính mình
    if (params.id === user.id) {
      return NextResponse.json({ error: "Không thể xóa tài khoản của chính mình" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id);

    if (error) {
      console.error("Delete user error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

