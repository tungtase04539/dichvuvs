import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth";

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

// GET - Lấy danh sách users từ Supabase Auth
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authUsers, error } = await supabaseAdmin.rpc('get_all_users');

    if (error) {
      console.error("List users error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter và format users
    let users = (authUsers || []).map((u: {
      id: string;
      email: string;
      raw_user_meta_data: Record<string, unknown> | null;
      created_at: string;
      last_sign_in_at: string | null;
    }) => ({
      id: u.id,
      email: u.email,
      name: (u.raw_user_meta_data?.name as string) || u.email?.split("@")[0],
      role: (u.raw_user_meta_data?.role as string) || "staff",
      phone: (u.raw_user_meta_data?.phone as string) || "",
      parentId: (u.raw_user_meta_data?.parentId as string) || null,
      active: true,
      createdAt: u.created_at,
    }));

    // Filter by role if specified
    if (role) {
      users = users.filter((u) => u.role === role);
    }

    // Filter based on current user's role
    if (user.role === "master_agent") {
      users = users.filter((u) => u.parentId === user.id);
    } else if (user.role === "agent") {
      users = users.filter((u) => u.parentId === user.id && u.role === "collaborator");
    } else if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Tạo user mới trong Supabase Auth
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, role, parentId } = body;

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

    // Kiểm tra quyền tạo role
    const allowedRoles: Record<string, string[]> = {
      admin: ["master_agent", "agent", "collaborator", "staff"],
      master_agent: ["agent"],
      agent: ["collaborator"],
    };

    if (!allowedRoles[currentUser.role]?.includes(role)) {
      return NextResponse.json(
        { error: `Bạn không có quyền tạo tài khoản ${role}` },
        { status: 403 }
      );
    }

    // Xác định parentId
    let finalParentId = parentId;
    if (currentUser.role === "master_agent" && role === "agent") {
      finalParentId = currentUser.id;
    } else if (currentUser.role === "agent" && role === "collaborator") {
      finalParentId = currentUser.id;
    }

    // Tạo user trong Supabase Auth
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        phone: phone || "",
        parentId: finalParentId || null,
      },
    });

    if (error) {
      console.error("Create user error:", error);
      if (error.message.includes("already registered")) {
        return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        name,
        email: data.user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
