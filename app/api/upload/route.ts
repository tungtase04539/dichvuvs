import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase admin client for storage operations
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST(request: NextRequest) {
  try {
    // Auth check - chỉ admin mới được upload
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "image" hoặc "video"
    const folder = formData.get("folder") as string || "products"; // Thư mục lưu

    if (!file) {
      return NextResponse.json({ error: "Không có file được tải lên" }, { status: 400 });
    }

    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/mov", "video/quicktime"];
    
    if (type === "image" && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ định dạng ảnh: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }
    
    if (type === "video" && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ định dạng video: MP4, WebM, MOV" },
        { status: 400 }
      );
    }

    // File size limits
    const maxImageSize = 5 * 1024 * 1024; // 5MB cho ảnh
    const maxVideoSize = 100 * 1024 * 1024; // 100MB cho video
    
    if (type === "image" && file.size > maxImageSize) {
      return NextResponse.json(
        { error: "Ảnh không được vượt quá 5MB" },
        { status: 400 }
      );
    }
    
    if (type === "video" && file.size > maxVideoSize) {
      return NextResponse.json(
        { error: "Video không được vượt quá 100MB" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop()?.toLowerCase() || (type === "video" ? "mp4" : "jpg");
    const fileName = `${folder}/${timestamp}-${randomId}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const bucket = type === "video" ? "videos" : "images";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Lỗi khi tải file lên: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
      type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải file" },
      { status: 500 }
    );
  }
}

// Delete file from storage
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, type } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const bucket = type === "video" ? "videos" : "images";
    
    // Extract file path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) {
      return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
    }
    
    const filePath = decodeURIComponent(urlParts[1]);
    
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    
    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { error: "Lỗi khi xóa file: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa file" },
      { status: 500 }
    );
  }
}

