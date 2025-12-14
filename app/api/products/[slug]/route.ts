import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { data: product, error } = await supabase
      .from("Service")
      .select("*")
      .eq("slug", params.slug)
      .eq("active", true)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get related products
    const { data: related } = await supabase
      .from("Service")
      .select("id, name, slug, price, image, description")
      .eq("active", true)
      .neq("slug", params.slug)
      .limit(4);

    return NextResponse.json({ 
      product,
      relatedProducts: related || []
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

