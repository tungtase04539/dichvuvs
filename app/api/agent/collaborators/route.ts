import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Supabase Admin client
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

// GET - Lấy danh sách CTV của đại lý
export async function GET() {
  try {
    const user = await getSession();
    if (!user || !["admin", "agent"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authUsers, error } = await supabaseAdmin.rpc('get_all_users');

    if (error) {
      console.error("List users error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter collaborators belonging to this agent
    const collaborators = (authUsers || [])
      .filter((u: { raw_user_meta_data: Record<string, unknown> | null }) =>
        u.raw_user_meta_data?.role === "collaborator" &&
        u.raw_user_meta_data?.parentId === user.id
      )
      .map((u: {
        id: string;
        email: string;
        raw_user_meta_data: Record<string, unknown> | null;
        created_at: string;
      }) => ({
        id: u.id,
        email: u.email,
        name: (u.raw_user_meta_data?.name as string) || u.email?.split("@")[0],
        phone: (u.raw_user_meta_data?.phone as string) || "",
        active: true,
        createdAt: u.created_at,
      }));

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Get collaborators error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Tạo CTV mới (bởi Đại lý)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !["admin", "agent"].includes(user.role)) {
      return NextResponse.json({ error: "Không có quyền tạo CTV" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Tạo CTV trong Supabase Auth
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "collaborator",
        phone: phone || "",
        parentId: user.id, // CTV thuộc đại lý này
      },
    });

    if (error) {
      console.error("Create collaborator error:", error);
      if (error.message.includes("already registered")) {
        return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ĐỒNG BỘ: Tạo record trong database Prisma
    try {
      const { id: authId } = data.user;
      await prisma.user.create({
        data: {
          id: authId,
          email,
          password: "", // Không dùng password trong Prisma
          name,
          role: "collaborator",
          phone: phone || "",
          parentId: user.id, // CTV thuộc đại lý này
        }
      });
      console.log("[POST /api/agent/collaborators] Prisma user created sync:", authId);
    } catch (prismaError) {
      console.error("[POST /api/agent/collaborators] Prisma sync error:", prismaError);
      // getSession() will handle auto-sync if missing
    }

    return NextResponse.json({
      collaborator: {
        id: data.user.id,
        name,
        email: data.user.email,
        role: "collaborator",
      },
    });
  } catch (error) {
    console.error("Create collaborator error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
