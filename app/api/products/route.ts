import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Fast products API using Supabase directly
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { data: products, error } = await supabase
      .from("Service")
      .select("id, name, slug, description, price, image, videoUrl, featured")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Get products error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

