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
    
    console.log("API /products called with category:", categorySlug || "all");

    // Build query - Only show active products
    let query = supabase
      .from("Service")
      .select(`
        id, name, slug, description, price, image, videoUrl, featured, categoryId, active,
        category:Category(id, name, slug, icon, color)
      `)
      .eq("active", true);

    // Filter by category if provided
    if (categorySlug && categorySlug !== "all") {
      console.log("Looking up category by slug:", categorySlug);
      // First get category ID by slug
      const { data: category, error: categoryError } = await supabase
        .from("Category")
        .select("id, name, slug")
        .eq("slug", categorySlug)
        .single();
      
      if (categoryError || !category) {
        console.error("Category not found:", categorySlug, categoryError);
        // Category not found, return empty
        return NextResponse.json({ products: [] }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        });
      }
      
      console.log("Category found:", category.name, "ID:", category.id);
      // Filter by categoryId
      query = query.eq("categoryId", category.id);
    }

    const { data: products, error } = await query
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Get products error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Products found:", products?.length || 0, "for category:", categorySlug || "all");
    if (products && products.length > 0) {
      console.log("Sample product:", {
        id: products[0].id,
        name: products[0].name,
        active: products[0].active,
        categoryId: products[0].categoryId,
        categoryName: products[0].category?.name
      });
    }
    
    // Thêm headers để không cache response
    return NextResponse.json(
      { products: products || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

