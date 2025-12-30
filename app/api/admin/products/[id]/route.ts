import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isStaff())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminSupabase = createAdminSupabaseClient()!;

    const { data: product, error } = await adminSupabase
      .from("Service")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isStaff())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminSupabase = createAdminSupabaseClient()!;

    const body = await request.json();
    const { name, slug, description, longDescription, price, image, videoUrl, categoryId, featured, active, chatbotLink } = body;

    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Check if slug exists (excluding current product)
    const { data: existing } = await adminSupabase
      .from("Service")
      .select("id")
      .eq("slug", slug)
      .neq("id", params.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Slug đã tồn tại" },
        { status: 400 }
      );
    }

    let { data: product, error } = await adminSupabase
      .from("Service")
      .update({
        name,
        slug,
        description: description || null,
        longDescription: longDescription || null,
        price: parseFloat(price),
        image: image || null,
        videoUrl: videoUrl || null,
        categoryId: categoryId || null,
        featured: featured || false,
        active: active !== false,
        chatbotLink: chatbotLink || null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    // Resilience: if chatbotLink column is missing, retry without it
    if (error && error.message?.includes("chatbotLink") && (error.message?.includes("column") || error.message?.includes("cache"))) {
      console.warn("Retrying update without chatbotLink due to missing column");
      const { data: retryProduct, error: retryError } = await adminSupabase
        .from("Service")
        .update({
          name,
          slug,
          description: description || null,
          longDescription: longDescription || null,
          price: parseFloat(price),
          image: image || null,
          videoUrl: videoUrl || null,
          categoryId: categoryId || null,
          featured: featured || false,
          active: active !== false,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();

      product = retryProduct;
      error = retryError;
    }

    if (error) {
      console.error("Update product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isStaff())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminSupabase = createAdminSupabaseClient()!;

    // Check if product has orders
    const { count } = await adminSupabase
      .from("Order")
      .select("id", { count: "exact", head: true })
      .eq("serviceId", params.id);

    if (count && count > 0) {
      // Nếu có đơn hàng, chỉ set active = false thay vì xóa
      const { error: updateError } = await adminSupabase
        .from("Service")
        .update({
          active: false,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (updateError) {
        console.error("Deactivate product error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Sản phẩm đã được ẩn (có ${count} đơn hàng)`
      });
    }

    // Nếu không có đơn hàng, xóa thật
    const { error } = await adminSupabase
      .from("Service")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Delete product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
