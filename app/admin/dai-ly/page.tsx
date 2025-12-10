import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  Building2, 
  TrendingUp, 
  Link2,
  Eye,
  MoreVertical 
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const roleLabels: Record<string, string> = {
  admin: "Admin",
  master_agent: "Tổng đại lý",
  agent: "Đại lý",
  collaborator: "Cộng tác viên",
  staff: "Nhân viên",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  master_agent: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
  collaborator: "bg-orange-100 text-orange-700",
  staff: "bg-slate-100 text-slate-700",
};

async function getAgents(userId: string, userRole: string) {
  if (userRole === "admin") {
    // Admin sees all agents and collaborators
    const [masterAgents, agents, collaborators, stats] = await Promise.all([
      prisma.user.findMany({
        where: { role: "master_agent" },
        include: {
          subAgents: {
            include: {
              referralLinks: true,
              subAgents: { // CTV of agents
                include: { referralLinks: true },
              },
            },
          },
          referralLinks: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "agent", parentId: null },
        include: {
          referralLinks: true,
          subAgents: { // CTV of this agent
            include: { referralLinks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "collaborator", parent: { parentId: null } }, // CTV of independent agents
        include: {
          referralLinks: true,
          parent: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.groupBy({
        by: ["role"],
        where: { role: { in: ["master_agent", "agent", "collaborator"] } },
        _count: true,
      }),
    ]);

    return { masterAgents, agents, collaborators, stats };
  } else if (userRole === "master_agent") {
    // Master agent sees their agents and their CTVs
    const subAgents = await prisma.user.findMany({
      where: { parentId: userId },
      include: {
        referralLinks: true,
        subAgents: { // CTVs
          include: { referralLinks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { masterAgents: [], agents: subAgents, collaborators: [], stats: [] };
  }

  return { masterAgents: [], agents: [], collaborators: [], stats: [] };
}

export default async function AgentsPage() {
  const user = await getSession();
  
  if (!user || !["admin", "master_agent"].includes(user.role)) {
    redirect("/admin");
  }

  const { masterAgents, agents, collaborators, stats } = await getAgents(user.id, user.role);

  const masterAgentCount = stats.find((s: { role: string }) => s.role === "master_agent")?._count || 0;
  const agentCount = stats.find((s: { role: string }) => s.role === "agent")?._count || 0;
  const collaboratorCount = stats.find((s: { role: string }) => s.role === "collaborator")?._count || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user.role === "admin" ? "Quản lý Đại lý" : "Đại lý của tôi"}
          </h1>
          <p className="text-slate-600">
            {user.role === "admin" 
              ? "Quản lý tất cả tổng đại lý và đại lý trong hệ thống"
              : "Quản lý các đại lý thuộc quyền của bạn"
            }
          </p>
        </div>
        {user.role === "admin" && (
          <Link
            href="/admin/dai-ly/them"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm đại lý
          </Link>
        )}
      </div>

      {/* Stats - Admin only */}
      {user.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{masterAgentCount}</p>
                <p className="text-sm text-slate-500">Tổng đại lý</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{agentCount}</p>
                <p className="text-sm text-slate-500">Đại lý</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{collaboratorCount}</p>
                <p className="text-sm text-slate-500">Cộng tác viên</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{masterAgentCount + agentCount + collaboratorCount}</p>
                <p className="text-sm text-slate-500">Tổng cộng</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Agents - Admin only */}
      {user.role === "admin" && masterAgents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Tổng đại lý ({masterAgents.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Tổng đại lý</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Số đại lý</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Mã giới thiệu</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Trạng thái</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterAgents.map((ma) => (
                  <tr key={ma.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {ma.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{ma.name}</p>
                          <p className="text-sm text-slate-500">{ma.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-900">{ma.subAgents.length}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {ma.referralLinks[0] ? (
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-primary-600">
                          {ma.referralLinks[0].code}
                        </code>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {ma.active ? (
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/dai-ly/${ma.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agents */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-green-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            {user.role === "admin" ? `Đại lý độc lập (${agents.length})` : `Đại lý của tôi (${agents.length})`}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Đại lý</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Mã giới thiệu</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Click</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Đơn hàng</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Doanh thu</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map((agent) => {
                const refLink = agent.referralLinks[0];
                return (
                  <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{agent.name}</p>
                          <p className="text-sm text-slate-500">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {refLink ? (
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-primary-600">
                          {refLink.code}
                        </code>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-900">{refLink?.clickCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-green-600">{refLink?.orderCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(refLink?.revenue || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/dai-ly/${agent.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {agents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chưa có đại lý nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

