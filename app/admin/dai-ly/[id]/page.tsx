import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Link2,
  MousePointer,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const roleLabels: Record<string, string> = {
  admin: "Admin",
  master_agent: "Tổng đại lý",
  agent: "Đại lý",
  staff: "Nhân viên",
};

async function getAgentDetails(id: string, currentUserId: string, currentUserRole: string) {
  const agent = await prisma.user.findUnique({
    where: { id },
    include: {
      parent: {
        select: { id: true, name: true, email: true },
      },
      subAgents: {
        include: {
          referralLinks: true,
        },
      },
      referralLinks: {
        include: {
          clicks: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!agent) return null;

  // Check permission
  if (currentUserRole === "master_agent" && agent.parentId !== currentUserId && agent.id !== currentUserId) {
    return null;
  }

  // Get orders attributed to this agent
  const referredOrders = await prisma.order.findMany({
    where: { referrerId: id },
    include: {
      service: {
        select: { name: true, icon: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return { agent, referredOrders };
}

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const user = await getSession();
  
  if (!user || !["admin", "master_agent"].includes(user.role)) {
    redirect("/admin");
  }

  const data = await getAgentDetails(params.id, user.id, user.role);
  
  if (!data) {
    notFound();
  }

  const { agent, referredOrders } = data;
  const refLink = agent.referralLinks[0];

  const stats = {
    clicks: refLink?.clickCount || 0,
    orders: refLink?.orderCount || 0,
    revenue: refLink?.revenue || 0,
    conversionRate: refLink?.clickCount ? ((refLink.orderCount / refLink.clickCount) * 100).toFixed(1) : 0,
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/dai-ly"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Chi tiết đại lý</h1>
      </div>

      {/* Agent Info */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${
              agent.role === "master_agent" ? "bg-blue-600" : "bg-green-600"
            }`}>
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{agent.name}</h2>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                agent.role === "master_agent" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {roleLabels[agent.role]}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              agent.active 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {agent.active ? "Hoạt động" : "Ngừng"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{agent.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Điện thoại</p>
                <p className="font-medium text-slate-900">{agent.phone || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Ngày tham gia</p>
                <p className="font-medium text-slate-900">
                  {format(agent.createdAt, "dd/MM/yyyy", { locale: vi })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Link2 className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Mã giới thiệu</p>
                {refLink ? (
                  <code className="font-mono font-medium text-primary-600">{refLink.code}</code>
                ) : (
                  <span className="text-slate-400">Chưa có</span>
                )}
              </div>
            </div>
          </div>

          {agent.parent && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 mb-1">Thuộc Tổng đại lý</p>
              <p className="font-medium text-blue-900">{agent.parent.name}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.clicks.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Lượt click</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.orders}</p>
                <p className="text-xs text-slate-500">Đơn hàng</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.revenue)}</p>
                <p className="text-xs text-slate-500">Doanh thu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</p>
                <p className="text-xs text-slate-500">Tỷ lệ chuyển đổi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-agents (if master_agent) */}
      {agent.role === "master_agent" && agent.subAgents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Đại lý trực thuộc ({agent.subAgents.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Đại lý</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Mã ref</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Click</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Đơn</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agent.subAgents.map((sub) => {
                  const subRef = sub.referralLinks[0];
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-900">{sub.name}</p>
                        <p className="text-sm text-slate-500">{sub.email}</p>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {subRef ? (
                          <code className="text-sm font-mono text-primary-600">{subRef.code}</code>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-3 text-center">{subRef?.clickCount || 0}</td>
                      <td className="px-6 py-3 text-center">{subRef?.orderCount || 0}</td>
                      <td className="px-6 py-3 text-right font-medium text-primary-600">
                        {formatCurrency(subRef?.revenue || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referred Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Đơn hàng từ giới thiệu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Mã đơn</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Khách hàng</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Sản phẩm</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Giá trị</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <code className="text-sm font-mono text-slate-700">{order.orderCode}</code>
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span>{order.service.icon}</span>
                      <span className="text-slate-700">{order.service.name}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {order.status === "completed" ? "Hoàn thành" :
                       order.status === "pending" ? "Chờ xử lý" :
                       order.status === "cancelled" ? "Đã hủy" : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-primary-600">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-slate-500">
                    {format(order.createdAt, "dd/MM/yyyy", { locale: vi })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {referredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chưa có đơn hàng nào từ mã giới thiệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

