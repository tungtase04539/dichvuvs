"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Video } from "lucide-react";

interface FileUploadProps {
  type: "image" | "video";
  value?: string;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
}

export default function FileUpload({
  type,
  value,
  onChange,
  folder = "products",
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = type === "video" 
    ? "video/mp4,video/webm,video/mov,video/quicktime" 
    : "image/jpeg,image/png,image/gif,image/webp";

  const maxSize = type === "video" ? "100MB" : "5MB";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onChange(data.url);
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch {
      setError("Có lỗi xảy ra khi tải file");
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
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value, type }),
      });
      onChange(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          {type === "image" ? (
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
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
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
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
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
              {type === "image" ? (
                <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
              ) : (
                <Video className="w-10 h-10 text-slate-400 mb-3" />
              )}
              <p className="text-sm font-medium text-slate-700 mb-1">
                {type === "image" ? "Tải ảnh lên" : "Tải video lên"}
              </p>
              <p className="text-xs text-slate-500">
                {type === "image" 
                  ? "JPEG, PNG, GIF, WebP" 
                  : "MP4, WebM, MOV"} - Tối đa {maxSize}
              </p>
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

