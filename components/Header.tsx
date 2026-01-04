"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Bot, ShoppingCart, User, LogIn, ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  settings: Record<string, string>;
}

export default function Header({ settings }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    return "/tai-khoan";
  };

  const navLinks = [
    { href: "/", label: "TRANG CHỦ" },
    { href: "/goi", label: "GÓI DỊCH VỤ" },
    { href: "/san-pham", label: "SẢN PHẨM" },
    { href: "/qua-tang", label: "QUÀ TẶNG" },
    { href: "/tuyen-ctv", label: "TUYỂN CTV" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-hidden",
          isScrolled || isMobileMenuOpen
            ? "bg-gradient-to-r from-[#800000] via-[#5a0505] to-[#800000] shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2 sm:py-3 border-b-2 border-yellow-400/40"
            : "bg-[#5a0505]/80 backdrop-blur-2xl py-3 sm:py-5 border-b border-yellow-400/30"
        )}
      >
        {/* Tet Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-0 left-1/4 text-xl animate-bounce" style={{ animationDuration: '4s' }}>🌸</div>
          <div className="absolute top-2 right-1/3 text-lg animate-pulse" style={{ animationDuration: '3s' }}>🌼</div>
          <div className="absolute -top-1 right-10 text-2xl animate-bounce" style={{ animationDuration: '5s' }}>🏮</div>
          <div className="absolute top-4 left-10 text-lg opacity-60">✨</div>
        </div>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group relative z-10" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-transparent">
                <img
                  src="/logo.png"
                  alt="Sàn trợ lý AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sàn trợ lý <span className="text-yellow-400 font-black">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-bold text-yellow-400 hover:text-white transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">

              {/* User Account */}
              {!isLoading && (
                isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-slate-900 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="text-white text-sm font-medium max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    </button>

                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                          <div className="px-4 py-2 border-b border-slate-100">
                            <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            href={getDashboardLink()}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            {isAdmin ? "Quản trị" : "Tài khoản"}
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/dang-nhap"
                    className="flex items-center gap-2 px-4 py-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Đăng nhập
                  </Link>
                )
              )}

              <Link
                href="/dat-hang"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 shadow-lg shadow-primary-400/30 hover:shadow-xl transition-all uppercase"
              >
                <ShoppingCart className="w-5 h-5" />
                MUA NGAY
              </Link>
            </div>

            {/* Mobile buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                className="p-2 rounded-lg bg-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[#5a0505] z-50 transform transition-transform duration-300 lg:hidden shadow-2xl border-l border-yellow-400/30",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-4">
          {/* User info on mobile */}
          {!isLoading && isAuthenticated && user && (
            <div className="mb-4 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-slate-900 font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <Link
                href={getDashboardLink()}
                className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-400/20 text-primary-400 rounded-lg text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                {isAdmin ? "Quản trị" : "Tài khoản"}
              </Link>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-4 rounded-xl font-bold text-yellow-400 hover:bg-white/10 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            {/* Login button for guests */}
            {!isLoading && !isAuthenticated && (
              <Link
                href="/dang-nhap"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 border-2 border-white/30 text-white font-bold rounded-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="w-5 h-5" />
                ĐĂNG NHẬP
              </Link>
            )}
            <a
              href={`tel:${settings.site_phone?.replace(/[\s–]/g, "").split("–")[0] || "0345501969"}`}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 border-2 border-primary-400 text-primary-400 font-bold rounded-xl"
            >
              <Phone className="w-5 h-5" />
              GỌI NGAY
            </a>
            <Link
              href="/dat-hang"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary-400 text-slate-900 font-bold rounded-xl shadow-lg uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              MUA NGAY
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
