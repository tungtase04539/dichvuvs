"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  Filter,
  Package,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Commission {
  id: string;
  amount: number;
  percent: number;
  level: number;
  status: string;
  createdAt: string;
  order: {
    id: string;
    orderCode: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    service: { name: string };
  };
}

export default function CommissionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [summary, setSummary] = useState({ pending: 0, paid: 0, total: 0 });

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter]);

  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const endpoint = isAdmin ? "/api/admin/commissions" : "/api/ctv/commissions";
      const res = await fetch(`${endpoint}?status=${statusFilter}`);
      const data = await res.json();
      setCommissions(data.commissions || []);
      setSummary(data.summary || { pending: 0, paid: 0, total: 0 });
    } catch (error) {
      console.error("Error fetching commissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return "Trực tiếp";
      case 2: return "Override L1";
      case 3: return "Override L2";
      default: return `Level ${level}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? "Quản lý hoa hồng" : "Hoa hồng của tôi"}
          </h1>
          <p className="text-slate-500 mt-1">Theo dõi hoa hồng từ các đơn hàng</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.pending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Đã thanh toán</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.paid)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng cộng</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
          </select>
        </div>
      </div>

      {/* Commissions List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có hoa hồng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm text-slate-600">
                  <th className="px-6 py-4 font-medium">Đơn hàng</th>
                  <th className="px-6 py-4 font-medium">Sản phẩm</th>
                  <th className="px-6 py-4 font-medium">Giá trị đơn</th>
                  <th className="px-6 py-4 font-medium">Hoa hồng</th>
                  <th className="px-6 py-4 font-medium">Loại</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-primary-600 font-medium">
                        {commission.order.orderCode}
                      </p>
                      <p className="text-sm text-slate-500">{commission.order.customerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{commission.order.service.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(commission.order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-600">{formatCurrency(commission.amount)}</p>
                      <p className="text-xs text-slate-500">{commission.percent}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        commission.level === 1 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {getLevelLabel(commission.level)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        commission.status === "paid" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {commission.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(commission.createdAt)}
                      </div>
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
