"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QRPayment from "./QRPayment";
import CopyButton from "./CopyButton";
import SuccessModal from "./SuccessModal";
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
  Sparkles,
} from "lucide-react";

interface Order {
  orderCode: string;
  totalPrice: number;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceId?: string; // Added for inventory simulation logic
}

interface Credential {
  chatbotLink?: string;
  activationCode?: string;
  accountInfo?: string; // fallback
  password?: string; // fallback
  apiKey?: string | null;
  notes: string | null;
  isPremium?: boolean;
}

function CredentialDisplay({ credential }: { credential: Credential }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const accountValue = credential.chatbotLink || credential.accountInfo || "";
  const passwordValue = credential.activationCode || credential.password || "";

  return (
    <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <Key className="w-5 h-5" />
        <span className="font-bold">
          {credential.isPremium ? "Thông tin bàn giao Gói Nâng Cấp" : "Thông tin bàn giao ChatBot"}
        </span>
      </div>

      <div className="space-y-3 bg-white rounded-xl p-4 shadow-sm">
        <div>
          <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            {credential.isPremium ? "Link Gói" : "Link ChatBot"}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 text-green-700 font-bold break-all">
              {accountValue}
            </code>
            <button
              onClick={() => copyToClipboard(accountValue, "acc")}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-transparent active:border-slate-200"
            >
              {copied === "acc" ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        {!credential.isPremium && (
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Mã kích hoạt</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 text-green-700 font-bold">
                {showPassword ? passwordValue : "••••••••••"}
              </code>
              <button onClick={() => setShowPassword(!showPassword)} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
              <button onClick={() => copyToClipboard(passwordValue, "pwd")} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-transparent active:border-slate-200">
                {copied === "pwd" ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          </div>
        )}

        {credential.notes && (
          <div className="pt-3 mt-1 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Hướng dẫn sử dụng</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{credential.notes}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
        <span>🔒</span> Vui lòng bảo mật thông tin này. Không chia sẻ cho người khác.
      </p>
    </div>
  );
}

function AccountNotice() {
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-blue-800 text-sm font-medium">
            Tài khoản quản lý đã được tạo!
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Đăng nhập bằng <strong>Email</strong> và mật khẩu là <strong>Số điện thoại</strong> của bạn tại trang đăng nhập.
          </p>
        </div>
      </div>
    </div>
  );
}

function SaveInfoNotice() {
  return (
    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-amber-800 text-sm font-bold">
            QUAN TRỌNG: Hãy lưu lại thông tin!
          </p>
          <p className="text-amber-600 text-xs mt-1 leading-relaxed">
            Bạn không cung cấp Email nên hệ thống <strong>không tạo tài khoản</strong> quản lý. Vui lòng chụp ảnh màn hình hoặc lưu lại Mã kích hoạt/Link ChatBot bên dưới để sử dụng.
          </p>
        </div>
      </div>
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async (retryCount = 0) => {
      if (!orderCode) {
        setError("Không có mã đơn hàng");
        setIsLoading(false);
        return;
      }

      try {
        console.log(`[SuccessPage] Fetching order ${orderCode} (Attempt ${retryCount + 1})...`);
        const res = await fetch(`/api/orders/by-code?code=${encodeURIComponent(orderCode)}`);
        const data = await res.json();

        if (data.order) {
          console.log("[SuccessPage] Order found:", data.order.orderCode, "Price:", data.order.totalPrice);
          setOrder(data.order);
          setError(""); // Clear any previous error
          if (data.order.status === "confirmed" || data.order.status === "completed") {
            setIsPaid(true);
            const deliveryData = data.order.deliveryData || data.order.chatbotData || data.order.credential;
            if (deliveryData) {
              setCredential(deliveryData);
              setShowSuccessModal(true);
            }
          }
          setIsLoading(false);
        } else if (retryCount < 3) {
          console.warn(`[SuccessPage] Order not found, retrying in 1.5s... (${retryCount + 1}/3)`);
          setTimeout(() => fetchOrder(retryCount + 1), 1500);
        } else {
          console.error("[SuccessPage] Order not found after max retries.");
          setOrder(null);
          setError("Không tìm thấy đơn hàng trong hệ thống. Vui lòng kiểm tra lại mã đơn hàng.");
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error("[SuccessPage] Fetch order error:", e);
        if (retryCount < 3) {
          setTimeout(() => fetchOrder(retryCount + 1), 1500);
        } else {
          setError(`Lỗi kết nối: ${e.message}`);
          setOrder(null);
          setIsLoading(false);
        }
      }
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
        const wasPaid = isPaid;
        setIsPaid(true);
        if (!wasPaid) {
          setShowSuccessModal(true);
        }
      } else if (data.order?.status === "confirmed" || data.order?.status === "completed") {
        setIsPaid(true);
      }
    } catch (e) {
      console.error("Check payment error:", e);
    }

    setCheckingPayment(false);
  };

  // Demo Success Function
  const handleDemoSuccess = async () => {
    if (!order) return;

    setCheckingPayment(true);

    try {
      // Create a mock SePay webhook payload
      const mockPayload = {
        id: Math.floor(Math.random() * 1000000),
        gateway: "Simulation",
        transactionDate: new Date().toISOString(),
        accountNumber: "SIM-123456",
        subAccount: null,
        code: null,
        content: order.orderCode,
        transferType: "in",
        description: `Simulated payment for order ${order.orderCode}`,
        transferAmount: order.totalPrice,
        referenceCode: `SIM-${Date.now()}`,
        accumulated: 0
      };

      const res = await fetch("/api/webhook/sepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockPayload)
      });

      if (res.ok) {
        console.log("Simulation triggered successfully");
        await checkPaymentStatus();
      } else {
        let errorMessage = "Không xác định";
        try {
          const errData = await res.json();
          // Check for message (SePay style) or error (standard API style)
          errorMessage = errData.message || errData.error || errorMessage;
        } catch (e) {
          if (res.status === 504) {
            errorMessage = "Máy chủ đang xử lý (Timeout). Vui lòng chờ 10-30 giây.";
          } else if (res.status === 500) {
            errorMessage = "Lỗi hệ thống (Internal Server Error). Vui lòng thử lại sau.";
          }
        }
        console.error("Simulation error:", errorMessage);
        alert("Lỗi mô phỏng: " + errorMessage);
      }
    } catch (err) {
      console.error("Simulation request error:", err);
      alert("Lỗi kết nối khi mô phỏng");
    } finally {
      setCheckingPayment(false);
    }
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
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Đặt hàng thành công!
        </h1>
        <p className="text-slate-500 text-sm">
          Thanh toán để nhận tài khoản ChatBot
        </p>
      </div>

      {/* Order Summary - Compact */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Mã đơn</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold font-mono text-primary-600">{order.orderCode}</p>
              <CopyButton text={order.orderCode} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Tổng tiền</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(order.totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Account or Save Notice */}
      {order.customerEmail ? <AccountNotice /> : <SaveInfoNotice />}

      {/* Payment QR */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-4">
        <QRPayment orderCode={order.orderCode} amount={order.totalPrice} />
      </div>

      {/* Check Payment Button */}
      <button
        onClick={checkPaymentStatus}
        disabled={checkingPayment}
        className="w-full py-3 px-4 bg-primary-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-50 mb-2"
      >
        {checkingPayment ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang kiểm tra...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Đã thanh toán? Kiểm tra ngay
          </>
        )}
      </button>
      <p className="text-xs text-slate-400 text-center mb-4">
        Tự động kiểm tra mỗi 10 giây
      </p>

      {/* Demo Success Button */}
      <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-dashed border-amber-200">
        <p className="text-xs text-amber-700 font-bold mb-2 uppercase text-center">Chế độ Thử nghiệm (Demo)</p>
        <button
          onClick={handleDemoSuccess}
          className="w-full py-2.5 px-4 bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 shadow-md transition-all active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
          MÔ PHỎNG THANH TOÁN THÀNH CÔNG
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/tra-cuu?code=${order.orderCode}`}
          className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          <Search className="w-4 h-4" />
          Tra cứu
        </Link>
        <Link
          href="/san-pham"
          className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          Mua thêm
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        order={{
          orderCode: order.orderCode,
          totalPrice: order.totalPrice,
          customerName: order.customerName
        }}
        credential={credential}
      />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header settings={{}} />

      <main className="pt-20 sm:pt-28 pb-10 sm:pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-md mx-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              }
            >
              <OrderSuccessContent />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer settings={{}} />
    </div>
  );
}
