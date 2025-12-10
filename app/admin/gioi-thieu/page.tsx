import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Link2, MousePointer, ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getReferralStats() {
  const [referralLinks, stats, topPerformers] = await Promise.all([
    prisma.referralLink.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            parent: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.referralLink.aggregate({
      _sum: {
        clickCount: true,
        orderCount: true,
        revenue: true,
      },
    }),
    prisma.referralLink.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { revenue: "desc" },
      take: 5,
    }),
  ]);

  return { referralLinks, stats, topPerformers };
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  master_agent: "Tổng đại lý",
  agent: "Đại lý",
  staff: "Nhân viên",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  master_agent: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
  staff: "bg-slate-100 text-slate-700",
};

export default async function AdminReferralsPage() {
  const { referralLinks, stats, topPerformers } = await getReferralStats();

  const totalClicks = stats._sum.clickCount || 0;
  const totalOrders = stats._sum.orderCount || 0;
  const totalRevenue = stats._sum.revenue || 0;
  const conversionRate = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Mã giới thiệu</h1>
        <p className="text-slate-600">Theo dõi hiệu quả của các mã giới thiệu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Lượt click</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalOrders.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Đơn hàng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-slate-500">Doanh thu</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
              <p className="text-sm text-slate-500">Tỷ lệ chuyển đổi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Danh sách mã giới thiệu</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Mã</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Người sở hữu</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Click</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Đơn hàng</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-slate-400" />
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono font-medium text-primary-600">
                          {link.code}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{link.user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[link.user.role]}`}>
                            {roleLabels[link.user.role]}
                          </span>
                          {link.user.parent && (
                            <span className="text-xs text-slate-500">
                              thuộc {link.user.parent.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-900">{link.clickCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-green-600">{link.orderCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-primary-600">{formatCurrency(link.revenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {referralLinks.length === 0 && (
              <div className="text-center py-12">
                <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Chưa có mã giới thiệu nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Top doanh thu
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {topPerformers.map((link, index) => (
              <div
                key={link.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? "bg-amber-500" :
                  index === 1 ? "bg-slate-400" :
                  index === 2 ? "bg-amber-700" :
                  "bg-slate-300"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{link.user.name}</p>
                  <p className="text-xs text-slate-500">{link.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{formatCurrency(link.revenue)}</p>
                  <p className="text-xs text-slate-500">{link.orderCount} đơn</p>
                </div>
              </div>
            ))}

            {topPerformers.length === 0 && (
              <p className="text-center text-slate-500 py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

