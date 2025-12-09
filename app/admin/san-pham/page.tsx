import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, Package } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

async function getProducts() {
  return prisma.service.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý ChatBot</h1>
          <p className="text-slate-600">Thêm, sửa, xóa các sản phẩm ChatBot</p>
        </div>
        <Link
          href="/admin/san-pham/them"
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm ChatBot
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Sản phẩm
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
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{product.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(product.price)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {product.featured ? (
                    <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      HOT
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {product.active ? (
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Hiển thị
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Ẩn
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/san-pham/${product.id}`}
                      className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

