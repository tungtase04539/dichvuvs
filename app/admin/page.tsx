import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Clock,
  DollarSign,
  MessageCircle,
  Users,
  Link2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function getDashboardStats() {
  // Prevent any caching
  noStore();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run all queries in parallel
  const [
    totalOrders,
    pendingOrders,
    totalRevenue,
    activeChats,
    totalAgents,
    totalCTVs,
    totalCommissions,
    ctvApplications,
    recentOrders,
    recentChats,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.aggregate({
      where: { status: { in: ["confirmed", "completed"] }, createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true },
    }),
    prisma.chatSession.count({ where: { status: "active" } }),
    prisma.user.count({ where: { role: { in: ["agent", "master_agent"] } } }),
    prisma.user.count({ where: { role: "ctv" } }),
    prisma.commission.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.cTVApplication.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerPhone: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.chatSession.findMany({
      where: { status: "active" },
      select: {
        id: true,
        guestName: true,
        messages: {
          select: { content: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastActivity: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    activeChats,
    totalAgents,
    totalCTVs,
    totalCommissions: totalCommissions._sum.amount || 0,
    ctvApplications,
    recentOrders,
    recentChats,
  };
}

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient();
  if (!supabase) redirect("/quan-tri-vien-dang-nhap");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/quan-tri-vien-dang-nhap");

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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Đơn hàng gần đây</h2>
            <Link
              href="/admin/don-hang"
              className="text-sm text-primary-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Chưa có đơn hàng</p>
              </div>
            ) : (
              stats.recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/don-hang/${order.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-500">{order.service.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
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
              stats.recentChats.map((chat: any) => (
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
    pending: "Chờ",
    confirmed: "Xác nhận",
    in_progress: "Đang làm",
    completed: "Xong",
    cancelled: "Hủy",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || "bg-slate-100"}`}>
      {labels[status] || status}
    </span>
  );
}
