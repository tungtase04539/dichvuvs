"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Users,
  Bot,
  ShoppingBag,
  Key,
  UserCheck,
  Link2,
  Building2,
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
  ctv: "Cộng tác viên",
  customer: "Khách hàng",
  master_agent: "Tổng đại lý",
  agent: "Đại lý",
  collaborator: "Cộng tác viên",
  staff: "Nhân viên",
};

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/admin/chat/unread");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    // Only fetch for admin and staff
    if (user.role === "admin" || user.role === "staff") {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user.role]);

  // Navigation items based on role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    ];

    if (user.role === "admin") {
      return [
        ...baseItems,
        { href: "/admin/don-hang", icon: Package, label: "Đơn hàng" },
        { href: "/admin/khach-hang", icon: UserCheck, label: "Khách hàng" },
        { href: "/admin/chat", icon: MessageCircle, label: "Chat", badge: unreadCount },
        { href: "/admin/san-pham", icon: ShoppingBag, label: "Sản phẩm" },
        { href: "/admin/ctv", icon: Users, label: "Quản lý CTV" },
        { href: "/admin/gioi-thieu", icon: Link2, label: "Mã giới thiệu" },
        { href: "/admin/tai-khoan", icon: Key, label: "Tài khoản" },
      ];
    }

    if (user.role === "master_agent") {
      return [
        ...baseItems,
        { href: "/admin/don-hang", icon: Package, label: "Đơn hàng của tôi" },
        { href: "/admin/dai-ly", icon: Users, label: "Đại lý của tôi" },
        { href: "/admin/gioi-thieu", icon: Link2, label: "Mã giới thiệu" },
      ];
    }

    if (user.role === "agent") {
      return [
        ...baseItems,
        { href: "/admin/don-hang", icon: Package, label: "Đơn hàng của tôi" },
        { href: "/admin/ctv", icon: Users, label: "CTV của tôi" },
        { href: "/admin/gioi-thieu", icon: Link2, label: "Mã giới thiệu" },
      ];
    }

    if (user.role === "ctv" || user.role === "collaborator") {
      return [
        ...baseItems,
        { href: "/admin/don-hang", icon: Package, label: "Đơn hàng của tôi" },
        { href: "/admin/khach-hang", icon: UserCheck, label: "Khách hàng của tôi" },
        { href: "/admin/gioi-thieu", icon: Link2, label: "Mã giới thiệu" },
        { href: "/admin/ho-so", icon: Key, label: "Hồ sơ cá nhân" },
      ];
    }

    // Staff
    return [
      ...baseItems,
      { href: "/admin/don-hang", icon: Package, label: "Đơn hàng" },
      { href: "/admin/khach-hang", icon: UserCheck, label: "Khách hàng" },
      { href: "/admin/chat", icon: MessageCircle, label: "Chat", badge: unreadCount },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 hidden lg:block z-40">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white block">
              ChatBotVN
            </span>
            <span className="text-xs text-slate-400">{roleLabels[user.role]}</span>
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
