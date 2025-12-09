"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Edit, Eye, EyeOff, Loader2, Copy, Check, Package } from "lucide-react";

interface Service {
  id: string;
  name: string;
  icon: string | null;
}

interface Credential {
  id: string;
  serviceId: string;
  accountInfo: string;
  password: string;
  apiKey: string | null;
  notes: string | null;
  isUsed: boolean;
  service: Service;
  order?: {
    orderCode: string;
    customerName: string;
  } | null;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    serviceId: "",
    accountInfo: "",
    password: "",
    apiKey: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [credRes, prodRes] = await Promise.all([
        fetch("/api/admin/credentials"),
        fetch("/api/admin/products"),
      ]);
      const credData = await credRes.json();
      const prodData = await prodRes.json();

      if (credRes.ok) setCredentials(credData.credentials || []);
      if (prodRes.ok) setServices(prodData.products || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId
      ? `/api/admin/credentials/${editingId}`
      : "/api/admin/credentials";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        loadData();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch {
      alert("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const res = await fetch(`/api/admin/credentials/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa");
      }
    } catch {
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (cred: Credential) => {
    setFormData({
      serviceId: cred.serviceId,
      accountInfo: cred.accountInfo,
      password: cred.password,
      apiKey: cred.apiKey || "",
      notes: cred.notes || "",
    });
    setEditingId(cred.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      serviceId: "",
      accountInfo: "",
      password: "",
      apiKey: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Group by service
  const groupedCredentials = credentials.reduce((acc, cred) => {
    const key = cred.serviceId;
    if (!acc[key]) {
      acc[key] = {
        service: cred.service,
        items: [],
      };
    }
    acc[key].items.push(cred);
    return acc;
  }, {} as Record<string, { service: Service; items: Credential[] }>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài khoản</h1>
          <p className="text-slate-600">Tài khoản/mật khẩu gán cho khách hàng sau thanh toán</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? "Sửa tài khoản" : "Thêm tài khoản mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sản phẩm ChatBot *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tài khoản/Email *
                </label>
                <input
                  type="text"
                  value={formData.accountInfo}
                  onChange={(e) => setFormData({ ...formData, accountInfo: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="user@email.com hoặc username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Mật khẩu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  API Key (nếu có)
                </label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="API Key"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Link hướng dẫn, thông tin thêm..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials List */}
      {Object.keys(groupedCredentials).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Key className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có tài khoản nào</p>
          <p className="text-sm text-slate-400 mt-1">
            Thêm tài khoản để gán cho khách hàng sau thanh toán
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedCredentials).map(({ service, items }) => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900">{service.name}</h3>
                  <p className="text-sm text-slate-500">
                    {items.filter((i) => !i.isUsed).length} còn trống / {items.length} tổng
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((cred) => (
                  <div key={cred.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid md:grid-cols-3 gap-4">
                        {/* Account */}
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Tài khoản</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                              {cred.accountInfo}
                            </code>
                            <button
                              onClick={() => copyToClipboard(cred.accountInfo, `acc-${cred.id}`)}
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              {copied === `acc-${cred.id}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Mật khẩu</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                              {showPasswords[cred.id] ? cred.password : "••••••••"}
                            </code>
                            <button
                              onClick={() => togglePassword(cred.id)}
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              {showPasswords[cred.id] ? (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(cred.password, `pwd-${cred.id}`)}
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              {copied === `pwd-${cred.id}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                          {cred.isUsed ? (
                            <div>
                              <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                Đã gán
                              </span>
                              {cred.order && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {cred.order.orderCode} - {cred.order.customerName}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Còn trống
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(cred)}
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!cred.isUsed && (
                          <button
                            onClick={() => handleDelete(cred.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {cred.notes && (
                      <p className="text-sm text-slate-500 mt-2 pl-4 border-l-2 border-slate-200">
                        {cred.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

