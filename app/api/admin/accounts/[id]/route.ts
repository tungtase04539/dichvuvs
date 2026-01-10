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

    const { id } = params;
    const body = await request.json();
    const { name, role, phone, password, parentId } = body;

    console.log("[PUT /api/admin/accounts] Updating user:", id, { name, role, phone, parentId });

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
      id,
      updatePayload
    );

    if (authError) {
      console.error("Update auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    console.log("[PUT /api/admin/accounts] Auth updated, syncing Prisma...");

    // Sync Prisma
    try {
      await prisma.user.upsert({
        where: { id },
        update: { name, role, phone, parentId: parentId || null },
        create: {
          id,
          email: updatedAuth.user.email!,
          name,
          role,
          phone,
          parentId: parentId || null,
          password: "",
        }
      });
      console.log("[PUT /api/admin/accounts] Prisma synced successfully");
    } catch (prismaError: any) {
      console.error("Prisma sync error:", prismaError);
      // Không fail nếu Prisma lỗi, vì Auth đã update thành công
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống" }, { status: 500 });
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

    const { id } = params;

    if (id === session.id) {
      return NextResponse.json({ error: "Không thể xóa chính mình" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

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
