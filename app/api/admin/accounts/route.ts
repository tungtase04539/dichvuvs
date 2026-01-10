import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createReferralLinkForUser } from "@/lib/referral";

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

// GET - Lấy danh sách tài khoản
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authUsers, error: dbError } = await supabaseAdmin.rpc('get_all_users');

    if (dbError) {
      console.error("[GET /api/admin/accounts] RPC error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const users = (authUsers || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.raw_user_meta_data?.name || u.email?.split("@")[0],
      role: u.raw_user_meta_data?.role || "customer",
      phone: u.raw_user_meta_data?.phone || "",
      parentId: u.raw_user_meta_data?.parentId || null,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get accounts error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST - Tạo tài khoản mới
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role, phone, parentId } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        phone: phone || "",
        parentId: parentId || null,
      },
    });

    if (error) {
      console.error("Create user auth error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync Prisma
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email,
          name,
          role,
          phone: phone || "",
          parentId: parentId || null,
          password: "",
        }
      });
    } catch (pe) {
      console.error("Prisma sync error:", pe);
    }

    // Tự động tạo referral link cho CTV/Đại lý/NPP
    let referralCode = null;
    const eligibleRoles = ['admin', 'master_agent', 'distributor', 'agent', 'collaborator', 'ctv'];
    if (eligibleRoles.includes(role)) {
      const referralLink = await createReferralLinkForUser(data.user.id);
      referralCode = referralLink?.code || null;
    }

    return NextResponse.json({ success: true, user: data.user, referralCode });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
