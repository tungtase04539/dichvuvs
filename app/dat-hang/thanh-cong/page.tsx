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
  orderPackageType?: string | null; // standard, gold, platinum, single
}

// Zalo group links based on package type
const ZALO_GROUP_LINKS: Record<string, string> = {
  single: "https://zalo.me/g/nfcsbd681",
  standard: "https://zalo.me/g/xqgubk047",
  gold: "https://zalo.me/g/fredhp972",
  platinum: "https://zalo.me/g/vxcwcs969",
};

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

        {/* Nút tham gia nhóm Zalo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span>📱</span>
            Tham gia nhóm hỗ trợ
          </h3>
          <a
            href={ZALO_GROUP_LINKS[order.orderPackageType || "single"] || ZALO_GROUP_LINKS.single}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="currentColor">
              <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm10.243 14.057c-.547.27-1.102.52-1.654.752-.183.077-.367.152-.552.225a23.144 23.144 0 01-2.397.795c-.244.068-.49.134-.737.196-1.614.405-3.284.657-4.907.683a22.84 22.84 0 01-2.5-.078 22.306 22.306 0 01-2.407-.33 22.01 22.01 0 01-2.36-.581c-.23-.07-.458-.144-.687-.222a21.37 21.37 0 01-1.956-.764c-.21-.094-.418-.19-.625-.29-.1-.048-.199-.098-.298-.148a20 20 0 01-1.472-.843 15.5 15.5 0 01-1.203-.849 12 12 0 01-.934-.84 9 9 0 01-.71-.77 6.5 6.5 0 01-.5-.67 4 4 0 01-.32-.55 2.5 2.5 0 01-.18-.48 1.5 1.5 0 01-.08-.39.9.9 0 01.02-.27.6.6 0 01.13-.23.4.4 0 01.22-.12.35.35 0 01.24.05c.15.1.29.22.42.35.5.5 1.05.97 1.64 1.4.6.43 1.22.83 1.87 1.19.65.36 1.33.68 2.02.96.7.28 1.41.53 2.14.74.73.21 1.48.38 2.24.51.76.13 1.53.22 2.3.27.77.05 1.55.06 2.33.03.78-.03 1.55-.1 2.32-.21s1.52-.26 2.27-.45c.75-.19 1.48-.42 2.2-.69.72-.27 1.42-.58 2.1-.93s1.33-.73 1.96-1.14c.63-.41 1.23-.86 1.8-1.34.57-.48 1.1-1 1.6-1.55.5-.55.96-1.13 1.38-1.74.42-.61.8-1.25 1.13-1.91.33-.66.62-1.35.86-2.05.24-.7.43-1.42.57-2.15.14-.73.23-1.47.27-2.21.04-.74.03-1.49-.03-2.23-.06-.74-.17-1.48-.33-2.2-.16-.72-.37-1.43-.63-2.12-.26-.69-.57-1.36-.92-2.01a11 11 0 00-1.18-1.81 9.5 9.5 0 00-1.42-1.55 8 8 0 00-1.63-1.23 7 7 0 00-1.8-.87 6 6 0 00-1.93-.48 5.5 5.5 0 00-2 .06 5 5 0 00-1.87.6 4.5 4.5 0 00-1.55 1.12 4 4 0 00-1 1.55c-.2.55-.3 1.13-.3 1.71s.1 1.16.3 1.71c.2.55.5 1.05.9 1.48.4.43.87.78 1.4 1.03.52.25 1.08.4 1.66.45.58.05 1.16 0 1.71-.15.55-.15 1.06-.4 1.51-.73.45-.33.84-.73 1.15-1.19.31-.46.54-.97.68-1.5.14-.53.19-1.08.15-1.62-.04-.54-.17-1.07-.38-1.56-.21-.49-.5-.94-.86-1.33-.36-.39-.78-.71-1.25-.96-.47-.25-.97-.42-1.5-.51-.53-.09-1.07-.1-1.6-.03-.53.07-1.05.22-1.53.44-.48.22-.93.51-1.32.87-.39.36-.72.78-.98 1.24-.26.46-.45.96-.57 1.48-.12.52-.17 1.05-.14 1.58.03.53.14 1.05.32 1.54.18.49.43.95.74 1.36.31.41.68.78 1.1 1.08.42.3.88.54 1.37.71.49.17 1 .27 1.52.3.52.03 1.04-.02 1.54-.14.5-.12.98-.31 1.42-.57.44-.26.84-.58 1.19-.95s.64-.79.86-1.26c.22-.47.38-.97.47-1.48.09-.51.11-1.03.06-1.55-.05-.52-.17-1.02-.36-1.5-.19-.48-.45-.93-.77-1.33-.32-.4-.7-.76-1.12-1.05-.42-.29-.88-.52-1.37-.68-.49-.16-1-.25-1.52-.27-.52-.02-1.04.04-1.54.17-.5.13-.98.33-1.42.6-.44.27-.84.6-1.18.98-.34.38-.63.81-.85 1.27-.22.46-.38.95-.47 1.46-.09.51-.11 1.03-.05 1.54.06.51.19 1.01.39 1.48s.47.91.81 1.29c.34.38.74.71 1.18.98.44.27.92.47 1.42.6.5.13 1.02.19 1.54.17.52-.02 1.03-.11 1.52-.27.49-.16.95-.39 1.37-.68.42-.29.8-.65 1.12-1.05.32-.4.58-.85.77-1.33.19-.48.31-.98.36-1.5.05-.52.03-1.04-.06-1.55-.09-.51-.25-1.01-.47-1.48-.22-.47-.51-.91-.86-1.26-.35-.37-.75-.69-1.19-.95-.44-.26-.92-.45-1.42-.57-.5-.12-1.02-.17-1.54-.14-.52.03-1.03.13-1.52.3-.49.17-.95.41-1.37.71-.42.3-.79.67-1.1 1.08-.31.41-.56.87-.74 1.36-.18.49-.29 1.01-.32 1.54-.03.53.02 1.06.14 1.58.12.52.31 1.02.57 1.48.26.46.59.88.98 1.24.39.36.84.65 1.32.87.48.22 1 .37 1.53.44.53.07 1.07.06 1.6-.03.53-.09 1.03-.26 1.5-.51.47-.25.89-.57 1.25-.96.36-.39.65-.84.86-1.33.21-.49.34-1.02.38-1.56.04-.54-.01-1.09-.15-1.62-.14-.53-.37-1.04-.68-1.5-.31-.46-.7-.86-1.15-1.19-.45-.33-.96-.58-1.51-.73-.55-.15-1.13-.2-1.71-.15-.58.05-1.14.2-1.66.45-.53.25-1 .6-1.4 1.03-.4.43-.7.93-.9 1.48-.2.55-.3 1.13-.3 1.71s.1 1.16.3 1.71a4 4 0 001 1.55 4.5 4.5 0 001.55 1.12c.59.27 1.23.44 1.87.5.64.06 1.28-.01 1.89-.21.61-.2 1.18-.52 1.68-.95.5-.43.92-.96 1.23-1.55.31-.59.51-1.23.59-1.89.08-.66.04-1.33-.12-1.97-.16-.64-.44-1.25-.81-1.79-.37-.54-.84-1.01-1.38-1.38-.54-.37-1.15-.65-1.79-.81-.64-.16-1.31-.2-1.97-.12-.66.08-1.3.28-1.89.59-.59.31-1.12.73-1.55 1.23-.43.5-.75 1.07-.95 1.68-.2.61-.28 1.25-.22 1.89.05.64.23 1.27.52 1.85.29.58.69 1.1 1.18 1.53.49.43 1.05.77 1.66 1.01.61.24 1.25.37 1.9.38.65.01 1.3-.1 1.91-.33.61-.23 1.18-.57 1.67-1.01.49-.44.89-.97 1.18-1.56.29-.59.47-1.22.52-1.87.05-.65-.02-1.31-.23-1.93-.21-.62-.53-1.2-.95-1.71-.42-.51-.93-.94-1.51-1.27-.58-.33-1.21-.56-1.87-.68-.66-.12-1.33-.12-1.99-.01-.66.11-1.29.34-1.87.67-.58.33-1.09.77-1.51 1.28-.42.51-.74 1.1-.95 1.72-.21.62-.3 1.27-.27 1.93.03.66.19 1.31.47 1.91.28.6.67 1.14 1.16 1.59.49.45 1.06.81 1.68 1.06.62.25 1.27.39 1.93.42.66.03 1.32-.06 1.95-.26.63-.2 1.22-.51 1.74-.92.52-.41.97-.91 1.32-1.48.35-.57.6-1.2.74-1.85z"/>
            </svg>
            Tham gia nhóm Zalo hỗ trợ
          </a>
          <p className="text-center text-xs text-slate-500 mt-3">
            📢 Tham gia nhóm để nhận hướng dẫn sử dụng và hỗ trợ nhanh chóng
          </p>
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
