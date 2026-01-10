"use client";

import { useState } from "react";
import { Video, X, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface EditVideoButtonProps {
  productId: string;
  productName: string;
  currentVideoUrl: string | null;
}

export default function EditVideoButton({ productId, productName, currentVideoUrl }: EditVideoButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hiển thị nút cho tất cả sản phẩm (CTV cao cấp chỉ thêm được khi chưa có video)
  const hasVideo = !!currentVideoUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/ctv/products/${productId}/video`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
        return;
      }

      toast.success("Đã cập nhật video hướng dẫn!");
      setShowModal(false);
      // Reload page to see changes
      window.location.reload();
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-2 rounded-lg transition-colors ${
          hasVideo 
            ? "text-green-500 hover:text-green-600 hover:bg-green-50" 
            : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
        }`}
        title={hasVideo ? "Xem/Sửa video hướng dẫn" : "Thêm video hướng dẫn"}
      >
        <Video className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Thêm video hướng dẫn</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  Sản phẩm: <strong>{productName}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link video YouTube
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Nhập link video YouTube hướng dẫn sử dụng sản phẩm
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                <strong>Lưu ý:</strong> {hasVideo 
                  ? "Sản phẩm này đã có video. Chỉ Admin mới có thể sửa." 
                  : "Bạn chỉ có thể thêm video cho sản phẩm chưa có video. Sau khi thêm, chỉ Admin mới có thể sửa."}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !videoUrl}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Lưu video
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
