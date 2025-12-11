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

    // Get referral code if user is CTV or Admin
    let referralCode = null;
    if (dbUser.role === "ctv" || dbUser.role === "collaborator" || dbUser.role === "admin") {
      const { data: refLink } = await supabase
        .from("ReferralLink")
        .select("code")
        .eq("userId", dbUser.id)
        .eq("isActive", true)
        .single();
      
      if (refLink?.code) {
        referralCode = refLink.code;
      } else {
        // Auto-create referral code if not exists (using phone number or random)
        const newCode = dbUser.phone?.replace(/\D/g, '') || Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const { error: insertError } = await supabase
          .from("ReferralLink")
          .insert({
            id: crypto.randomUUID(),
            code: newCode,
            userId: dbUser.id,
            clickCount: 0,
            orderCount: 0,
            revenue: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        
        if (!insertError) {
          referralCode = newCode;
        }
      }
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

