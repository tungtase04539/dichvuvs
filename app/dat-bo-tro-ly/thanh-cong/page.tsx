"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  ArrowRight,
  Clock,
  Loader2,
  Package,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface BundleOrder {
  id: string;
  orderCode: string;
  totalPrice: number;
  status: string;
  customerName: string;
  customerPhone: string;
  orderPackageType?: string | null;
  bundle: {
    id: string;
    name: string;
    slug: string;
  };
  deliveryData?: {
    chatbotLink?: string;
    activationCode?: string;
  } | null;
}

// Zalo group links based on package type
const ZALO_GROUP_LINKS: Record<string, string> = {
  standard: "https://zalo.me/g/xqgubk047",
  gold: "https://zalo.me/g/fredhp972",
  platinum: "https://zalo.me/g/vxcwcs969",
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "";
  const [order, setOrder] = useState<BundleOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderCode]);

  // Auto-check payment every 10s
  useEffect(() => {
    if (order && !isPaid) {
      const interval = setInterval(checkPayment, 10000);
      return () => clearInterval(interval);
    }
  }, [order, isPaid]);

  const fetchOrder = async () => {
    if (!orderCode) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/bundle-orders?code=${orderCode}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        if (data.order.status === "confirmed" || data.order.status === "completed") {
          setIsPaid(true);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!order) return;
    setCheckingPayment(true);

    try {
      const res = await fetch(`/api/bundle-orders?code=${order.orderCode}&phone=${order.customerPhone}`);
      const data = await res.json();
      if (data.order?.status === "confirmed" || data.order?.status === "completed") {
        setOrder(data.order);
        setIsPaid(true);
      }
    } catch (error) {
      console.error("Check payment error:", error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy đơn hàng</h1>
        <p className="text-slate-500 mb-6">Vui lòng kiểm tra lại mã đơn hàng</p>
        <Link href="/bo-tro-ly" className="btn btn-primary">
          Quay lại
        </Link>
      </div>
    );
  }

  // Paid with credentials
  if (isPaid && order.deliveryData) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h1>
          <p className="text-slate-600">Cảm ơn bạn đã mua {order.bundle.name}</p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mã đơn hàng</p>
              <p className="text-xl font-bold font-mono text-primary-600">{order.orderCode}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Đã thanh toán
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-6">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Key className="w-5 h-5" />
            <span className="font-bold">Thông tin bàn giao</span>
          </div>

          <div className="space-y-4 bg-white rounded-xl p-4">
            {order.deliveryData.chatbotLink && (
              <div>
                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Link truy cập</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-green-700 break-all">
                    {order.deliveryData.chatbotLink}
                  </code>
                  <button
                    onClick={() => copyToClipboard(order.deliveryData!.chatbotLink!, "link")}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    {copied === "link" ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>
            )}

            {order.deliveryData.activationCode && (
              <div>
                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Mã kích hoạt</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-green-700">
                    {showCode ? order.deliveryData.activationCode : "••••••••••"}
                  </code>
                  <button onClick={() => setShowCode(!showCode)} className="p-2 hover:bg-slate-100 rounded-lg">
                    {showCode ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(order.deliveryData!.activationCode!, "code")}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    {copied === "code" ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zalo Group */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span>📱</span>
            Tham gia nhóm hỗ trợ
          </h3>
          <a
            href={ZALO_GROUP_LINKS[order.orderPackageType || "standard"] || ZALO_GROUP_LINKS.standard}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all"
          >
            Tham gia nhóm Zalo
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex gap-4">
          <Link href="/bo-tro-ly" className="btn btn-secondary flex-1">
            Xem thêm bộ trợ lý
          </Link>
          <Link href="/tai-khoan" className="btn btn-primary flex-1">
            Tài khoản của tôi
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Waiting for payment
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Đặt hàng thành công!</h1>
        <p className="text-slate-500 text-sm">Thanh toán để nhận bộ trợ lý</p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Mã đơn</p>
            <p className="text-lg font-bold font-mono text-primary-600">{order.orderCode}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Tổng tiền</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(order.totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Payment Waiting */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-600" />
          <div>
            <h3 className="font-bold text-amber-800">Chờ thanh toán</h3>
            <p className="text-sm text-amber-600">Chuyển khoản theo thông tin bên dưới</p>
          </div>
        </div>
      </div>

      {/* Bank Info - You would add QR code here similar to the regular order flow */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <p className="text-center text-slate-500 mb-4">
          Quét mã QR hoặc chuyển khoản theo thông tin đơn hàng
        </p>
        <p className="text-center text-sm text-slate-400">
          Nội dung chuyển khoản: <strong className="text-slate-900">{order.orderCode}</strong>
        </p>
      </div>

      <button
        onClick={checkPayment}
        disabled={checkingPayment}
        className="w-full btn btn-primary mb-4"
      >
        {checkingPayment ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang kiểm tra...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Kiểm tra thanh toán
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Tự động kiểm tra mỗi 10 giây
      </p>
    </div>
  );
}

export default function BundleSuccessPage() {
  return (
    <>
      <Header settings={{}} />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
          }>
            <OrderSuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer settings={{}} />
    </>
  );
}
