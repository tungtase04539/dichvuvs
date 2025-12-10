"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  Building2, 
  TrendingUp,
  Eye,
  Loader2,
  Search
} from "lucide-react";

export const dynamic = "force-dynamic";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  parentId: string | null;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  master_agent: "Tổng đại lý",
  agent: "Đại lý",
  collaborator: "Cộng tác viên",
};

const roleColors: Record<string, string> = {
  master_agent: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
  collaborator: "bg-orange-100 text-orange-700",
};

export default function AgentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/accounts");
        const data = await res.json();
        if (data.users) {
          // Filter only agents, master_agents, collaborators
          const filtered = data.users.filter((u: User) => 
            ["master_agent", "agent", "collaborator"].includes(u.role)
          );
          setUsers(filtered);
        }
      } catch (error) {
        console.error("Load users error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // Stats
  const masterAgentCount = users.filter((u) => u.role === "master_agent").length;
  const agentCount = users.filter((u) => u.role === "agent").length;
  const collaboratorCount = users.filter((u) => u.role === "collaborator").length;

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
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Đại lý</h1>
          <p className="text-slate-600">Quản lý tất cả tổng đại lý, đại lý và cộng tác viên</p>
        </div>
        <Link
          href="/admin/tai-khoan"
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
            filterRole === "master_agent" ? "border-blue-500 bg-blue-50" : "border-slate-200"
          }`}
          onClick={() => setFilterRole(filterRole === "master_agent" ? "" : "master_agent")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{masterAgentCount}</p>
              <p className="text-xs text-slate-500">Tổng đại lý</p>
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
            filterRole === "agent" ? "border-green-500 bg-green-50" : "border-slate-200"
          }`}
          onClick={() => setFilterRole(filterRole === "agent" ? "" : "agent")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{agentCount}</p>
              <p className="text-xs text-slate-500">Đại lý</p>
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
            filterRole === "collaborator" ? "border-orange-500 bg-orange-50" : "border-slate-200"
          }`}
          onClick={() => setFilterRole(filterRole === "collaborator" ? "" : "collaborator")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{collaboratorCount}</p>
              <p className="text-xs text-slate-500">Cộng tác viên</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              <p className="text-xs text-slate-500">Tổng cộng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Tài khoản</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Vai trò</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">SĐT</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Ngày tạo</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        user.role === "master_agent" ? "bg-blue-500" :
                        user.role === "agent" ? "bg-green-500" : "bg-orange-500"
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {user.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/admin/tai-khoan"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Không tìm thấy tài khoản nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
