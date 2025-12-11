import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const query = supabase
      .from("CTVApplication")
      .select("*")
      .order("createdAt", { ascending: false });

    if (status !== "all") {
      query.eq("status", status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error("Get CTV applications error:", error);
      return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error("Get CTV applications error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

