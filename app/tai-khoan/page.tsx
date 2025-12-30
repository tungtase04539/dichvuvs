"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  LogOut,
  Loader2,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Key,
  Copy,
  Check,
  Link2,
  User,
  ShieldCheck,
  ChevronRight,
  Zap,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface Order {
  id: string;
  orderCode: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  service: {
    name: string;
  };
  credential?: {
    accountInfo: string;  // Đường link
    password: string;     // Mã đăng nhập
    notes: string;        // Ghi chú
  } | null;
}

// Copy button component
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${copied
        ? "bg-green-500/20 text-green-400 border border-green-500/30"
        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
        }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Đã chép
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label || "Sao chép"}
        </>
      )}
    </button>
  );
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/quan-tri-vien-dang-nhap");
          return;
        }
        const userData = await userRes.json();
        setUserInfo(userData.user);

        // Redirect admin/staff to admin panel immediately
        // We use the role from /api/auth/me which is now synchronized with the DB
        if (userData.user.role === "admin" || userData.user.role === "staff") {
          console.log("[Dashboard] Admin detected, redirecting to /admin");
          router.replace("/admin");
          return;
        }

        // Fetch customer orders
        const ordersRes = await fetch("/api/customer/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const labels: Record<string, string> = {
      pending: "Chờ thanh toán",
      confirmed: "Đã kích hoạt",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status] || "bg-slate-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-slate-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-8 md:pt-12">
        {/* Header Section */}
        <div className="relative mb-12 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 p-[1px]">
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-400" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                    Chào mừng, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">{userInfo?.name || "Khách hàng"}</span>
                  </h1>
                  <p className="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {userInfo?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20 hover:border-red-500/30 text-sm font-bold tracking-wide"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ĐĂNG XUẤT
              </button>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-400" />
              </div>
              Sản phẩm đã mua
            </h2>
            <div className="text-xs font-semibold text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              TỔNG CỘNG: {orders.length}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-16 text-center border border-white/5">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Khám phá các giải pháp ChatBot AI mạnh mẽ để tối ưu hóa công việc của bạn.</p>
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary-500/20 uppercase tracking-widest text-sm"
              >
                Mua ChatBot ngay
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden shadow-xl transition-all duration-300">
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-3xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                            🤖
                          </div>
                          <div>
                            <h3 className="font-black text-white text-xl mb-1 tracking-tight group-hover:text-primary-400 transition-colors">
                              {order.service.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                              <span className="text-slate-400 font-mono font-medium flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
                                <Link2 className="w-3.5 h-3.5" />
                                {order.orderCode}
                              </span>
                              <span className="text-slate-500 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                {formatDateTime(order.createdAt)}
                              </span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                              {getStatusBadge(order.status)}
                              {order.status === "confirmed" && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  <Zap className="w-3 h-3 fill-emerald-500" />
                                  Sẵn sàng
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-auto text-right">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Thanh toán</div>
                          <p className="text-3xl font-black text-white">
                            {formatCurrency(order.totalPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Credentials Display with Improved Typography & Visual Hierarchy */}
                      {(order.status === "confirmed" || order.status === "completed") && order.credential && (
                        <div className="mt-10 overflow-hidden rounded-2xl border border-primary-500/20">
                          <div className="bg-primary-500/5 px-6 py-4 border-b border-primary-500/20 flex items-center justify-between">
                            <h4 className="font-bold text-primary-400 text-sm flex items-center gap-2.5 uppercase tracking-wider">
                              <Key className="w-4 h-4" />
                              Thông tin kích hoạt & bàn giao
                            </h4>
                            <ShieldCheck className="w-4 h-4 text-primary-500/50" />
                          </div>
                          <div className="bg-slate-900/40 p-6 md:p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Link ChatBot */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <Link2 className="w-3.5 h-3.5" />
                                    Đường link truy cập
                                  </label>
                                  <CopyBtn text={order.credential.accountInfo} />
                                </div>
                                <div className="relative group/link">
                                  <a
                                    href={order.credential.accountInfo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-slate-950/50 border border-white/5 rounded-xl text-primary-400 font-mono text-xs break-all hover:bg-slate-950 hover:border-primary-500/30 transition-all group-hover:shadow-[0_0_15px_-5px_rgba(var(--primary-rgb),0.3)]"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="truncate flex-1">{order.credential.accountInfo}</span>
                                      <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-40 group-hover/link:opacity-100 transition-opacity" />
                                    </div>
                                  </a>
                                </div>
                              </div>

                              {/* Mã xác thực */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <Key className="w-3.5 h-3.5" />
                                    Mã xác thực đăng nhập
                                  </label>
                                  <CopyBtn text={order.credential.password} />
                                </div>
                                <div className="p-4 bg-slate-950/50 border border-white/5 rounded-xl flex items-center justify-between">
                                  <span className="font-mono font-black text-white text-lg tracking-[0.1em]">
                                    {order.credential.password}
                                  </span>
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Key className="w-4 h-4 text-slate-500" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Ghi chú */}
                            {order.credential.notes && (
                              <div className="pt-6 border-t border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hướng dẫn / Ghi chú</label>
                                  <CopyBtn text={order.credential.notes} label="Chép ghi chú" />
                                </div>
                                <div className="p-5 bg-slate-950/30 border border-white/5 rounded-xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic opacity-80">
                                  {order.credential.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {order.status === "pending" && (
                        <div className="mt-8 relative overflow-hidden rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-6 animate-pulse">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                          <div className="relative flex items-center gap-4 text-yellow-500/90 tracking-wide">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs uppercase tracking-wider mb-1">Đang chờ xử lý</h4>
                              <p className="text-sm font-medium">Hệ thống đang đợi xác nhận thanh toán để bàn giao ChatBot. Quá trình này thường mất 1-2 phút.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual background decorations - Fixed */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
