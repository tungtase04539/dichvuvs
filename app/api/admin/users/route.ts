import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession, isStaff } from "@/lib/auth";

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

// GET - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !(await isStaff())) {
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

    let users = (authUsers || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.raw_user_meta_data?.name || u.email?.split("@")[0],
      role: u.raw_user_meta_data?.role || "customer",
      phone: u.raw_user_meta_data?.phone || "",
      parentId: u.raw_user_meta_data?.parentId || null,
      createdAt: u.created_at,
    }));

    if (role) {
      users = users.filter((u: any) => u.role === role);
    }

    // Filter based on current user's role
    if (user.role === "master_agent") {
      users = users.filter((u: any) => u.parentId === user.id);
    } else if (user.role === "agent") {
      users = users.filter((u: any) => u.parentId === user.id && u.role === "collaborator");
    } else if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser || !(await isStaff())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, role, parentId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const allowedRoles: Record<string, string[]> = {
      admin: ["master_agent", "agent", "collaborator", "staff"],
      master_agent: ["agent"],
      agent: ["collaborator"],
    };

    if (!allowedRoles[currentUser.role]?.includes(role)) {
      return NextResponse.json({ error: "Không có quyền tạo tài khoản này" }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        phone,
        parentId: parentId || currentUser.id,
      },
    });

    if (error) {
      console.error("Create user error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
