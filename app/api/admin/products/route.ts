import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Get all products (admin)
export async function GET() {
  try {
    if (!(await isStaff())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminSupabase = createAdminSupabaseClient()!;

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
    if (!(await isStaff())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminSupabase = createAdminSupabaseClient()!;

    const body = await request.json();
    const {
      name, slug, description, longDescription, price, image, videoUrl,
      categoryId, featured, active, chatbotLink,
      priceGold, pricePlatinum, featuresGold, featuresPlatinum
    } = body;

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
    let { data: product, error } = await adminSupabase
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
        chatbotLink: chatbotLink || null,
        priceGold: priceGold ? parseFloat(priceGold) : null,
        pricePlatinum: pricePlatinum ? parseFloat(pricePlatinum) : null,
        featuresGold: featuresGold || null,
        featuresPlatinum: featuresPlatinum || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    // Resilience: if chatbotLink column is missing, retry without it
    if (error && error.message?.includes("chatbotLink") && (error.message?.includes("column") || error.message?.includes("cache"))) {
      console.warn("Retrying insert without chatbotLink due to missing column");
      const { data: retryProduct, error: retryError } = await adminSupabase
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
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      product = retryProduct;
      error = retryError;
    }

    if (error) {
      console.error("Create product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
