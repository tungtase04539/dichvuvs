"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";

interface Order {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  totalPrice: number;
  quantity: number;
  notes: string | null;
  createdAt: string;
  serviceName?: string;
}

interface ExportExcelProps {
  orders: Order[];
}

const statusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  confirmed: "Đã thanh toán",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function ExportExcel({ orders }: ExportExcelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = () => {
    setIsExporting(true);

    try {
      // Transform data for Excel
      const exportData = orders.map((order, index) => ({
        STT: index + 1,
        "Mã đơn hàng": order.orderCode,
        "Tên khách hàng": order.customerName,
        "Số điện thoại": order.customerPhone,
        Email: order.customerEmail || "",
        "Sản phẩm": order.serviceName || "ChatBot",
        "Số lượng": order.quantity,
        "Tổng tiền": order.totalPrice,
        "Trạng thái": statusLabels[order.status] || order.status,
        "Ghi chú": order.notes || "",
        "Ngày đặt": new Date(order.createdAt).toLocaleString("vi-VN"),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws["!cols"] = [
        { wch: 5 },   // STT
        { wch: 18 },  // Mã đơn hàng
        { wch: 25 },  // Tên khách hàng
        { wch: 15 },  // Số điện thoại
        { wch: 25 },  // Email
        { wch: 20 },  // Sản phẩm
        { wch: 10 },  // Số lượng
        { wch: 15 },  // Tổng tiền
        { wch: 15 },  // Trạng thái
        { wch: 30 },  // Ghi chú
        { wch: 20 },  // Ngày đặt
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");

      // Generate filename with date
      const date = new Date().toISOString().slice(0, 10);
      const filename = `don-hang-${date}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi xuất file, vui lòng thử lại");
    } finally {
      setIsExporting(false);
    }
  };

  const exportPaidOrders = () => {
    setIsExporting(true);

    try {
      // Filter only paid orders
      const paidOrders = orders.filter((o) =>
        ["confirmed", "completed"].includes(o.status)
      );

      const exportData = paidOrders.map((order, index) => ({
        STT: index + 1,
        "Mã đơn hàng": order.orderCode,
        "Tên khách hàng": order.customerName,
        "Số điện thoại": order.customerPhone,
        Email: order.customerEmail || "",
        "Sản phẩm": order.serviceName || "ChatBot",
        "Số lượng": order.quantity,
        "Tổng tiền": order.totalPrice,
        "Trạng thái": statusLabels[order.status] || order.status,
        "Ngày đặt": new Date(order.createdAt).toLocaleString("vi-VN"),
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
        { wch: 15 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Khách hàng đã thanh toán");

      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `khach-hang-da-thanh-toan-${date}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi xuất file, vui lòng thử lại");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToExcel}
        disabled={isExporting || orders.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Xuất Excel
      </button>

      <button
        onClick={exportPaidOrders}
        disabled={isExporting || orders.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        Xuất KH đã thanh toán
      </button>
    </div>
  );
}

