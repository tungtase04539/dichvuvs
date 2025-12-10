import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Supabase Admin client (with service role key)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("[getSupabaseAdmin] URL:", supabaseUrl ? "✓" : "✗ MISSING");
  console.log("[getSupabaseAdmin] Service Key:", supabaseServiceKey ? "✓" : "✗ MISSING");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      `Missing Supabase credentials: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : ""} ${!supabaseServiceKey ? "SUPABASE_SERVICE_ROLE_KEY" : ""}`.trim()
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// GET - Lấy danh sách tài khoản
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      console.log("[GET /api/admin/accounts] No supabase client");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    console.log("[GET /api/admin/accounts] Current user:", user?.id, user?.email, user?.user_metadata);
    
    // Cho phép admin (role = admin hoặc chưa set role)
    const userRole = user?.user_metadata?.role || "admin";
    if (!user || userRole !== "admin") {
      console.log("[GET /api/admin/accounts] Not admin, role:", userRole);
      return NextResponse.json({ error: "Chỉ Admin mới có quyền" }, { status: 403 });
    }

    // Get all users using database function (bypass Auth Admin API)
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: authUsers, error: dbError } = await supabaseAdmin.rpc('get_all_users');

    if (dbError) {
      console.error("[GET /api/admin/accounts] RPC error:", dbError);
      return NextResponse.json({ 
        error: dbError.message,
        hint: "Đảm bảo đã chạy SQL tạo function get_all_users() trong Supabase"
      }, { status: 500 });
    }

    // Format users
    const users = (authUsers || []).map((u: {
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
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/admin/accounts] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Lỗi hệ thống";
    return NextResponse.json({ 
      error: errorMessage,
      hint: errorMessage.includes("SUPABASE_SERVICE_ROLE_KEY") 
        ? "Cần cấu hình SUPABASE_SERVICE_ROLE_KEY trong file .env.local" 
        : undefined
    }, { status: 500 });
  }
}

// POST - Tạo tài khoản mới
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mặc định role là "admin" nếu chưa set (cho user đầu tiên)
    const currentRole = user.user_metadata?.role || "admin";

    // Kiểm tra quyền tạo tài khoản
    if (!["admin", "master_agent", "agent"].includes(currentRole)) {
      return NextResponse.json({ error: "Không có quyền tạo tài khoản" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, role, phone } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra quyền tạo role
    const allowedRoles: Record<string, string[]> = {
      admin: ["master_agent", "agent", "collaborator", "staff"],
      master_agent: ["agent"],
      agent: ["collaborator"],
    };

    if (!allowedRoles[currentRole]?.includes(role)) {
      return NextResponse.json({ error: `Bạn không có quyền tạo ${role}` }, { status: 403 });
    }

    // Tạo user trong Supabase Auth
    console.log("[POST /api/admin/accounts] Creating user:", { email, name, role, phone });
    
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        phone: phone || "",
        parentId: user.id, // Người tạo là parent
      },
    });

    if (error) {
      console.error("[POST /api/admin/accounts] Create user error:", error);
      if (error.message.includes("already registered")) {
        return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[POST /api/admin/accounts] User created successfully:", data.user.id, data.user.email, data.user.user_metadata);

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role,
      },
    });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

