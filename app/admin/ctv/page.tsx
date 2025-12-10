import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  Link2,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCollaborators(userId: string) {
  const collaborators = await prisma.user.findMany({
    where: { parentId: userId, role: "collaborator" },
    include: {
      referralLinks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total stats
  const stats = collaborators.reduce((acc, ctv) => {
    const ref = ctv.referralLinks[0];
    return {
      totalClicks: acc.totalClicks + (ref?.clickCount || 0),
      totalOrders: acc.totalOrders + (ref?.orderCount || 0),
      totalRevenue: acc.totalRevenue + (ref?.revenue || 0),
    };
  }, { totalClicks: 0, totalOrders: 0, totalRevenue: 0 });

  return { collaborators, stats };
}

export default async function CollaboratorsPage() {
  const user = await getSession();
  
  if (!user || user.role !== "agent") {
    redirect("/admin");
  }

  const { collaborators, stats } = await getCollaborators(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cộng tác viên của tôi</h1>
          <p className="text-slate-600">Quản lý các cộng tác viên dưới quyền của bạn</p>
        </div>
        <Link
          href="/admin/ctv/them"
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm CTV
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{collaborators.length}</p>
              <p className="text-sm text-slate-500">Cộng tác viên</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Tổng lượt click</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
              <p className="text-sm text-slate-500">Tổng đơn hàng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-slate-500">Tổng doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-orange-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Danh sách CTV ({collaborators.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Cộng tác viên</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Mã giới thiệu</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Click</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Đơn hàng</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Doanh thu</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collaborators.map((ctv) => {
                const refLink = ctv.referralLinks[0];
                return (
                  <tr key={ctv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                          {ctv.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{ctv.name}</p>
                          <p className="text-sm text-slate-500">{ctv.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {refLink ? (
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-primary-600">
                          {refLink.code}
                        </code>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-900">{refLink?.clickCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-green-600">{refLink?.orderCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(refLink?.revenue || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {ctv.active ? (
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Ngừng
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {collaborators.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Chưa có cộng tác viên nào</p>
              <Link
                href="/admin/ctv/them"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm CTV đầu tiên
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

