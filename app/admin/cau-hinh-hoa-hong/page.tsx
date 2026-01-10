"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Loader2,
  Save,
  Percent,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CommissionSetting {
  id: string;
  key: string;
  role: string;
  type: string;
  percent: number;
  description: string | null;
}

export default function CommissionSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/commission-settings");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePercentChange = (key: string, value: number) => {
    setSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, percent: value } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/commission-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Cập nhật thành công!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ctv: "CTV",
      collaborator: "Cộng tác viên",
      agent: "Đại lý",
      master_agent: "Tổng đại lý",
    };
    return labels[role] || role;
  };

  const getTypeLabel = (type: string) => {
    return type === "retail" ? "Bán trực tiếp" : "Override (từ cấp dưới)";
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ctv: "border-green-500 bg-green-50",
      collaborator: "border-green-500 bg-green-50",
      agent: "border-blue-500 bg-blue-50",
      master_agent: "border-purple-500 bg-purple-50",
    };
    return colors[role] || "border-slate-500 bg-slate-50";
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-20">
        <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
        <p className="text-slate-500">Chỉ Admin mới có thể cấu hình hoa hồng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cấu hình hoa hồng</h1>
          <p className="text-slate-500 mt-1">Thiết lập % hoa hồng cho từng cấp bậc</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.includes("thành công") 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          <AlertCircle className="w-5 h-5" />
          {message}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cách tính hoa hồng
        </h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• <strong>Retail (Bán trực tiếp):</strong> % hoa hồng khi CTV/Agent tự bán được đơn hàng</li>
          <li>• <strong>Override:</strong> % hoa hồng cấp trên nhận được từ doanh số của cấp dưới</li>
          <li>• Hoa hồng được tính tự động khi đơn hàng chuyển sang trạng thái "Đã xác nhận"</li>
        </ul>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : settings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có cấu hình nào</p>
          <p className="text-sm text-slate-400 mt-2">
            Chạy SQL setup để tạo cấu hình mặc định
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Group by role */}
          {["ctv", "collaborator", "agent", "master_agent"].map((role) => {
            const roleSettings = settings.filter(s => s.role === role);
            if (roleSettings.length === 0) return null;

            return (
              <div key={role} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${getRoleColor(role)}`}>
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{getRoleLabel(role)}</h3>
                      <p className="text-sm text-slate-500">{roleSettings.length} cấu hình</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {roleSettings.map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700">{getTypeLabel(setting.type)}</p>
                          {setting.description && (
                            <p className="text-xs text-slate-500">{setting.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={setting.percent}
                            onChange={(e) => handlePercentChange(setting.key, parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-right font-bold"
                          />
                          <Percent className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Example Calculation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Ví dụ tính hoa hồng</h3>
        <div className="bg-slate-50 rounded-xl p-4 text-sm">
          <p className="text-slate-600 mb-2">
            Giả sử đơn hàng <strong>1,000,000đ</strong> từ link giới thiệu của CTV (thuộc Agent, Agent thuộc Master Agent):
          </p>
          <ul className="space-y-1 text-slate-700">
            <li>• CTV nhận: 1,000,000 × 20% = <strong className="text-green-600">200,000đ</strong></li>
            <li>• Agent nhận (override): 1,000,000 × 5% = <strong className="text-blue-600">50,000đ</strong></li>
            <li>• Master Agent nhận (override L2): 1,000,000 × 2% = <strong className="text-purple-600">20,000đ</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
