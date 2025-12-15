import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("CTVApplication")
      .select("id, fullName, phone, email, facebook, zalo, experience, reason, status, createdAt, reviewedAt, reviewedBy, rejectReason")
      .order("createdAt", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error) {
    console.error("Get CTV applications error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

