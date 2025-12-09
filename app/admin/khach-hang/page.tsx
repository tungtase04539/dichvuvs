"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Users,
  Loader2,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalPrice: number;
  quantity: number;
  status: string;
  createdAt: string;
  serviceName: string;
  serviceIcon: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Fetch only paid orders
      const res = await fetch("/api/orders?status=confirmed");
      const confirmedData = await res.json();
      
      const res2 = await fetch("/api/orders?status=completed");
      const completedData = await res2.json();

      const allOrders = [
        ...(confirmedData.orders || []),
        ...(completedData.orders || []),
      ];

      const customerList: Customer[] = allOrders.map((order: {
        id: string;
        orderCode: string;
        customerName: string;
        customerPhone: string;
        customerEmail: string | null;
        totalPrice: number;
        quantity: number;
        status: string;
        createdAt: string;
        service: { name: string; icon: string };
      }) => ({
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        totalPrice: order.totalPrice,
        quantity: order.quantity || 1,
        status: order.status,
        createdAt: order.createdAt,
        serviceName: order.service?.name || "ChatBot",
        serviceIcon: order.service?.icon || "🤖",
      }));

      // Sort by date (newest first)
      customerList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setCustomers(customerList);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.customerName.toLowerCase().includes(search) ||
      customer.customerPhone.includes(search) ||
      customer.customerEmail?.toLowerCase().includes(search) ||
      customer.orderCode.toLowerCase().includes(search)
    );
  });

  const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalPrice, 0);
  const totalOrders = filteredCustomers.length;

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const exportData = filteredCustomers.map((c, index) => ({
        STT: index + 1,
        "Mã đơn hàng": c.orderCode,
        "Tên khách hàng": c.customerName,
        "Số điện thoại": c.customerPhone,
        Email: c.customerEmail || "",
        "Sản phẩm": c.serviceName,
        "Số lượng": c.quantity,
        "Tổng tiền": c.totalPrice,
        "Ngày thanh toán": new Date(c.createdAt).toLocaleString("vi-VN"),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 5 },
        { wch: 18 },
        { wch: 25 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Khách hàng đã thanh toán");

      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `khach-hang-da-thanh-toan-${date}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi xuất file");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khách hàng đã thanh toán</h1>
          <p className="text-slate-500 mt-1">Danh sách khách hàng đã hoàn tất thanh toán</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            disabled={isExporting || customers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Xuất Excel
          </button>
          <button
            onClick={fetchCustomers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Trung bình/đơn</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : "0đ"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, SĐT, email, mã đơn..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có khách hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm text-slate-600">
                  <th className="px-6 py-4 font-medium">STT</th>
                  <th className="px-6 py-4 font-medium">Khách hàng</th>
                  <th className="px-6 py-4 font-medium">Liên hệ</th>
                  <th className="px-6 py-4 font-medium">Sản phẩm</th>
                  <th className="px-6 py-4 font-medium">Giá trị</th>
                  <th className="px-6 py-4 font-medium">Ngày TT</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{customer.customerName}</p>
                      <p className="text-xs text-slate-400 font-mono">{customer.orderCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {customer.customerPhone}
                        </p>
                        {customer.customerEmail && (
                          <p className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {customer.customerEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{customer.serviceIcon}</span>
                        <div>
                          <p className="text-slate-700">{customer.serviceName}</p>
                          <p className="text-xs text-slate-400">x{customer.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-600">{formatCurrency(customer.totalPrice)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateTime(customer.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đã thanh toán
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

