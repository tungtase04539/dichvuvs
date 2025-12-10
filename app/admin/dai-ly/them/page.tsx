"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// Component để chọn Đại lý (cho CTV)
function ParentAgentSelect({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [agents, setAgents] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await fetch("/api/admin/users?role=agent");
        const data = await res.json();
        if (data.users) {
          setAgents(data.users);
        }
      } catch (error) {
        console.error("Load agents error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAgents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Đang tải danh sách đại lý...
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Thuộc Đại lý <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="">-- Chọn Đại lý quản lý --</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name} ({agent.email})
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500 mt-1">
        Cộng tác viên bắt buộc phải thuộc một Đại lý
      </p>
    </div>
  );
}

export default function AddAgentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [masterAgents, setMasterAgents] = useState<Array<{ id: string; name: string }>>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "agent",
    parentId: "",
    createReferral: true,
  });

  // Load master agents for selection
  useEffect(() => {
    const loadMasterAgents = async () => {
      try {
        const res = await fetch("/api/admin/users?role=master_agent");
        const data = await res.json();
        if (data.users) {
          setMasterAgents(data.users);
        }
      } catch (error) {
        console.error("Load master agents error:", error);
      }
    };
    loadMasterAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate CTV must have parent
    if (formData.role === "collaborator" && !formData.parentId) {
      setError("Cộng tác viên bắt buộc phải thuộc một Đại lý");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dai-ly");
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch {
      setError("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/dai-ly"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Thêm đại lý mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Loại tài khoản <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="master_agent"
                  checked={formData.role === "master_agent"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, parentId: "" })}
                  className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Tổng đại lý</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="agent"
                  checked={formData.role === "agent"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, parentId: "" })}
                  className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Đại lý</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="collaborator"
                  checked={formData.role === "collaborator"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, parentId: "" })}
                  className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Cộng tác viên</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Phân cấp: Tổng đại lý → Đại lý → Cộng tác viên
            </p>
          </div>

          {/* Parent (for agents) */}
          {formData.role === "agent" && masterAgents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thuộc Tổng đại lý
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Không thuộc ai (độc lập) --</option>
                {masterAgents.map((ma) => (
                  <option key={ma.id} value={ma.id}>
                    {ma.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Nếu chọn, đại lý này sẽ thuộc quyền quản lý của Tổng đại lý đã chọn
              </p>
            </div>
          )}

          {/* Parent (for collaborators) */}
          {formData.role === "collaborator" && (
            <ParentAgentSelect
              value={formData.parentId}
              onChange={(value) => setFormData({ ...formData, parentId: value })}
            />
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0901234567"
            />
          </div>

          {/* Create Referral */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.createReferral}
                onChange={(e) => setFormData({ ...formData, createReferral: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">Tự động tạo mã giới thiệu</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Thêm
            </button>
            <Link
              href="/admin/dai-ly"
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
