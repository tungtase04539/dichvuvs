"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Bot,
  ShoppingBag,
  Key,
  UserCheck,
  Link2,
  Building2,
  Wallet,
  DollarSign,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminSidebarProps {
  user: User;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  master_agent: "Nhà phân phối",
  distributor: "Nhà phân phối",
  agent: "Đại lý",
  collaborator: "Cộng tác viên",
  ctv: "Cộng tác viên",
  staff: "Nhân viên",
};

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  // Navigation items based on role
  const getNavItems = (): NavItem[] => {
    const isPartner = user.role === "collaborator" || user.role === "ctv" || user.role === "agent" || user.role === "distributor" || user.role === "master_agent";
    const isAgentOrHigher = user.role === "agent" || user.role === "distributor" || user.role === "master_agent";
    const isAdmin = user.role === "admin";

    const items: NavItem[] = [];

    // CTV/Agent Dashboard
    if (isPartner) {
      items.push({ href: "/admin/ctv-dashboard", icon: TrendingUp, label: "Dashboard CTV" });
      items.push({ href: "/admin/don-hang", icon: Package, label: "Đơn hàng" });
      items.push({ href: "/admin/hoa-hong", icon: DollarSign, label: "Hoa hồng" });
      items.push({ href: "/admin/rut-tien", icon: Wallet, label: "Rút tiền" });
      
      // Đội nhóm chỉ cho Agent trở lên
      if (isAgentOrHigher) {
        items.push({ href: "/admin/doi-nhom", icon: Users, label: "Đội nhóm" });
      }
      
      items.push({ href: "/admin/san-pham", icon: ShoppingBag, label: "Sản phẩm" });
      items.push({ href: "/admin/link-gioi-thieu", icon: Link2, label: "Link giới thiệu" });
    } else {
      // Admin/Staff menu
      items.push({ href: "/admin", icon: LayoutDashboard, label: "Dashboard" });
      items.push({ href: "/admin/don-hang", icon: Package, label: "Đơn hàng" });
      items.push({ href: "/admin/khach-hang", icon: UserCheck, label: "Khách hàng" });
      items.push({ href: "/admin/ctv-duyet", icon: Users, label: "Duyệt CTV" });
      items.push({ href: "/admin/san-pham", icon: ShoppingBag, label: "Sản phẩm" });

      // Admin only
      if (isAdmin) {
        items.push({ href: "/admin/hoa-hong", icon: DollarSign, label: "Quản lý hoa hồng" });
        items.push({ href: "/admin/quan-ly-rut-tien", icon: Wallet, label: "Yêu cầu rút tiền" });
        items.push({ href: "/admin/cau-hinh-goi", icon: Bot, label: "Cấu hình gói" });
        items.push({ href: "/admin/cau-hinh-hoa-hong", icon: Settings, label: "Cấu hình hoa hồng" });
        items.push({ href: "/admin/tai-khoan", icon: Key, label: "Tài khoản" });
      }
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 hidden lg:block z-40">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Sàn trợ lý AI Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-white block leading-tight uppercase">
              SÀN TRỢ LÝ <span className="text-primary-400">AI</span>
            </span>
            <span className="text-[10px] font-bold text-primary-400 tracking-[0.1em] uppercase opacity-80">
              Quản trị hệ thống
            </span>
          </div>
        </Link>
      </div>

      <nav className="px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all relative",
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium flex-1">{item.label}</span>
              {/* Badge for unread messages - Green color with animation */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="min-w-[24px] h-[24px] flex items-center justify-center bg-emerald-500 text-white text-xs font-bold rounded-full px-1.5 shadow-lg animate-bounce ring-2 ring-emerald-400 ring-opacity-50">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
