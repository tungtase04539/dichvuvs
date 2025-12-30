import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// PUT - Cập nhật tài khoản
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, phone, password, parentId } = body;

    const supabaseAdmin = getSupabaseAdmin();
    const updatePayload: any = {
      user_metadata: {
        name,
        role,
        phone: phone || "",
        parentId: parentId || null
      },
    };

    if (password) updatePayload.password = password;

    const { data: updatedAuth, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      params.id,
      updatePayload
    );

    if (authError) {
      console.error("Update auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Sync Prisma
    await prisma.user.upsert({
      where: { id: params.id },
      update: { name, role, phone, parentId: parentId || null },
      create: {
        id: params.id,
        email: updatedAuth.user.email!,
        name,
        role,
        phone,
        parentId: parentId || null,
        password: "",
      }
    });

    return NextResponse.json({ success: true });
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
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (params.id === session.id) {
      return NextResponse.json({ error: "Không thể xóa chính mình" }, { status: 400 });
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
