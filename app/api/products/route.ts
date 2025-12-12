import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Fast products API using Supabase directly
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");

    // Build query
    let query = supabase
      .from("Service")
      .select(`
        id, name, slug, description, price, image, videoUrl, featured, categoryId,
        category:Category(id, name, slug, icon, color)
      `)
      .eq("active", true);

    // Filter by category if provided
    if (categorySlug && categorySlug !== "all") {
      // First get category ID by slug
      const { data: category } = await supabase
        .from("Category")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      
      if (category) {
        query = query.eq("categoryId", category.id);
      } else {
        // Category not found, return empty
        return NextResponse.json({ products: [] });
      }
    }

    const { data: products, error } = await query
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

