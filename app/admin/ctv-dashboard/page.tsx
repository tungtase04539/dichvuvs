"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Link2,
  Copy,
  Check,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Stats {
  balance: number;
  commission: {
    pending: { amount: number; count: number };
    paid: { amount: number; count: number };
    total: { amount: number; count: number };
  };
  thisMonth: { orders: number; revenue: number };
  lastMonth: { orders: number; revenue: number };
  total: { orders: number; revenue: number };
  pendingOrders: number;
  referral: {
    links: Array<{ code: string; clickCount: number; orderCount: number; revenue: number }>;
    totalClicks: number;
    conversionRate: number;
  };
  team: { count: number; commission: number };
}

export default function CTVDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/ctv/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    const url = `${window.location.origin}?ref=${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const createReferralLink = async () => {
    try {
      const res = await fetch("/api/referral", { method: "POST" });
      if (res.ok) {
        fetchStats();
      }
    } catch (error) {
      console.error("Error creating referral link:", error);
    }
  };

  const revenueChange = stats
    ? stats.lastMonth.revenue > 0
      ? ((stats.thisMonth.revenue - stats.lastMonth.revenue) / stats.lastMonth.revenue) * 100
      : stats.thisMonth.revenue > 0 ? 100 : 0
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard CTV</h1>
          <p className="text-slate-500 mt-1">
            Xin chào, <span className="font-semibold text-primary-600">{user?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rut-tien"
            className="btn btn-primary"
          >
            <Wallet className="w-5 h-5" />
            Rút tiền
          </Link>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Số dư khả dụng</p>
            <p className="text-4xl font-black mt-2">{formatCurrency(stats?.balance || 0)}</p>
            <p className="text-primary-200 text-sm mt-2">
              Hoa hồng chờ duyệt: {formatCurrency(stats?.commission.pending.amount || 0)}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {revenueChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${revenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                {revenueChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(revenueChange).toFixed(0)}%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.thisMonth.revenue || 0)}</p>
          <p className="text-sm text-slate-500">Doanh số tháng này</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.thisMonth.orders || 0}</p>
          <p className="text-sm text-slate-500">Đơn hàng tháng này</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.referral.conversionRate || 0}%</p>
          <p className="text-sm text-slate-500">Tỷ lệ chuyển đổi</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.team.count || 0}</p>
          <p className="text-sm text-slate-500">Thành viên đội nhóm</p>
        </div>
      </div>

      {/* Referral Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary-500" />
            Link giới thiệu
          </h2>
          {(!stats?.referral.links || stats.referral.links.length === 0) && (
            <button onClick={createReferralLink} className="btn btn-primary btn-sm">
              Tạo link mới
            </button>
          )}
        </div>

        {stats?.referral.links && stats.referral.links.length > 0 ? (
          <div className="space-y-4">
            {stats.referral.links.map((link) => (
              <div key={link.code} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <code className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg font-mono font-bold">
                      {link.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(link.code)}
                      className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      {copiedCode === link.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <a
                    href={`/?ref=${link.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                  >
                    Xem link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{link.clickCount}</p>
                    <p className="text-xs text-slate-500">Lượt click</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{link.orderCount}</p>
                    <p className="text-xs text-slate-500">Đơn hàng</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(link.revenue)}</p>
                    <p className="text-xs text-slate-500">Doanh thu</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Link2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Chưa có link giới thiệu</p>
            <p className="text-sm">Tạo link để bắt đầu kiếm hoa hồng</p>
          </div>
        )}
      </div>

      {/* Commission Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Hoa hồng</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-slate-700">Chờ duyệt</span>
              </div>
              <span className="font-bold text-yellow-700">
                {formatCurrency(stats?.commission.pending.amount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-700">Đã nhận</span>
              </div>
              <span className="font-bold text-green-700">
                {formatCurrency(stats?.commission.paid.amount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium">Tổng cộng</span>
              </div>
              <span className="font-bold text-slate-900">
                {formatCurrency(stats?.commission.total.amount || 0)}
              </span>
            </div>
          </div>
          <Link
            href="/admin/hoa-hong"
            className="block text-center text-primary-600 hover:text-primary-700 mt-4 text-sm font-medium"
          >
            Xem chi tiết →
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Thống kê nhanh</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tổng đơn hàng</span>
              <span className="font-bold text-slate-900">{stats?.total.orders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tổng doanh thu</span>
              <span className="font-bold text-slate-900">{formatCurrency(stats?.total.revenue || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Đơn chờ xử lý</span>
              <span className="font-bold text-yellow-600">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tổng lượt click</span>
              <span className="font-bold text-slate-900">{stats?.referral.totalClicks || 0}</span>
            </div>
            {(stats?.team?.count ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Hoa hồng từ đội nhóm</span>
                <span className="font-bold text-purple-600">{formatCurrency(stats?.team.commission || 0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
