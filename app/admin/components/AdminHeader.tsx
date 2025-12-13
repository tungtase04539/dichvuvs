"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Home,
  Settings,
} from "lucide-react";
import { UserPayload } from "@/lib/auth";

interface AdminHeaderProps {
  user: UserPayload;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/quan-tri-vien-dang-nhap");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Xin chào, {user.name}!
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View site */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Xem trang web</span>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-600" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-slide-down">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href="/admin/tai-khoan"
                    className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Tài khoản</span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/cai-dat"
                      className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Cài đặt</span>
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-100 p-4 animate-slide-down">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/don-hang"
              className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Đơn hàng
            </Link>
            <Link
              href="/admin/chat"
              className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Chat
            </Link>
            {user.role === "admin" && (
              <>
                <Link
                  href="/admin/nhan-vien"
                  className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Nhân viên
                </Link>
                <Link
                  href="/admin/cai-dat"
                  className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cài đặt
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

