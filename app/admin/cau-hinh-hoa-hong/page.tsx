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
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

interface CommissionSetting {
  id: string;
  key: string;
  role: string;
  type: string;
  percent: number;
  description: string | null;
}

const ROLE_ORDER = ["collaborator", "senior_collaborator", "agent", "distributor"];

export default function CommissionSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
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
    if (!authLoading || authTimeout) {
      fetchSettings();
    }
  }, [authLoading, authTimeout]);

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
      collaborator: "Cấp 1: Cộng tác viên (CTV)",
      senior_collaborator: "Cấp 1+: CTV cao cấp",
      agent: "Cấp 2: Đại lý",
      distributor: "Cấp 3: Nhà phân phối (NPP)",
    };
    return labels[role] || role;
  };

  const getRoleDescription = (role: string) => {
    const desc: Record<string, string> = {
      collaborator: "Bán trực tiếp, không có cấp dưới",
      senior_collaborator: "Bán trực tiếp + Có quyền sửa video sản phẩm",
      agent: "Bán trực tiếp + Hưởng override từ CTV (cần ≥3 CTV)",
      distributor: "Bán trực tiếp + Hưởng override từ Đại lý (cần ≥3 Đại lý)",
    };
    return desc[role] || "";
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      collaborator: "border-green-500 bg-green-50",
      senior_collaborator: "border-amber-500 bg-amber-50",
      agent: "border-blue-500 bg-blue-50",
      distributor: "border-purple-500 bg-purple-50",
    };
    return colors[role] || "border-slate-500 bg-slate-50";
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      collaborator: "🧑‍💼",
      senior_collaborator: "⭐",
      agent: "🏪",
      distributor: "🏢",
    };
    return icons[role] || "👤";
  };

  // Tính toán ví dụ (bao gồm trừ thuế TNCN 10%)
  const TNCN_TAX_RATE = 0.10; // 10% thuế TNCN
  
  const getExampleCalculation = () => {
    const orderValue = 1000000;
    const ctvSetting = settings.find(s => s.key === 'collaborator_retail');
    const agentSetting = settings.find(s => s.key === 'agent_retail');
    const distributorSetting = settings.find(s => s.key === 'distributor_retail') || 
                               settings.find(s => s.key === 'master_agent_retail');
    
    const ctvPercent = ctvSetting?.percent || 10;
    const agentPercent = agentSetting?.percent || 15;
    const distributorPercent = distributorSetting?.percent || 20;
    
    const agentOverride = agentPercent - ctvPercent;
    const distributorOverride = distributorPercent - agentPercent;
    
    // Tính số tiền trước thuế và sau thuế
    const applyTax = (gross: number) => gross * (1 - TNCN_TAX_RATE);
    
    return {
      orderValue,
      taxRate: TNCN_TAX_RATE * 100,
      ctv: { 
        percent: ctvPercent, 
        gross: orderValue * ctvPercent / 100,
        net: applyTax(orderValue * ctvPercent / 100)
      },
      agentOverride: { 
        percent: agentOverride, 
        gross: orderValue * agentOverride / 100,
        net: applyTax(orderValue * agentOverride / 100)
      },
      distributorOverride: { 
        percent: distributorOverride, 
        gross: orderValue * distributorOverride / 100,
        net: applyTax(orderValue * distributorOverride / 100)
      },
      agentDirect: { 
        percent: agentPercent, 
        gross: orderValue * agentPercent / 100,
        net: applyTax(orderValue * agentPercent / 100)
      },
      distributorDirect: { 
        percent: distributorPercent, 
        gross: orderValue * distributorPercent / 100,
        net: applyTax(orderValue * distributorPercent / 100)
      },
    };
  };

  // Debug: Log user info
  useEffect(() => {
    console.log("[CauHinhHoaHong] Current user:", user);
    console.log("[CauHinhHoaHong] User role:", user?.role);
  }, [user]);

  if (authLoading && !authTimeout) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  // Bypass check - cho phép truy cập nếu timeout (sẽ check lại ở API)
  const canAccess = user?.role === "admin" || user?.email === "admin@admin.com" || authTimeout;

  if (!canAccess) {
    return (
      <div className="text-center py-20">
        <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
        <p className="text-slate-500">Chỉ Admin mới có thể cấu hình hoa hồng</p>
        <p className="text-xs text-slate-400 mt-2">Debug: role={user?.role}, email={user?.email}</p>
      </div>
    );
  }

  const example = getExampleCalculation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cấu hình hoa hồng</h1>
          <p className="text-slate-500 mt-1">Thiết lập % hoa hồng cho từng cấp bậc đối tác</p>
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

      {/* Policy Info Card */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Chính sách hoa hồng
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-2xl mb-2">🧑‍💼</div>
            <h4 className="font-bold text-green-700">Cấp 1: CTV</h4>
            <p className="text-slate-600 mt-1">Bán trực tiếp, nhận % retail</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-2xl mb-2">🏪</div>
            <h4 className="font-bold text-blue-700">Cấp 2: Đại lý</h4>
            <p className="text-slate-600 mt-1">Cần ≥3 CTV. Bán trực tiếp + Override từ CTV</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-2xl mb-2">🏢</div>
            <h4 className="font-bold text-purple-700">Cấp 3: Nhà phân phối</h4>
            <p className="text-slate-600 mt-1">Cần ≥3 Đại lý. Bán trực tiếp + Override từ Đại lý</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <strong>Lưu ý:</strong> Override = % cấp trên - % cấp dưới. Ví dụ: Đại lý 15% - CTV 10% = Override 5%
          </p>
        </div>
        {/* TNCN Tax Notice */}
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm">
            <strong>⚠️ Thuế TNCN:</strong> Tất cả hoa hồng được trừ <strong>10% thuế thu nhập cá nhân (TNCN)</strong> trước khi cộng vào số dư.
            <br/><span className="text-red-600">Công thức: Thực nhận = Hoa hồng × 90%</span>
          </p>
        </div>
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
        <div className="space-y-4">
          {ROLE_ORDER.map((role) => {
            const roleSetting = settings.find(s => s.role === role && s.type === 'retail');
            if (!roleSetting) return null;

            return (
              <div key={role} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${getRoleColor(role)}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getRoleIcon(role)}</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{getRoleLabel(role)}</h3>
                        <p className="text-sm text-slate-500">{getRoleDescription(role)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">% Bán trực tiếp:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={roleSetting.percent}
                          onChange={(e) => handlePercentChange(roleSetting.key, parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.5"
                          className="w-24 px-4 py-3 border border-slate-200 rounded-xl text-center font-bold text-xl"
                        />
                        <Percent className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Example Calculation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          Ví dụ tính hoa hồng (Đơn hàng {formatCurrency(example.orderValue)})
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Case 1: CTV bán, có Đại lý cấp trên */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-700 mb-3">Trường hợp 1: CTV bán (có Đại lý cấp trên)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">CTV nhận ({example.ctv.percent}% - 10% thuế):</span>
                <span className="font-bold text-green-600">{formatCurrency(example.ctv.net)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Đại lý nhận ({example.agentOverride.percent}% - 10% thuế):</span>
                <span className="font-bold text-blue-600">{formatCurrency(example.agentOverride.net)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Tổng thực nhận:</span>
                <span>{formatCurrency(example.ctv.net + example.agentOverride.net)}</span>
              </div>
            </div>
          </div>

          {/* Case 2: Đại lý bán trực tiếp */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-700 mb-3">Trường hợp 2: Đại lý bán trực tiếp</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Đại lý nhận ({example.agentDirect.percent}% - 10% thuế):</span>
                <span className="font-bold text-blue-600">{formatCurrency(example.agentDirect.net)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Tổng thực nhận:</span>
                <span>{formatCurrency(example.agentDirect.net)}</span>
              </div>
            </div>
          </div>

          {/* Case 3: CTV bán, có Đại lý + NPP */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-700 mb-3">Trường hợp 3: CTV bán (có Đại lý + NPP)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">CTV nhận ({example.ctv.percent}% - 10% thuế):</span>
                <span className="font-bold text-green-600">{formatCurrency(example.ctv.net)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Đại lý nhận ({example.agentOverride.percent}% - 10% thuế):</span>
                <span className="font-bold text-blue-600">{formatCurrency(example.agentOverride.net)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">NPP nhận ({example.distributorOverride.percent}% - 10% thuế):</span>
                <span className="font-bold text-purple-600">{formatCurrency(example.distributorOverride.net)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Tổng thực nhận:</span>
                <span>{formatCurrency(example.ctv.net + example.agentOverride.net + example.distributorOverride.net)}</span>
              </div>
            </div>
          </div>

          {/* Case 4: NPP bán trực tiếp */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-700 mb-3">Trường hợp 4: NPP bán trực tiếp</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">NPP nhận ({example.distributorDirect.percent}% - 10% thuế):</span>
                <span className="font-bold text-purple-600">{formatCurrency(example.distributorDirect.net)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Tổng thực nhận:</span>
                <span>{formatCurrency(example.distributorDirect.net)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Rules */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          Quy tắc hiển thị dữ liệu
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <span className="text-xl">🧑‍💼</span>
            <div>
              <strong className="text-green-700">CTV:</strong>
              <span className="text-slate-600 ml-2">Chỉ thấy đơn hàng và khách hàng do mình giới thiệu</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-xl">🏪</span>
            <div>
              <strong className="text-blue-700">Đại lý:</strong>
              <span className="text-slate-600 ml-2">Thấy CTV trực thuộc + khách hàng trực tiếp. <em className="text-red-500">Không thấy khách của CTV</em></span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-xl">🏢</span>
            <div>
              <strong className="text-purple-700">Nhà phân phối:</strong>
              <span className="text-slate-600 ml-2">Thấy Đại lý + CTV trực thuộc + khách trực tiếp. <em className="text-red-500">Không thấy khách của cấp dưới</em></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
