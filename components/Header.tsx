"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Bot, ShoppingCart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  settings: Record<string, string>;
}

export default function Header({ settings }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/san-pham", label: "Sản phẩm" },
    { href: "/tra-cuu", label: "Tra cứu đơn" },
    { href: "/#tinh-nang", label: "Tính năng" },
    { href: "/#lien-he", label: "Liên hệ" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-lg shadow-slate-200/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className={cn(
              "text-2xl font-bold transition-colors",
              isScrolled ? "text-slate-900" : "text-white"
            )}>
              ChatBot<span className="text-primary-500">VN</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-medium transition-colors hover:text-primary-500",
                  isScrolled ? "text-slate-600" : "text-white/90"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${settings.site_phone?.replace(/\s/g, "") || "19008686"}`}
              className={cn(
                "flex items-center gap-2 font-medium transition-colors",
                isScrolled ? "text-slate-600 hover:text-primary-600" : "text-white/90 hover:text-white"
              )}
            >
              <Phone className="w-5 h-5" />
              {settings.site_phone || "1900 8686"}
            </a>
            <Link
              href="/dat-hang"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/30 hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Mua ngay
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg",
              isScrolled ? "hover:bg-slate-100" : "hover:bg-white/10"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn("w-6 h-6", isScrolled ? "text-slate-900" : "text-white")} />
            ) : (
              <Menu className={cn("w-6 h-6", isScrolled ? "text-slate-900" : "text-white")} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className={cn(
            "md:hidden mt-4 pb-4 border-t animate-slide-down",
            isScrolled ? "border-slate-200" : "border-white/20"
          )}>
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-xl font-medium",
                    isScrolled 
                      ? "text-slate-700 hover:bg-slate-100 hover:text-primary-600"
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dat-hang"
                className="flex items-center justify-center gap-2 mt-2 px-5 py-3 bg-primary-600 text-white font-semibold rounded-xl shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                Mua ngay
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
