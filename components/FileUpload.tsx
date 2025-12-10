"use client";

import { useState, useRef } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

interface FileUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
}

export default function FileUpload({
  value,
  onChange,
  folder = "products",
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      setError("Ảnh không được vượt quá 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ: JPEG, PNG, GIF, WebP");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error("Không thể kết nối Supabase");
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${folder}/${timestamp}-${randomId}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      onChange(urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải ảnh");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    
    setIsUploading(true);
    try {
      const supabase = getSupabase();
      if (supabase) {
        const urlParts = value.split("/storage/v1/object/public/images/");
        if (urlParts.length >= 2) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from("images").remove([filePath]);
        }
      }
      onChange(null);
    } catch (error) {
      console.error("Delete error:", error);
      onChange(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Đang tải lên...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">Tải ảnh lên</p>
              <p className="text-xs text-slate-500">JPEG, PNG, GIF, WebP - Tối đa 5MB</p>
            </>
          )}
        </label>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
