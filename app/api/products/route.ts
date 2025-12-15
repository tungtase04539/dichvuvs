import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
    console.log("Building query for active products...");
    
    // Debug: Kiểm tra số lượng sản phẩm active trước khi filter category
    const { count: totalActiveCount, error: countError } = await supabase
      .from("Service")
      .select("*", { count: "exact", head: true })
      .eq("active", true);
    
    if (countError) {
      console.error("Count error:", countError);
    }
    console.log("Total active products in database:", totalActiveCount);
    
    // Query đơn giản hơn - không dùng relation join trước
    let query = supabase
      .from("Service")
      .select(`
        id, name, slug, description, price, image, videoUrl, featured, categoryId, active
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
      console.error("Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Products found:", products?.length || 0, "for category:", categorySlug || "all");
    
    // Debug: Log tất cả products để kiểm tra
    if (products && products.length > 0) {
      console.log("All products IDs:", products.map((p: any) => ({ id: p.id, name: p.name, active: p.active, categoryId: p.categoryId })));
    } else {
      console.warn("No products returned! Check if products exist with active=true");
      // Thử query không filter active để xem có sản phẩm nào không
      const { data: allProducts, error: allError } = await supabase
        .from("Service")
        .select("id, name, active, categoryId")
        .limit(10);
      console.log("All products (no filter):", allProducts?.length || 0, allError);
      if (allProducts && allProducts.length > 0) {
        console.log("Sample products:", allProducts.map((p: any) => ({ id: p.id, name: p.name, active: p.active })));
      }
    }
    
    // Join với Category sau khi đã có products
    if (products && products.length > 0) {
      const categoryIds = Array.from(new Set(products.map((p: any) => p.categoryId).filter(Boolean)));
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from("Category")
          .select("id, name, slug, icon, color")
          .in("id", categoryIds);
        
        const categoryMap = new Map(categories?.map((c: any) => [c.id, c]) || []);
        
        // Thêm category vào mỗi product
        const productsWithCategory = products.map((p: any) => ({
          ...p,
          category: p.categoryId ? categoryMap.get(p.categoryId) || null : null
        }));
        
        console.log("Products with categories:", productsWithCategory.length);
        return NextResponse.json(
          { products: productsWithCategory },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'Surrogate-Control': 'no-store'
            }
          }
        );
      }
      
      // Nếu không có categoryIds, trả về products không có category
      return NextResponse.json(
        { products: products.map((p: any) => ({ ...p, category: null })) },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      );
    }
    
    // Không có products
    return NextResponse.json(
      { products: [] },
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

