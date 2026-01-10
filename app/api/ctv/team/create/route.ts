import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createReferralLinkForUser } from "@/lib/referral";

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

// POST - Đại lý/NPP tạo CTV thuộc đội nhóm của mình
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // Chỉ Đại lý và NPP mới được tạo CTV
    const allowedRoles = ["agent", "distributor"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "Bạn không có quyền tạo CTV" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Tạo user trong Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "collaborator",
        phone: phone || "",
        parentId: session.id, // Tự động gán parentId là ID của người tạo
      },
    });

    if (error) {
      console.error("Create CTV auth error:", error);
      if (error.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "Email này đã được sử dụng" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync vào Prisma
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email,
          name,
          role: "collaborator",
          phone: phone || "",
          parentId: session.id,
          password: "",
        },
      });
    } catch (pe) {
      console.error("Prisma sync error:", pe);
    }

    // Tạo referral link cho CTV mới
    let referralCode = null;
    try {
      const referralLink = await createReferralLinkForUser(data.user.id);
      referralCode = referralLink?.code || null;
    } catch (re) {
      console.error("Create referral link error:", re);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email,
        name,
        role: "collaborator",
      },
      referralCode,
    });
  } catch (error) {
    console.error("Create CTV error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
