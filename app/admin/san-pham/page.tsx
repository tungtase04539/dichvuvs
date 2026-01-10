import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, Package } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CopyRefButton from "@/app/admin/san-pham/CopyRefButton";
import EditVideoButton from "./EditVideoButton";

export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) return [];

    const { data: products, error } = await adminSupabase
      .from("Service")
      .select("*")
      .order("featured", { ascending: false })
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("DEBUG: Supabase getProducts failed:", error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error("DEBUG: getProducts caught error:", error);
    return [];
  }
}

export default async function AdminProductsPage() {
  const [products, session] = await Promise.all([
    getProducts(),
    getSession()
  ]);

  // Debug: log session role
  console.log("[san-pham/page] Session:", session?.email, "Role:", session?.role);

  const isAdmin = session?.role === "admin";
  const isCTV = session?.role === "collaborator" || session?.role === "ctv";
  const isSeniorCTV = session?.role === "senior_collaborator";
  const isAgent = session?.role === "agent";
  const isDistributor = session?.role === "distributor" || session?.role === "master_agent";
  const canUseRefLink = isCTV || isSeniorCTV || isAgent || isDistributor;

  // Get referral code for CTV/Agent/Distributor
  let refCode = "";
  if (canUseRefLink && session?.id) {
    const refLink = await prisma.referralLink.findFirst({
      where: { userId: session.id }
    });
    if (refLink) {
      refCode = refLink.code;
    } else {
      // Auto-create if not exists
      const newCode = `REF-${session.id.substring(0, 6).toUpperCase()}`;
      const newLink = await prisma.referralLink.create({
        data: {
          code: newCode,
          userId: session.id
        }
      });
      refCode = newLink.code;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách Trợ lý AI</h1>
          <p className="text-slate-600">
            {isAdmin ? "Quản lý sản phẩm hệ thống" : "Lấy link giới thiệu để nhận hoa hồng"}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/san-pham/them"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm ChatBot
          </Link>
        )}
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
                    <span className="text-3xl">🤖</span>
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
                    {canUseRefLink && (
                      <CopyRefButton
                        slug={product.slug}
                        refCode={refCode}
                      />
                    )}

                    {/* Nút sửa video: 
                        - CTV cao cấp: chỉ hiện khi sản phẩm CHƯA có video
                        - Admin: hiện cho tất cả sản phẩm
                    */}
                    {(isAdmin || (isSeniorCTV && !product.videoUrl)) && (
                      <EditVideoButton
                        productId={product.id}
                        productName={product.name}
                        currentVideoUrl={product.videoUrl}
                        isAdmin={isAdmin}
                      />
                    )}

                    {isAdmin && (
                      <>
                        <Link
                          href={`/admin/san-pham/${product.id}/kho`}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Quản lý kho (Link & Mã)"
                        >
                          <Package className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/san-pham/${product.id}`}
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </>
                    )}
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

