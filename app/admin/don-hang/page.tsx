"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import ExportExcel from "./ExportExcel";

interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  district: string;
  status: string;
  orderPackageType?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number;
  quantity: number;
  notes?: string | null;
  createdAt: string;
  service: {
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.orderCode.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search) ||
      order.customerPhone.includes(search)
    );
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý đơn hàng</h1>
        <div className="flex items-center gap-3">
          <ExportExcel
            orders={filteredOrders.map(o => ({
              orderCode: o.orderCode,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              customerEmail: o.customerEmail || null,
              status: o.status,
              totalPrice: o.totalPrice,
              quantity: o.quantity || 1,
              notes: o.notes || null,
              createdAt: o.createdAt,
              serviceName: o.service?.name,
            }))}
          />
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, tên, SĐT..."
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm text-slate-600">
                  <th className="px-6 py-4 font-medium">Mã đơn</th>
                  <th className="px-6 py-4 font-medium">Khách hàng</th>
                  <th className="px-6 py-4 font-medium">Dịch vụ</th>
                  <th className="px-6 py-4 font-medium">Lịch hẹn</th>
                  <th className="px-6 py-4 font-medium">Giá trị</th>
                  <th className="px-6 py-4 font-medium">Gói</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/don-hang/${order.id}`}
                        className="font-mono text-primary-600 hover:underline font-medium"
                      >
                        {order.orderCode}
                      </Link>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-sm text-slate-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        <span className="text-slate-700">{order.service.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">
                        {new Date(order.scheduledDate).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-sm text-slate-500">{order.scheduledTime}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("badge",
                        (order.orderPackageType || "standard") === "gold" ? "bg-amber-100 text-amber-700" :
                          (order.orderPackageType || "standard") === "platinum" ? "bg-cyan-100 text-cyan-700" :
                            "bg-slate-100 text-slate-700"
                      )}>
                        {order.orderPackageType || "standard"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("badge", getStatusColor(order.status))}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/don-hang/${order.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(order.id, "confirmed")}
                              className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                              title="Xác nhận"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, "cancelled")}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                              title="Hủy"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "in_progress")}
                            className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"
                            title="Bắt đầu thực hiện"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === "in_progress" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "completed")}
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                            title="Hoàn thành"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
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

