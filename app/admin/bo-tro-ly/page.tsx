"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceGold?: number | null;
  pricePlatinum?: number | null;
  image?: string | null;
  featured: boolean;
  active: boolean;
  industry?: string | null;
}

export default function BundlesAdminPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await fetch("/api/bundles?includeInactive=true");
      const data = await res.json();
      setBundles(data.bundles || []);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;

    try {
      const res = await fetch(`/api/bundles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBundles();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi xóa bộ trợ lý");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bộ Trợ Lý AI</h1>
          <p className="text-slate-500 mt-1">
            Quản lý các bộ trợ lý theo ngành nghề/sở thích
          </p>
        </div>
        <Link
          href="/admin/bo-tro-ly/them"
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          Thêm mới
        </Link>
      </div>

      {bundles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Chưa có bộ trợ lý nào
          </h3>
          <p className="text-slate-500 mb-6">
            Tạo bộ trợ lý đầu tiên để bắt đầu
          </p>
          <Link href="/admin/bo-tro-ly/them" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Thêm bộ trợ lý
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Bộ Trợ Lý
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Ngành nghề
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Giá
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                  Nổi bật
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                  Trạng thái
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bundles.map((bundle) => (
                <tr key={bundle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {bundle.image ? (
                        <img
                          src={bundle.image}
                          alt={bundle.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{bundle.name}</p>
                        <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                          {bundle.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {bundle.industry ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {bundle.industry}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-primary-600">
                        {formatCurrency(bundle.price)}
                      </p>
                      {bundle.priceGold && (
                        <p className="text-xs text-amber-600">
                          Gold: {formatCurrency(bundle.priceGold)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {bundle.featured ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto" />
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {bundle.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <Eye className="w-3 h-3" />
                        Hiển thị
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        <EyeOff className="w-3 h-3" />
                        Ẩn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/bo-tro-ly/${bundle.id}/kho`}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Quản lý kho"
                      >
                        <Package className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/bo-tro-ly/${bundle.id}`}
                        className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(bundle.id, bundle.name)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
