"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Building2,
  CreditCard,
  User,
  FileText,
  AlertCircle,
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
  processor?: { name: string } | null;
}

interface Stats {
  pending: { amount: number; count: number };
  approved: { amount: number; count: number };
  paid: { amount: number; count: number };
  rejected: { amount: number; count: number };
}

export default function WithdrawalsPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);

  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    note: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [withdrawalsRes, statsRes] = await Promise.all([
        fetch("/api/ctv/withdrawals"),
        fetch("/api/ctv/stats"),
      ]);
      
      const withdrawalsData = await withdrawalsRes.json();
      const statsData = await statsRes.json();
      
      setWithdrawals(withdrawalsData.withdrawals || []);
      setStats(withdrawalsData.stats || null);
      setBalance(statsData.balance || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/ctv/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra");
        return;
      }

      setShowModal(false);
      setFormData({ amount: "", bankName: "", bankAccount: "", bankHolder: "", note: "" });
      fetchData();
    } catch {
      setError("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
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

  const hasPendingWithdrawal = withdrawals.some(w => w.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rút tiền</h1>
          <p className="text-slate-500 mt-1">Quản lý yêu cầu rút tiền của bạn</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={hasPendingWithdrawal || balance <= 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Tạo yêu cầu rút tiền
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Số dư khả dụng</p>
            <p className="text-4xl font-black mt-2">{formatCurrency(balance)}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
        {hasPendingWithdrawal && (
          <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            Bạn đang có yêu cầu rút tiền chờ xử lý
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Chờ duyệt</p>
            <p className="text-xl font-bold text-yellow-600">{formatCurrency(stats.pending.amount)}</p>
            <p className="text-xs text-slate-400">{stats.pending.count} yêu cầu</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Đã duyệt</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.approved.amount)}</p>
            <p className="text-xs text-slate-400">{stats.approved.count} yêu cầu</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Đã thanh toán</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.paid.amount)}</p>
            <p className="text-xs text-slate-400">{stats.paid.count} yêu cầu</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Từ chối</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(stats.rejected.amount)}</p>
            <p className="text-xs text-slate-400">{stats.rejected.count} yêu cầu</p>
          </div>
        </div>
      )}

      {/* Withdrawals List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Lịch sử yêu cầu</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có yêu cầu rút tiền nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {withdrawal.bankName}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {withdrawal.bankAccount}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {withdrawal.bankHolder}
                      </span>
                    </div>
                    {withdrawal.note && (
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {withdrawal.note}
                      </p>
                    )}
                    {withdrawal.adminNote && (
                      <p className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-lg inline-block">
                        Admin: {withdrawal.adminNote}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{formatDateTime(withdrawal.createdAt)}</p>
                    {withdrawal.processedAt && (
                      <p className="text-xs mt-1">
                        Xử lý: {formatDateTime(withdrawal.processedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Tạo yêu cầu rút tiền</h2>
              <p className="text-sm text-slate-500 mt-1">
                Số dư khả dụng: <span className="font-bold text-primary-600">{formatCurrency(balance)}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số tiền <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="10000"
                  max={balance}
                  className="input"
                  placeholder="Nhập số tiền muốn rút"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ngân hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                  className="input"
                  placeholder="VD: Vietcombank, MB Bank..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  required
                  className="input"
                  placeholder="Nhập số tài khoản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankHolder}
                  onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })}
                  required
                  className="input"
                  placeholder="Tên chủ tài khoản (viết hoa)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Ghi chú thêm (nếu có)"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn btn-primary"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
