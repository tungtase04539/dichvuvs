import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import DashboardChart from "./components/DashboardChart";

async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month stats
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    activeChats,
    totalStaff,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({
      where: { status: "completed", createdAt: { gte: startOfMonth } },
    }),
    prisma.order.aggregate({
      where: { status: "completed", createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true },
    }),
    prisma.chatSession.count({ where: { status: "active" } }),
    prisma.user.count({ where: { role: "staff", active: true } }),
  ]);

  // Last month stats for comparison
  const [lastMonthOrders, lastMonthRevenue] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.order.aggregate({
      where: {
        status: "completed",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalPrice: true },
    }),
  ]);

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    include: { service: true, assignedTo: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Recent chats
  const recentChats = await prisma.chatSession.findMany({
    where: { status: "active" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastActivity: "desc" },
    take: 5,
  });

  // Order stats by day for chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const ordersByDay = await Promise.all(
    last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await prisma.order.count({
        where: { createdAt: { gte: date, lt: nextDay } },
      });

      const revenue = await prisma.order.aggregate({
        where: {
          status: "completed",
          createdAt: { gte: date, lt: nextDay },
        },
        _sum: { totalPrice: true },
      });

      return {
        date: date.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit" }),
        orders: count,
        revenue: revenue._sum.totalPrice || 0,
      };
    })
  );

  const orderGrowth = lastMonthOrders > 0
    ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100)
    : 100;

  const revenueGrowth =
    (lastMonthRevenue._sum.totalPrice || 0) > 0
      ? Math.round(
          (((totalRevenue._sum.totalPrice || 0) - (lastMonthRevenue._sum.totalPrice || 0)) /
            (lastMonthRevenue._sum.totalPrice || 1)) *
            100
        )
      : 100;

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    activeChats,
    totalStaff,
    orderGrowth,
    revenueGrowth,
    recentOrders,
    recentChats,
    ordersByDay,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.orderGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.orderGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.orderGrowth)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
          <p className="text-sm text-slate-500">Đơn hàng tháng này</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pendingOrders}</p>
          <p className="text-sm text-slate-500">Đơn chờ xử lý</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.revenueGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.revenueGrowth)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-sm text-slate-500">Doanh thu tháng này</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeChats}</p>
          <p className="text-sm text-slate-500">Chat đang hoạt động</p>
        </div>
      </div>

      {/* Chart and Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Thống kê 7 ngày gần đây
            </h2>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <DashboardChart data={stats.ordersByDay} />
        </div>

        {/* Active chats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Chat mới</h2>
            <Link
              href="/admin/chat"
              className="text-sm text-primary-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentChats.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                Không có chat nào
              </p>
            ) : (
              stats.recentChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/admin/chat?session=${chat.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {(chat.guestName || "K").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {chat.guestName || "Khách"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {chat.messages[0]?.content || "Chưa có tin nhắn"}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Đơn hàng gần đây
          </h2>
          <Link
            href="/admin/don-hang"
            className="text-sm text-primary-600 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium">Mã đơn</th>
                <th className="pb-3 font-medium">Khách hàng</th>
                <th className="pb-3 font-medium">Dịch vụ</th>
                <th className="pb-3 font-medium">Giá trị</th>
                <th className="pb-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-4">
                    <Link
                      href={`/admin/don-hang/${order.id}`}
                      className="font-mono text-primary-600 hover:underline"
                    >
                      {order.orderCode}
                    </Link>
                  </td>
                  <td className="py-4">
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-500">{order.customerPhone}</p>
                  </td>
                  <td className="py-4">
                    <span className="text-xl mr-2">{order.service.icon}</span>
                    {order.service.name}
                  </td>
                  <td className="py-4 font-medium">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  return (
    <span className={`badge ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {labels[status] || status}
    </span>
  );
}

