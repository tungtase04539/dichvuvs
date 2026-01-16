"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Loader2,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface CTVRanking {
  id: string;
  name: string;
  email: string;
  role: string;
  orderCount: number;
  revenue: number;
  refCode: string;
}

export default function CTVRankingPage() {
  const [rankings, setRankings] = useState<CTVRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ctv/ranking");
      const data = await res.json();
      if (data.rankings) {
        setRankings(data.rankings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/admin/ctv/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ctv_export_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Lỗi xuất dữ liệu");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    } finally {
      setIsExporting(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 1:
        return "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200";
      case 2:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-slate-100";
    }
  };

  const totalRevenue = rankings.reduce((sum, ctv) => sum + ctv.revenue, 0);
  const totalOrders = rankings.reduce((sum, ctv) => sum + ctv.orderCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Bảng Xếp Hạng CTV
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Xếp hạng cộng tác viên theo doanh thu giới thiệu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Xuất Excel
          </button>
          <button
            onClick={fetchRankings}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={cn("w-5 h-5 text-slate-600", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng CTV</p>
              <p className="text-2xl font-black text-slate-900">{rankings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng đơn giới thiệu</p>
              <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl p-6 text-center border-2 border-slate-200 mt-8">
            <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-black">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg truncate">{rankings[1]?.name}</h3>
            <p className="text-sm text-slate-500 mb-2">{rankings[1]?.orderCount} đơn</p>
            <p className="text-xl font-black text-slate-700">{formatCurrency(rankings[1]?.revenue || 0)}</p>
          </div>

          {/* 1st Place */}
          <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-6 text-center border-2 border-yellow-300 relative">
            <Crown className="w-8 h-8 text-yellow-500 absolute -top-4 left-1/2 -translate-x-1/2" />
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-3xl font-black shadow-lg shadow-yellow-400/30">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-xl truncate">{rankings[0]?.name}</h3>
            <p className="text-sm text-slate-500 mb-2">{rankings[0]?.orderCount} đơn</p>
            <p className="text-2xl font-black text-amber-600">{formatCurrency(rankings[0]?.revenue || 0)}</p>
          </div>

          {/* 3rd Place */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center border-2 border-amber-200 mt-12">
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl font-black">
              3
            </div>
            <h3 className="font-bold text-slate-900 truncate">{rankings[2]?.name}</h3>
            <p className="text-sm text-slate-500 mb-2">{rankings[2]?.orderCount} đơn</p>
            <p className="text-lg font-black text-amber-600">{formatCurrency(rankings[2]?.revenue || 0)}</p>
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Chi tiết doanh thu CTV
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Users className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có CTV nào</h3>
            <p className="text-slate-500">Duyệt CTV để bắt đầu theo dõi doanh thu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-6 py-4 w-16">Hạng</th>
                  <th className="px-6 py-4">CTV</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Mã giới thiệu</th>
                  <th className="px-6 py-4 text-right">Số đơn</th>
                  <th className="px-6 py-4 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {rankings.map((ctv, index) => (
                  <tr key={ctv.id} className={cn("transition-colors", getRankBg(index))}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg",
                          index === 0 ? "bg-yellow-400 text-white" :
                          index === 1 ? "bg-slate-300 text-white" :
                          index === 2 ? "bg-amber-500 text-white" :
                          "bg-primary-100 text-primary-600"
                        )}>
                          {ctv.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{ctv.name}</p>
                          <p className="text-xs text-slate-500">{ctv.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        ctv.role === "senior_ctv" ? "bg-purple-100 text-purple-700" :
                        ctv.role === "agency" ? "bg-blue-100 text-blue-700" :
                        "bg-primary-100 text-primary-700"
                      )}>
                        {ctv.role === "senior_ctv" ? "Senior CTV" : ctv.role === "agency" ? "Đại lý" : "CTV"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">
                        {ctv.refCode || "N/A"}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-900">{ctv.orderCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-black",
                        index === 0 ? "text-yellow-600 text-lg" :
                        index === 1 ? "text-slate-600" :
                        index === 2 ? "text-amber-600" :
                        "text-primary-600"
                      )}>
                        {formatCurrency(ctv.revenue)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
