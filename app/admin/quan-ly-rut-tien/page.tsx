"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  CreditCard,
  User,
  Filter,
  Check,
  X,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Withdrawal {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  status: string;
  note: string | null;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    balance: number;
  };
  processor?: { name: string } | null;
}

interface Stats {
  pending: { amount: number; count: number };
  approved: { amount: number; count: number };
  paid: { amount: number; count: number };
  rejected: { amount: number; count: number };
}

export default function AdminWithdrawalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [authTimeout, setAuthTimeout] = useState(false);

  // Timeout cho auth loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setAuthTimeout(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    // Chỉ fetch khi đã có user hoặc timeout
    if (!authLoading || authTimeout) {
      fetchWithdrawals();
    }
  }, [statusFilter, authLoading, authTimeout]);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals?status=${statusFilter}`);
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (withdrawalId: string, action: string) => {
    setProcessingId(withdrawalId);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action, adminNote }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setAdminNote("");
        fetchWithdrawals();
      } else {
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="w-4 h-4" />, label: "Chờ duyệt" },
      approved: { bg: "bg-blue-100", text: "text-blue-700", icon: <CheckCircle className="w-4 h-4" />, label: "Đã duyệt" },
      paid: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-4 h-4" />, label: "Đã thanh toán" },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="w-4 h-4" />, label: "Từ chối" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {style.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      master_agent: "bg-purple-100 text-purple-700",
      agent: "bg-blue-100 text-blue-700",
      collaborator: "bg-green-100 text-green-700",
      ctv: "bg-green-100 text-green-700",
    };
    const labels: Record<string, string> = {
      master_agent: "Tổng đại lý",
      agent: "Đại lý",
      collaborator: "CTV",
      ctv: "CTV",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[role] || "bg-slate-100 text-slate-700"}`}>
        {labels[role] || role}
      </span>
    );
  };

  if (authLoading && !authTimeout) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Bypass check - cho phép truy cập nếu timeout (sẽ check lại ở API)
  const canAccess = user?.role === "admin" || user?.email === "admin@admin.com" || authTimeout;

  if (!canAccess) {
    return (
      <div className="text-center py-20">
        <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
        <p className="text-slate-500">Chỉ Admin mới có thể quản lý yêu cầu rút tiền</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý yêu cầu rút tiền</h1>
        <p className="text-slate-500 mt-1">Duyệt và xử lý yêu cầu rút tiền từ CTV/Đại lý</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer border-2 transition-all ${statusFilter === "pending" ? "border-yellow-500" : "border-transparent"}`}
            onClick={() => setStatusFilter("pending")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Chờ duyệt</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pending.count}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{formatCurrency(stats.pending.amount)}</p>
          </div>

          <div 
            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer border-2 transition-all ${statusFilter === "approved" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setStatusFilter("approved")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Đã duyệt</p>
                <p className="text-xl font-bold text-blue-600">{stats.approved.count}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{formatCurrency(stats.approved.amount)}</p>
          </div>

          <div 
            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer border-2 transition-all ${statusFilter === "paid" ? "border-green-500" : "border-transparent"}`}
            onClick={() => setStatusFilter("paid")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Đã thanh toán</p>
                <p className="text-xl font-bold text-green-600">{stats.paid.count}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{formatCurrency(stats.paid.amount)}</p>
          </div>

          <div 
            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer border-2 transition-all ${statusFilter === "rejected" ? "border-red-500" : "border-transparent"}`}
            onClick={() => setStatusFilter("rejected")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Từ chối</p>
                <p className="text-xl font-bold text-red-600">{stats.rejected.count}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{formatCurrency(stats.rejected.amount)}</p>
          </div>
        </div>
      )}

      {/* Withdrawals List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                        {withdrawal.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{withdrawal.user.name}</p>
                          {getRoleBadge(withdrawal.user.role)}
                        </div>
                        <p className="text-sm text-slate-500">{withdrawal.user.email}</p>
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="flex items-center gap-4">
                      <p className="text-3xl font-black text-slate-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    {/* Bank Info */}
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {withdrawal.bankName}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        {withdrawal.bankAccount}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400" />
                        {withdrawal.bankHolder}
                      </span>
                    </div>

                    {withdrawal.note && (
                      <p className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                        Ghi chú: {withdrawal.note}
                      </p>
                    )}

                    {withdrawal.adminNote && (
                      <p className="text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                        Admin: {withdrawal.adminNote}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="text-right space-y-3">
                    <p className="text-sm text-slate-500">{formatDateTime(withdrawal.createdAt)}</p>
                    <p className="text-xs text-slate-400">
                      Số dư hiện tại: {formatCurrency(withdrawal.user.balance)}
                    </p>

                    {withdrawal.status === "pending" && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Ghi chú (tùy chọn)"
                          value={processingId === withdrawal.id ? adminNote : ""}
                          onChange={(e) => {
                            setProcessingId(withdrawal.id);
                            setAdminNote(e.target.value);
                          }}
                          className="input text-sm w-full"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(withdrawal.id, "approve")}
                            disabled={!!processingId}
                            className="flex-1 btn btn-sm bg-green-500 hover:bg-green-600 text-white"
                          >
                            {processingId === withdrawal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Duyệt
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(withdrawal.id, "reject")}
                            disabled={!!processingId}
                            className="flex-1 btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                            Từ chối
                          </button>
                        </div>
                      </div>
                    )}

                    {withdrawal.status === "approved" && (
                      <button
                        onClick={() => handleAction(withdrawal.id, "mark_paid")}
                        disabled={!!processingId}
                        className="btn btn-sm btn-primary"
                      >
                        {processingId === withdrawal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            Đã chuyển tiền
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
