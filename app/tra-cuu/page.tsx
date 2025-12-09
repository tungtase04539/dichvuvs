"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import {
  Search,
  Loader2,
  Package,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  ArrowLeft,
  Home,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: string;
  service: {
    name: string;
    icon: string;
  };
  assignedTo?: {
    name: string;
    phone: string;
  };
}

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderCode.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/orders?orderCode=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Không tìm thấy đơn hàng");
        return;
      }

      setOrder(data.order);
    } catch {
      setError("Đã có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const statusSteps = ["pending", "confirmed", "in_progress", "completed"];
  const getCurrentStep = () => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    return statusSteps.indexOf(order.status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header settings={{}} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Link>

            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-bold text-slate-900 mb-4">
                Tra cứu đơn hàng
              </h1>
              <p className="text-slate-600">
                Nhập mã đơn hàng và số điện thoại để xem trạng thái
              </p>
            </div>

            {/* Search form */}
            <div className="card p-6 mb-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mã đơn hàng
                  </label>
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                    placeholder="VD: VS241209ABCD"
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="input"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tìm kiếm...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Tra cứu
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order result */}
            {searched && !isLoading && order && (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Mã đơn hàng</p>
                    <p className="text-xl font-bold font-mono text-primary-600">
                      {order.orderCode}
                    </p>
                  </div>
                  <span className={cn("badge text-sm", getStatusColor(order.status))}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Progress steps */}
                {order.status !== "cancelled" && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                      {statusSteps.map((step, index) => (
                        <div key={step} className="flex flex-col items-center z-10">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                              getCurrentStep() >= index
                                ? "bg-primary-500 border-primary-500 text-white"
                                : "bg-white border-slate-200 text-slate-400"
                            )}
                          >
                            {getCurrentStep() > index ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <span className="text-xs text-slate-500 mt-2 text-center">
                            {getStatusLabel(step)}
                          </span>
                        </div>
                      ))}
                      {/* Progress line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-0">
                        <div
                          className="h-full bg-primary-500 transition-all"
                          style={{
                            width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Order details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <span className="text-3xl">{order.service.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{order.service.name}</p>
                      <p className="text-sm text-slate-600">
                        Số lượng: {order.quantity} {order.unit}
                      </p>
                      <p className="text-primary-600 font-semibold mt-1">
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Ngày thực hiện</p>
                        <p className="font-medium">
                          {new Date(order.scheduledDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Khung giờ</p>
                        <p className="font-medium">{order.scheduledTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Địa chỉ</p>
                        <p className="font-medium">
                          {order.address}, {order.district}, TP.HCM
                        </p>
                      </div>
                    </div>

                    {order.assignedTo && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <User className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500">Nhân viên phụ trách</p>
                          <p className="font-medium">{order.assignedTo.name}</p>
                          {order.assignedTo.phone && (
                            <a
                              href={`tel:${order.assignedTo.phone}`}
                              className="text-primary-600 text-sm hover:underline"
                            >
                              {order.assignedTo.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      Đặt lúc: {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {searched && !isLoading && !order && !error && (
              <div className="card p-8 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy đơn hàng</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}

