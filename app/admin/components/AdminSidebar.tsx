"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Users,
  Settings,
  Bot,
  ShoppingBag,
  Key,
  UserCheck,
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

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/don-hang", icon: Package, label: "Đơn hàng" },
    { href: "/admin/khach-hang", icon: UserCheck, label: "Khách hàng" },
    { href: "/admin/chat", icon: MessageCircle, label: "Chat" },
    ...(user.role === "admin"
      ? [
          { href: "/admin/san-pham", icon: ShoppingBag, label: "Sản phẩm" },
          { href: "/admin/tai-khoan", icon: Key, label: "Tài khoản" },
        ]
      : []),
  ];

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
            <span className="text-xs text-slate-400">Quản trị viên</span>
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
                "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all",
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">
                {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
