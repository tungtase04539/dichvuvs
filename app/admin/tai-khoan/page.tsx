"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, Trash2, Edit2, Loader2, Search,
  UserPlus, Shield, Building2, UserCheck, User,
  Eye, EyeOff, X, Check
} from "lucide-react";

interface Account {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  parentId: string | null;
  createdAt: string;
  lastSignIn: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  distributor: "Nhà phân phối",
  agent: "Đại lý",
  collaborator: "Cộng tác viên",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  staff: <User className="w-4 h-4" />,
  distributor: <Building2 className="w-4 h-4" />,
  agent: <UserCheck className="w-4 h-4" />,
  collaborator: <Users className="w-4 h-4" />,
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  staff: "bg-slate-100 text-slate-700",
  distributor: "bg-indigo-100 text-indigo-700",
  agent: "bg-blue-100 text-blue-700",
  collaborator: "bg-green-100 text-green-700",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "staff",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Load accounts
  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/admin/accounts");
      const data = await res.json();
      if (data.users) {
        setAccounts(data.users);
      }
    } catch (error) {
      console.error("Load accounts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.phone.includes(searchQuery);
    const matchRole = !filterRole || acc.role === filterRole;
    return matchSearch && matchRole;
  });

  // Create/Update account
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const url = editingAccount
        ? `/api/admin/accounts/${editingAccount.id}`
        : "/api/admin/accounts";

      const res = await fetch(url, {
        method: editingAccount ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra");
        return;
      }

      setShowModal(false);
      setEditingAccount(null);
      setFormData({ email: "", password: "", name: "", role: "collaborator", phone: "" });
      loadAccounts();
    } catch {
      setError("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete account
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xóa tài khoản "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAccounts();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch {
      alert("Có lỗi xảy ra");
    }
  };

  // Open edit modal
  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      email: account.email,
      password: "",
      name: account.name,
      role: account.role,
      phone: account.phone || "",
    });
    setShowModal(true);
  };

  // Open create modal
  const openCreate = () => {
    setEditingAccount(null);
    setFormData({ email: "", password: "", name: "", role: "collaborator", phone: "" });
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1>
          <p className="text-slate-500 mt-1">Tổng: {accounts.length} tài khoản</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <UserPlus className="w-5 h-5" />
          Thêm tài khoản
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg"
          >
            <option value="">Tất cả vai trò</option>
            <option value="distributor">Nhà phân phối</option>
            <option value="agent">Đại lý</option>
            <option value="collaborator">Cộng tác viên</option>
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(roleLabels).map(([role, label]) => {
          const count = accounts.filter((a) => a.role === role).length;
          return (
            <div
              key={role}
              className={`p-4 rounded-xl border ${filterRole === role ? "border-primary-500 bg-primary-50" : "border-slate-200 bg-white"
                } cursor-pointer transition-all`}
              onClick={() => setFilterRole(filterRole === role ? "" : role)}
            >
              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${roleColors[role]}`}>
                {roleIcons[role]}
                {label}
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Tài khoản</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Ngày tạo</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${account.role === "admin" ? "bg-purple-500" :
                        "bg-slate-500"
                        }`}>
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{account.name}</p>
                        <p className="text-sm text-slate-500">{account.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${roleColors[account.role]}`}>
                      {roleIcons[account.role]}
                      {roleLabels[account.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{account.phone || "-"}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {account.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(account.id, account.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Không tìm thấy tài khoản nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingAccount ? "Sửa tài khoản" : "Thêm tài khoản"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingAccount}
                  className="input disabled:bg-slate-100"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu {!editingAccount && <span className="text-red-500">*</span>}
                  {editingAccount && <span className="text-slate-400 text-xs">(để trống nếu không đổi)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingAccount}
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input"
                >
                  <option value="collaborator">Cộng tác viên (CTV)</option>
                  <option value="agent">Đại lý</option>
                  <option value="distributor">Nhà phân phối (NPP)</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="0901234567"
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
                    <>
                      <Check className="w-5 h-5" />
                      {editingAccount ? "Cập nhật" : "Tạo tài khoản"}
                    </>
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
