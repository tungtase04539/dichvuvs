import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PUT - CTV cao cấp cập nhật video URL của sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const isAdmin = session.role === "admin";
    const isSeniorCTV = session.role === "senior_collaborator";

    // Chỉ senior_collaborator và admin mới được sửa video
    if (!isAdmin && !isSeniorCTV) {
      return NextResponse.json(
        { error: "Bạn không có quyền sửa video sản phẩm" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { videoUrl } = body;

    const adminSupabase = createAdminSupabaseClient()!;

    // Kiểm tra sản phẩm hiện tại
    const { data: currentProduct } = await adminSupabase
      .from("Service")
      .select("id, videoUrl")
      .eq("id", params.id)
      .single();

    // CTV cao cấp chỉ được THÊM video cho sản phẩm CHƯA có video
    // Không được SỬA video đã có (chỉ Admin mới sửa được)
    if (isSeniorCTV && currentProduct?.videoUrl) {
      return NextResponse.json(
        { error: "Sản phẩm đã có video. Chỉ Admin mới có thể sửa video." },
        { status: 403 }
      );
    }

    // Cập nhật videoUrl
    const { data: product, error } = await adminSupabase
      .from("Service")
      .update({
        videoUrl: videoUrl || null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select("id, name, videoUrl")
      .single();

    if (error) {
      console.error("Update video error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      product,
      message: "Đã cập nhật video hướng dẫn"
    });
  } catch (error) {
    console.error("Update video error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
