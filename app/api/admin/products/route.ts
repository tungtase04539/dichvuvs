import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Get all products (admin)
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();
    
    if (!supabase || !adminSupabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Check auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role using admin client
    const { data: dbUser } = await adminSupabase
      .from("User")
      .select("role")
      .eq("email", authUser.email)
      .single();

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const { data: products, error } = await adminSupabase
      .from("Service")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Get products error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();
    
    if (!supabase || !adminSupabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Check auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role using admin client
    const { data: dbUser } = await adminSupabase
      .from("User")
      .select("role")
      .eq("email", authUser.email)
      .single();

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, longDescription, price, image, videoUrl, categoryId, featured, active } = body;

    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Check if slug exists using admin client
    const { data: existing } = await adminSupabase
      .from("Service")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Slug đã tồn tại" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const { data: product, error } = await adminSupabase
      .from("Service")
      .insert({
        id: crypto.randomUUID(),
        name,
        slug,
        description: description || null,
        longDescription: longDescription || null,
        price: parseFloat(price),
        unit: "bot",
        image: image || null,
        videoUrl: videoUrl || null,
        categoryId: categoryId || null,
        featured: featured === true,
        active: true, // Force active = true cho sản phẩm mới
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // Log để debug
    console.log("Product created:", product.id, "name:", product.name, "active:", product.active, "categoryId:", product.categoryId);

    // Đảm bảo sản phẩm mới luôn có active = true (double check)
    if (!product.active) {
      console.warn("Product created with active=false, fixing...");
      const { data: updatedProduct } = await adminSupabase
        .from("Service")
        .update({ active: true })
        .eq("id", product.id)
        .select()
        .single();
      
      if (updatedProduct) {
        console.log("Product active fixed:", updatedProduct.id, "active:", updatedProduct.active);
        return NextResponse.json({ product: updatedProduct });
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
