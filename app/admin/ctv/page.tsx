"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Search,
  Eye,
  Link2,
  Copy,
  Check,
  Loader2,
  UserPlus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CTV {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  referralCode: string | null;
  orderCount: number;
  revenue: number;
  clickCount: number;
}

export default function CTVManagementPage() {
  const [ctvs, setCtvs] = useState<CTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCTVs: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    fetchCTVs();
  }, []);

  const fetchCTVs = async () => {
    try {
      const res = await fetch("/api/admin/ctv/list");
      const data = await res.json();
      if (data.ctvs) {
        setCtvs(data.ctvs);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}?ref=${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCTVs = ctvs.filter(
    (ctv) =>
      ctv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ctv.phone && ctv.phone.includes(searchQuery)) ||
      (ctv.referralCode && ctv.referralCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý CTV</h1>
        <Link
          href="/admin/ctv/duyet"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <UserPlus className="w-4 h-4" />
          Duyệt đăng ký ({stats.pendingApplications})
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng CTV</p>
              <p className="text-xl font-bold text-slate-900">{stats.totalCTVs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Đơn từ CTV</p>
              <p className="text-xl font-bold text-slate-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Doanh thu CTV</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Chờ duyệt</p>
              <p className="text-xl font-bold text-slate-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT, mã ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* CTV List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredCTVs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có CTV nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">CTV</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Mã Ref</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Clicks</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Đơn hàng</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Doanh thu</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCTVs.map((ctv) => (
                <tr key={ctv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{ctv.name}</p>
                      <p className="text-sm text-slate-500">{ctv.email}</p>
                      {ctv.phone && <p className="text-sm text-slate-400">{ctv.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {ctv.referralCode ? (
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono font-bold text-primary-600">
                          {ctv.referralCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(ctv.referralCode!)}
                          className="p-1 hover:bg-slate-100 rounded"
                          title="Copy link ref"
                        >
                          {copiedCode === ctv.referralCode ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">Chưa có</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-slate-600">{ctv.clickCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {ctv.orderCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-slate-900">{formatCurrency(ctv.revenue)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/ctv/${ctv.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => ctv.referralCode && copyToClipboard(ctv.referralCode)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                        title="Copy link ref"
                      >
                        <Link2 className="w-4 h-4" />
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
