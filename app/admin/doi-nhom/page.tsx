"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Loader2,
  Package,
  DollarSign,
  TrendingUp,
  UserPlus,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
  _count: {
    referredOrders: number;
    subAgents: number;
  };
}

interface TeamStats {
  directCount: number;
  subTeamCount: number;
  totalCommission: number;
  commissionCount: number;
  isEligibleForOverride: boolean;
  minSubAgentsRequired: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ctv/team");
      const data = await res.json();
      setMembers(data.members || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      master_agent: { bg: "bg-purple-100", text: "text-purple-700", label: "Tổng đại lý" },
      distributor: { bg: "bg-purple-100", text: "text-purple-700", label: "Nhà phân phối" },
      agent: { bg: "bg-blue-100", text: "text-blue-700", label: "Đại lý" },
      collaborator: { bg: "bg-green-100", text: "text-green-700", label: "CTV" },
      ctv: { bg: "bg-green-100", text: "text-green-700", label: "CTV" },
    };
    const style = styles[role] || { bg: "bg-slate-100", text: "text-slate-700", label: role };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const isAgentOrHigher = user?.role === "agent" || user?.role === "distributor" || user?.role === "master_agent" || user?.role === "admin";

  if (!isAgentOrHigher) {
    return (
      <div className="text-center py-20">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Chức năng dành cho Đại lý</h2>
        <p className="text-slate-500">
          Bạn cần là Đại lý hoặc Tổng đại lý để quản lý đội nhóm
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đội nhóm của tôi</h1>
          <p className="text-slate-500 mt-1">Quản lý CTV và đại lý cấp dưới</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <>
          {/* Override Eligibility Alert */}
          {!stats.isEligibleForOverride && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">Chưa đủ điều kiện nhận hoa hồng Override</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Bạn cần có ít nhất <strong>{stats.minSubAgentsRequired} thành viên</strong> cấp dưới để nhận hoa hồng override từ đội nhóm.
                  Hiện tại bạn có <strong>{stats.directCount}/{stats.minSubAgentsRequired}</strong> thành viên.
                </p>
              </div>
            </div>
          )}

          {stats.isEligibleForOverride && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Đủ điều kiện nhận hoa hồng Override ✓</h3>
                <p className="text-sm text-green-700 mt-1">
                  Bạn có <strong>{stats.directCount} thành viên</strong> cấp dưới. Khi họ bán được hàng, bạn sẽ nhận được hoa hồng override.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Thành viên trực tiếp</p>
                <p className="text-2xl font-bold text-slate-900">{stats.directCount}</p>
              </div>
            </div>
          </div>

          {user?.role === "master_agent" || user?.role === "distributor" ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cấp dưới gián tiếp</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.subTeamCount}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hoa hồng từ đội</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCommission)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Số lần nhận override</p>
                <p className="text-2xl font-bold text-slate-900">{stats.commissionCount}</p>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Members List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Danh sách thành viên</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có thành viên nào trong đội nhóm</p>
            <p className="text-sm text-slate-400 mt-2">
              Khi bạn tuyển CTV mới, họ sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm text-slate-600">
                  <th className="px-6 py-4 font-medium">Thành viên</th>
                  <th className="px-6 py-4 font-medium">Vai trò</th>
                  <th className="px-6 py-4 font-medium">Liên hệ</th>
                  <th className="px-6 py-4 font-medium">Đơn hàng</th>
                  <th className="px-6 py-4 font-medium">Doanh thu</th>
                  <th className="px-6 py-4 font-medium">Cấp dưới</th>
                  <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(member.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                        {member.phone && (
                          <p className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{member.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        {formatCurrency(member.totalRevenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member._count.subAgents > 0 ? (
                        <span className="text-purple-600 font-medium">
                          {member._count.subAgents} người
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(member.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
