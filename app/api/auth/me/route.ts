import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info from database
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, email, name, role, phone")
      .eq("email", authUser.email)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get referral code if user is CTV
    let referralCode = null;
    if (dbUser.role === "ctv" || dbUser.role === "collaborator" || dbUser.role === "admin") {
      const { data: refLink } = await supabase
        .from("ReferralLink")
        .select("code")
        .eq("userId", dbUser.id)
        .eq("isActive", true)
        .single();
      
      referralCode = refLink?.code || null;
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        phone: dbUser.phone,
        referralCode,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

