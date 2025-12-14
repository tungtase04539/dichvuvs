"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa "${productName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Product deleted/deactivated:", productId, data);
        // Trigger storage event để các tab khác biết có update
        if (typeof window !== 'undefined') {
          localStorage.setItem('products-updated', Date.now().toString());
          localStorage.removeItem('products-updated');
        }
        // Force refresh để cập nhật danh sách
        router.refresh();
        // Thông báo nếu chỉ ẩn thay vì xóa
        if (data.message) {
          alert(data.message);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Xóa"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

