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
  orderPackageType?: string | null; // standard, gold, platinum, single
  service: {
    name: string;
  };
  credential?: {
    accountInfo: string;  // Đường link
    password: string;     // Mã đăng nhập
    notes: string;        // Ghi chú
  } | null;
}

// Zalo group links based on package type
const ZALO_GROUP_LINKS: Record<string, string> = {
  single: "https://zalo.me/g/nfcsbd681",
  standard: "https://zalo.me/g/xqgubk047",
  gold: "https://zalo.me/g/fredhp972",
  platinum: "https://zalo.me/g/vxcwcs969",
};

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

        // Redirect CTV/Agent to CTV dashboard
        if (["collaborator", "ctv", "agent", "master_agent"].includes(userData.user.role)) {
          console.log("[Dashboard] CTV/Agent detected, redirecting to /admin/ctv-dashboard");
          router.replace("/admin/ctv-dashboard");
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

                            {/* Nút tham gia nhóm Zalo */}
                            <div className="pt-6 border-t border-white/5">
                              <a
                                href={ZALO_GROUP_LINKS[order.orderPackageType || "single"] || ZALO_GROUP_LINKS.single}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02]"
                              >
                                <svg className="w-6 h-6" viewBox="0 0 48 48" fill="currentColor">
                                  <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm7.747 25.398c-.547.27-1.102.52-1.654.752-.183.077-.367.152-.552.225a23.144 23.144 0 01-2.397.795c-.244.068-.49.134-.737.196a22.31 22.31 0 01-2.407.469 22.84 22.84 0 01-2.5.214 22.655 22.655 0 01-2.5-.078 22.306 22.306 0 01-2.407-.33 22.01 22.01 0 01-2.36-.581c-.23-.07-.458-.144-.687-.222a21.37 21.37 0 01-1.956-.764c-.21-.094-.418-.19-.625-.29l-.002-.002a19.967 19.967 0 01-1.77-.991 8.088 8.088 0 01-.39-.256 16.91 16.91 0 01-.813-.593c-.117-.09-.232-.183-.346-.276a14.633 14.633 0 01-.648-.566 11.807 11.807 0 01-.286-.274 11.233 11.233 0 01-.509-.539c-.068-.076-.135-.153-.201-.23a8.67 8.67 0 01-.358-.451c-.041-.054-.081-.109-.12-.164a5.947 5.947 0 01-.25-.377c-.025-.04-.049-.082-.073-.123a3.574 3.574 0 01-.178-.335l-.04-.085a2.13 2.13 0 01-.125-.324c-.008-.024-.016-.048-.023-.073a1.39 1.39 0 01-.073-.309c-.002-.016-.005-.031-.007-.047a.898.898 0 01-.019-.258c0-.003 0-.006.001-.009a.62.62 0 01.038-.184c.003-.008.005-.016.009-.023a.471.471 0 01.087-.137l.016-.017a.38.38 0 01.134-.08l.022-.008a.335.335 0 01.171-.019c.008.001.016.002.024.004a.318.318 0 01.182.104l.008.01c.034.04.064.083.094.127l.028.042c.03.042.058.086.09.127.037.049.077.096.116.144l.035.043c.042.05.085.098.127.147l.055.061c.044.048.087.096.132.142l.067.07c.046.046.092.091.139.136l.077.072c.048.044.096.087.145.129a5.1 5.1 0 00.23.191l.077.061a6.63 6.63 0 00.257.192l.07.05a8.26 8.26 0 00.282.19l.055.035a10.134 10.134 0 00.307.186l.035.02a12.277 12.277 0 00.654.353c.256.127.517.248.781.362.088.038.177.075.266.111.265.108.533.211.805.306.091.032.182.063.274.094.275.093.554.18.836.26.094.027.187.053.282.078.287.078.577.151.87.217.097.022.193.043.29.063.294.063.59.12.888.17.098.017.195.032.293.047.297.046.596.084.897.117.099.01.197.02.297.029.299.028.599.048.9.062.1.005.198.01.298.013.3.012.6.017.902.016.1 0 .199-.002.298-.004.299-.008.599-.022.899-.041.099-.007.199-.014.298-.022.298-.025.597-.055.895-.091.099-.012.197-.025.296-.039.295-.04.589-.085.882-.137.097-.017.194-.036.29-.055.29-.057.579-.12.866-.189.095-.023.189-.047.283-.072.285-.074.569-.154.85-.24.093-.028.185-.058.277-.088.279-.092.555-.189.829-.293.091-.034.181-.07.271-.106.271-.105.54-.217.806-.334a20.4 20.4 0 002.022-1.006c.084-.047.166-.096.249-.145a18.03 18.03 0 001.376-.913c.077-.056.152-.113.228-.17.236-.182.468-.37.694-.565.07-.062.14-.124.21-.186.22-.198.436-.402.646-.612.064-.065.127-.131.19-.198.198-.209.39-.424.576-.646.056-.067.111-.136.166-.205.172-.216.34-.437.502-.663.048-.068.096-.137.143-.206.145-.213.287-.429.423-.65.04-.066.079-.133.118-.2.12-.208.237-.42.349-.635.032-.063.064-.126.095-.19.097-.2.191-.403.281-.609.025-.058.05-.116.074-.175.079-.195.155-.393.228-.593.019-.055.039-.11.058-.166.064-.187.126-.376.185-.567.015-.052.031-.104.046-.156a11.52 11.52 0 00.285-1.256c.006-.036.012-.073.017-.11a11.97 11.97 0 00.132-1.148c.002-.032.003-.063.004-.095a12.227 12.227 0 00-.04-1.302c-.003-.026-.005-.052-.008-.078a11.706 11.706 0 00-.168-1.14c-.006-.032-.012-.063-.019-.095a10.754 10.754 0 00-.292-1.078c-.01-.031-.02-.062-.031-.093-.099-.303-.211-.6-.336-.89-.014-.032-.029-.063-.043-.095-.124-.278-.262-.55-.411-.816-.017-.03-.035-.06-.052-.09a8.75 8.75 0 00-.477-.729l-.06-.083c-.17-.229-.351-.45-.542-.663l-.068-.076c-.192-.21-.394-.412-.606-.606l-.079-.07c-.213-.19-.435-.372-.666-.545l-.087-.067a9.77 9.77 0 00-.72-.49l-.093-.058a10.74 10.74 0 00-.764-.42l-.1-.05a11.86 11.86 0 00-.803-.35l-.106-.042a13.034 13.034 0 00-.832-.285l-.112-.034a14.22 14.22 0 00-.856-.226l-.117-.028a15.387 15.387 0 00-.87-.169l-.121-.02a16.493 16.493 0 00-.878-.115l-.124-.014a17.505 17.505 0 00-.882-.067l-.126-.008a18.394 18.394 0 00-.883-.022h-.127a19.154 19.154 0 00-.88.023l-.126.009c-.294.02-.587.047-.878.081l-.124.015c-.29.038-.58.083-.867.134l-.121.023c-.285.055-.569.117-.85.186l-.117.03c-.28.073-.557.152-.833.239l-.112.037c-.273.09-.544.187-.812.29l-.106.044c-.265.107-.528.22-.788.342l-.099.051a12.4 12.4 0 00-.76.4l-.092.054a11.293 11.293 0 00-.726.462l-.084.059a10.111 10.111 0 00-.686.527l-.076.064c-.22.191-.432.39-.635.598l-.067.07c-.2.21-.39.43-.57.656l-.056.073c-.178.23-.346.467-.504.712l-.045.071c-.155.247-.3.501-.435.762l-.032.063a9.24 9.24 0 00-.36.815l-.02.05c-.1.265-.191.535-.271.81l-.008.03c-.077.27-.143.545-.2.824v.008a8.13 8.13 0 00-.128.844v.002c-.028.275-.047.552-.056.832v.009c-.003.27.003.542.018.815l.002.016c.017.262.043.526.078.79l.005.023c.04.254.088.508.145.763l.01.034c.062.246.133.493.212.739l.015.044c.085.24.179.479.281.717l.022.052a8.22 8.22 0 00.346.685l.03.054c.126.223.262.442.406.657l.038.059c.147.217.304.43.469.638l.046.06c.169.21.346.416.532.619l.054.061c.19.204.388.403.593.597l.062.059c.21.196.426.387.65.573l.069.058c.228.188.462.37.702.547l.076.055c.245.179.495.352.75.52l.081.053c.261.17.527.334.798.493l.087.05a14.9 14.9 0 00.82.446l.093.046c.28.135.565.265.853.39l.099.043a17.43 17.43 0 001.843.695l.107.034c.317.097.638.188.962.273l.111.03c.329.084.66.163.993.235l.115.025c.338.072.679.138 1.021.199l.117.02c.347.059.696.113 1.047.16l.12.016c.355.047.711.088 1.07.123l.121.012c.362.035.725.063 1.09.086l.122.007c.368.022.737.038 1.107.047l.122.003c.373.009.747.012 1.122.008.041 0 .081-.001.122-.002a26.19 26.19 0 001.117-.045l.121-.007c.372-.025.743-.057 1.113-.096l.12-.014c.369-.041.738-.09 1.105-.144l.118-.018c.366-.058.731-.122 1.094-.193l.116-.023c.362-.074.723-.156 1.081-.244l.113-.029c.357-.09.712-.188 1.065-.292l.11-.034a21.6 21.6 0 001.045-.343l.106-.039c.345-.13.686-.268 1.023-.413l.101-.044c.335-.147.667-.301.994-.462l.095-.048a18.08 18.08 0 00.959-.513l.088-.051c.31-.187.616-.38.917-.58l.079-.053a15.3 15.3 0 00.868-.646l.067-.054c.28-.23.555-.468.822-.713l.054-.05c.263-.247.519-.501.769-.763l.039-.042c.243-.261.479-.53.708-.805l.024-.029a11.4 11.4 0 00.577-.762c.005-.008.01-.015.015-.023a9.53 9.53 0 00.467-.726z"/>
                                </svg>
                                Tham gia nhóm Zalo hỗ trợ
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <p className="text-center text-xs text-slate-500 mt-3">
                                📢 Tham gia nhóm để nhận hướng dẫn sử dụng và hỗ trợ từ đội ngũ
                              </p>
                            </div>
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
