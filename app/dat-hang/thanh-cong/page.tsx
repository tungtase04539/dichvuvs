"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import QRPayment from "./QRPayment";
import CopyButton from "./CopyButton";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  ArrowRight,
  Clock,
  CreditCard,
  Search,
  Loader2,
  AlertCircle,
  Home,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

interface Order {
  orderCode: string;
  totalPrice: number;
  status: string;
  customerName: string;
  customerPhone: string;
}

interface Credential {
  accountInfo: string;
  password: string;
  apiKey: string | null;
  notes: string | null;
}

function CredentialDisplay({ credential }: { credential: Credential }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <Key className="w-5 h-5" />
        <span className="font-bold">Thông tin tài khoản ChatBot</span>
      </div>

      <div className="space-y-3 bg-white rounded-xl p-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Tài khoản</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-slate-100 px-3 py-2 rounded text-green-600 font-semibold">
              {credential.accountInfo}
            </code>
            <button
              onClick={() => copyToClipboard(credential.accountInfo, "acc")}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              {copied === "acc" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Mật khẩu</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-slate-100 px-3 py-2 rounded text-green-600 font-semibold">
              {showPassword ? credential.password : "••••••••••"}
            </code>
            <button onClick={() => setShowPassword(!showPassword)} className="p-2 hover:bg-slate-100 rounded-lg">
              {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </button>
            <button onClick={() => copyToClipboard(credential.password, "pwd")} className="p-2 hover:bg-slate-100 rounded-lg">
              {copied === "pwd" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {credential.apiKey && (
          <div>
            <p className="text-xs text-slate-500 mb-1">API Key</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-slate-100 px-3 py-2 rounded text-green-600 truncate">
                {credential.apiKey}
              </code>
              <button onClick={() => copyToClipboard(credential.apiKey!, "api")} className="p-2 hover:bg-slate-100 rounded-lg">
                {copied === "api" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>
        )}

        {credential.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Hướng dẫn</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{credential.notes}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        🔒 Vui lòng bảo mật thông tin này. Không chia sẻ cho người khác.
      </p>
    </div>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setError("Không có mã đơn hàng");
        setIsLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setOrder({
          orderCode,
          totalPrice: 30000,
          status: "pending",
          customerName: "Khách hàng",
          customerPhone: "",
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("Order")
          .select("orderCode, totalPrice, status, customerName, customerPhone")
          .eq("orderCode", orderCode)
          .single();

        if (data) {
          setOrder(data);
          if (data.status === "confirmed" || data.status === "completed") {
            setIsPaid(true);
          }
        } else {
          setOrder({
            orderCode,
            totalPrice: 30000,
            status: "pending",
            customerName: "Khách hàng",
            customerPhone: "",
          });
        }
      } catch (e) {
        console.error("Fetch order error:", e);
      }
      
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderCode]);

  // Check payment status and fetch credentials
  const checkPaymentStatus = async () => {
    if (!order || !order.customerPhone) return;
    
    setCheckingPayment(true);
    
    try {
      const res = await fetch(
        `/api/orders/credentials?orderCode=${encodeURIComponent(order.orderCode)}&phone=${encodeURIComponent(order.customerPhone)}`
      );
      const data = await res.json();

      if (data.credential) {
        setCredential(data.credential);
        setIsPaid(true);
      } else if (data.order?.status === "confirmed" || data.order?.status === "completed") {
        setIsPaid(true);
      }
    } catch (e) {
      console.error("Check payment error:", e);
    }
    
    setCheckingPayment(false);
  };

  // Auto-check payment every 10 seconds if not paid
  useEffect(() => {
    if (!isPaid && order && order.customerPhone) {
      const interval = setInterval(checkPaymentStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [isPaid, order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 mb-6">{error || "Không tìm thấy đơn hàng"}</p>
        <Link href="/" className="btn btn-primary">
          <Home className="w-5 h-5" />
          Về trang chủ
        </Link>
      </div>
    );
  }

  // If paid and has credentials, show success with credentials
  if (isPaid && credential) {
    return (
      <>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-slate-600">
            Cảm ơn bạn đã mua hàng. Dưới đây là thông tin tài khoản của bạn.
          </p>
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
        <div className="mb-6">
          <CredentialDisplay credential={credential} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/san-pham" className="btn btn-primary flex-1">
            Tiếp tục mua sắm
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </>
    );
  }

  // If paid but no credentials yet
  if (isPaid && !credential) {
    return (
      <>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-slate-600">
            Tài khoản đang được chuẩn bị, vui lòng chờ trong giây lát...
          </p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-amber-800">Đang chuẩn bị tài khoản cho bạn...</p>
          <p className="text-sm text-amber-600 mt-1">Tự động kiểm tra mỗi 10 giây</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/tra-cuu?code=${order.orderCode}`}
            className="btn btn-primary flex-1"
          >
            <Search className="w-5 h-5" />
            Tra cứu đơn hàng
          </Link>
        </div>
      </>
    );
  }

  // Waiting for payment
  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-slate-600">
          Vui lòng thanh toán để nhận tài khoản ChatBot
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

      {/* Check Payment Button */}
      <div className="mb-6">
        <button
          onClick={checkPaymentStatus}
          disabled={checkingPayment}
          className="btn btn-secondary w-full"
        >
          {checkingPayment ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Tôi đã thanh toán - Kiểm tra ngay
            </>
          )}
        </button>
        <p className="text-xs text-slate-500 text-center mt-2">
          Hệ thống tự động kiểm tra mỗi 10 giây
        </p>
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
