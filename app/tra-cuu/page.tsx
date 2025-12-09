"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import {
  Search,
  Loader2,
  Package,
  Calendar,
  User,
  Phone,
  ArrowLeft,
  CheckCircle,
  Mail,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: string;
  totalPrice: number;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: string;
  service: {
    name: string;
    icon: string;
  };
}

interface Credential {
  accountInfo: string;
  password: string;
  apiKey: string | null;
  notes: string | null;
}

function CredentialDisplay({ orderCode, phone }: { orderCode: string; phone: string }) {
  const [credential, setCredential] = useState<Credential | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const loadCredential = async () => {
      try {
        const res = await fetch(
          `/api/orders/credentials?orderCode=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(phone)}`
        );
        const data = await res.json();
        
        if (data.credential) {
          setCredential(data.credential);
        } else {
          setMessage(data.message || "Đang xử lý");
        }
      } catch {
        setMessage("Không thể tải thông tin");
      } finally {
        setIsLoading(false);
      }
    };

    loadCredential();
  }, [orderCode, phone]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-slate-300">Đang tải thông tin tài khoản...</span>
        </div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Đã thanh toán!</span>
        </div>
        <p className="text-sm text-slate-300">
          {message || "Tài khoản đang được chuẩn bị, vui lòng liên hệ hỗ trợ."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
      <div className="flex items-center gap-2 text-green-400 mb-4">
        <Key className="w-5 h-5" />
        <span className="font-semibold">Thông tin tài khoản ChatBot</span>
      </div>

      <div className="space-y-3 bg-slate-900/50 rounded-lg p-4">
        {/* Account */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Tài khoản</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-slate-800 px-3 py-2 rounded text-green-400">
              {credential.accountInfo}
            </code>
            <button
              onClick={() => copyToClipboard(credential.accountInfo, "acc")}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Sao chép"
            >
              {copied === "acc" ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Mật khẩu</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-slate-800 px-3 py-2 rounded text-green-400">
              {showPassword ? credential.password : "••••••••••"}
            </code>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title={showPassword ? "Ẩn" : "Hiện"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(credential.password, "pwd")}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Sao chép"
            >
              {copied === "pwd" ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* API Key */}
        {credential.apiKey && (
          <div>
            <p className="text-xs text-slate-400 mb-1">API Key</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-slate-800 px-3 py-2 rounded text-green-400 truncate">
                {credential.apiKey}
              </code>
              <button
                onClick={() => copyToClipboard(credential.apiKey!, "api")}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Sao chép"
              >
                {copied === "api" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        {credential.notes && (
          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Hướng dẫn</p>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{credential.notes}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        🔒 Vui lòng bảo mật thông tin này. Không chia sẻ cho người khác.
      </p>
    </div>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Auto-fill from URL params
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setOrderCode(code);
    }
  }, [searchParams]);

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

    // Query Supabase DIRECTLY - INSTANT!
    const { data, error: err } = await supabase
      .from("Order")
      .select(`
        id,
        orderCode,
        customerName,
        customerPhone,
        customerEmail,
        status,
        totalPrice,
        quantity,
        unit,
        notes,
        createdAt,
        serviceId
      `)
      .eq("orderCode", orderCode)
      .eq("customerPhone", phone)
      .single();

    if (err || !data) {
      setError("Không tìm thấy đơn hàng");
      setIsLoading(false);
      return;
    }

    // Get service info
    const { data: serviceData } = await supabase
      .from("Service")
      .select("name, icon")
      .eq("id", data.serviceId)
      .single();

    setOrder({
      ...data,
      service: serviceData || { name: "ChatBot", icon: "🤖" },
    });
    setIsLoading(false);
  };

  const statusSteps = ["pending", "confirmed", "in_progress", "completed"];
  const getCurrentStep = () => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    return statusSteps.indexOf(order.status);
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Tra cứu đơn hàng
        </h1>
        <p className="text-slate-400">
          Nhập mã đơn hàng và số điện thoại để xem trạng thái
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mã đơn hàng
            </label>
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
              placeholder="VD: CB241209ABCD"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
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
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-400">Mã đơn hàng</p>
              <p className="text-xl font-bold font-mono text-purple-400">
                {order.orderCode}
              </p>
            </div>
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusColor(order.status))}>
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
                          ? "bg-purple-500 border-purple-500 text-white"
                          : "bg-slate-800 border-slate-600 text-slate-500"
                      )}
                    >
                      {getCurrentStep() > index ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-2 text-center">
                      {getStatusLabel(step)}
                    </span>
                  </div>
                ))}
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-700 -z-0">
                  <div
                    className="h-full bg-purple-500 transition-all"
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
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-3xl">{order.service.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-white">{order.service.name}</p>
                <p className="text-sm text-slate-400">
                  Số lượng: {order.quantity} bot
                </p>
              </div>
              <p className="text-purple-400 font-bold">
                {formatCurrency(order.totalPrice)}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Khách hàng</p>
                  <p className="font-medium text-white">{order.customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Số điện thoại</p>
                  <p className="font-medium text-white">{order.customerPhone}</p>
                </div>
              </div>

              {order.customerEmail && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="font-medium text-white">{order.customerEmail}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 md:col-span-2">
                <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Ngày đặt</p>
                  <p className="font-medium text-white">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Ghi chú</p>
                <p className="text-white">{order.notes}</p>
              </div>
            )}

            {(order.status === "confirmed" || order.status === "completed") && (
              <CredentialDisplay orderCode={order.orderCode} phone={phone} />
            )}
          </div>
        </div>
      )}

      {searched && !isLoading && !order && !error && (
        <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Không tìm thấy đơn hàng</p>
        </div>
      )}
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header settings={{}} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Link>

            <Suspense fallback={
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
              </div>
            }>
              <TrackOrderContent />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}
