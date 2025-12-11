import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all CTVs
    const { data: ctvUsers, error: usersError } = await supabase
      .from("User")
      .select("id, name, email, phone, createdAt")
      .eq("role", "ctv")
      .order("createdAt", { ascending: false });

    if (usersError) {
      console.error("Error fetching CTVs:", usersError);
      return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }

    // Get all referral links
    const { data: referralLinks } = await supabase
      .from("ReferralLink")
      .select("userId, code, clickCount, orderCount, revenue");

    // Get pending applications count
    const { count: pendingCount } = await supabase
      .from("CTVApplication")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // Map referral data to CTVs
    const refMap = new Map(referralLinks?.map((r) => [r.userId, r]) || []);

    const ctvs = (ctvUsers || []).map((ctv) => {
      const ref = refMap.get(ctv.id);
      return {
        id: ctv.id,
        name: ctv.name,
        email: ctv.email,
        phone: ctv.phone,
        createdAt: ctv.createdAt,
        referralCode: ref?.code || null,
        clickCount: ref?.clickCount || 0,
        orderCount: ref?.orderCount || 0,
        revenue: ref?.revenue || 0,
      };
    });

    // Calculate totals
    const stats = {
      totalCTVs: ctvs.length,
      totalOrders: ctvs.reduce((sum, c) => sum + c.orderCount, 0),
      totalRevenue: ctvs.reduce((sum, c) => sum + c.revenue, 0),
      pendingApplications: pendingCount || 0,
    };

    return NextResponse.json({ ctvs, stats });
  } catch (error) {
    console.error("Get CTVs error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

