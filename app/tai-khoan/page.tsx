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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
      title={label || "Sao chép"}
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
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

        // Redirect admin/ctv to admin panel
        const adminRoles = ["admin", "ctv", "staff", "master_agent", "agent", "collaborator"];
        if (adminRoles.includes(userData.user.role)) {
          router.push("/admin");
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
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending: "Chờ thanh toán",
      confirmed: "Đã thanh toán",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 mb-8 border border-slate-600">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-2xl font-bold text-white">
              {userInfo?.name?.charAt(0).toUpperCase() || "K"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Xin chào, {userInfo?.name || "Khách hàng"}!
              </h1>
              <p className="text-slate-400">{userInfo?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Đã thanh toán</p>
              <p className="text-2xl font-bold text-white">
                {orders.filter(o => o.status === "confirmed" || o.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">ChatBot đang dùng</p>
              <p className="text-2xl font-bold text-white">
                {orders.filter(o => o.status === "confirmed" || o.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-400" />
            Sản phẩm đã mua
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Bạn chưa có sản phẩm nào</p>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              Mua ChatBot ngay
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">🤖</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{order.service.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        <span className="font-mono">{order.orderCode}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-400">
                      {formatCurrency(order.totalPrice)}
                    </p>
                  </div>
                </div>

                {/* Credentials for confirmed orders */}
                {(order.status === "confirmed" || order.status === "completed") && order.credential && (
                  <div className="mt-4 bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <h4 className="font-medium text-primary-400 mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Thông tin đăng nhập ChatBot
                    </h4>
                    <div className="space-y-3 text-sm">
                      {/* Đường link */}
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Link2 className="w-3.5 h-3.5" />
                            Đường link
                          </span>
                          <CopyBtn text={order.credential.accountInfo} label="Sao chép link" />
                        </div>
                        <p className="font-mono text-primary-400 break-all">{order.credential.accountInfo}</p>
                      </div>
                      
                      {/* Mã đăng nhập */}
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" />
                            Mã đăng nhập
                          </span>
                          <CopyBtn text={order.credential.password} label="Sao chép mã" />
                        </div>
                        <p className="font-mono font-bold text-white">{order.credential.password}</p>
                      </div>
                      
                      {/* Ghi chú */}
                      {order.credential.notes && (
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-400">Ghi chú</span>
                            <CopyBtn text={order.credential.notes} label="Sao chép ghi chú" />
                          </div>
                          <p className="text-white whitespace-pre-wrap">{order.credential.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {order.status === "pending" && (
                  <div className="mt-4 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-yellow-400 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Đơn hàng đang chờ thanh toán. Vui lòng thanh toán để nhận ChatBot.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

