"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import QRPayment from "./QRPayment";
import CopyButton from "./CopyButton";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  ArrowRight,
  Clock,
  CreditCard,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Order {
  orderCode: string;
  totalPrice: number;
  status: string;
  service?: {
    name: string;
    icon: string;
  };
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderCode) {
      // Simple mock - in real app, fetch from API
      setOrder({
        orderCode,
        totalPrice: 30000,
        status: "pending",
      });
      setIsLoading(false);
    }
  }, [orderCode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <>
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
          <CheckCircle className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-slate-600">
          Vui lòng thanh toán để hoàn tất đơn hàng
        </p>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-500">Mã đơn hàng</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold font-mono text-primary-600">
                {order.orderCode}
              </p>
              <CopyButton text={order.orderCode} />
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Chờ thanh toán
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600">Tổng thanh toán</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(order.totalPrice)}
          </span>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-600" />
          Thông tin thanh toán
        </h2>

        <QRPayment orderCode={order.orderCode} amount={order.totalPrice} />

        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
          <p className="text-sm text-primary-800">
            <strong>Lưu ý:</strong> Vui lòng ghi đúng nội dung chuyển khoản là{" "}
            <span className="font-mono font-bold">{order.orderCode}</span> để hệ thống
            tự động xác nhận thanh toán.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/tra-cuu?code=${order.orderCode}`}
          className="btn btn-primary flex-1"
        >
          <Search className="w-5 h-5" />
          Tra cứu đơn hàng
        </Link>
        <Link
          href="/san-pham"
          className="btn btn-secondary flex-1"
        >
          Tiếp tục mua sắm
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header settings={{}} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              }
            >
              <OrderSuccessContent />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}
