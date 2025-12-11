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
    { href: "/", label: "TRANG CHỦ" },
    { href: "/san-pham", label: "SẢN PHẨM" },
    { href: "/tin-tuc", label: "TIN TỨC" },
    { href: "/dang-ky-ctv", label: "ĐĂNG KÝ CTV" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-slate-900 shadow-lg shadow-black/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-400/30">
              <Bot className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-2xl font-bold text-white">
              ChatBot<span className="text-primary-400">VN</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-bold text-primary-400 hover:text-primary-300 transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${settings.site_phone?.replace(/[\s–]/g, "").split("–")[0] || "0363189699"}`}
              className="flex items-center gap-2 font-bold text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {settings.site_phone || "0363 189 699"}
            </a>
            <Link
              href="/dat-hang"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 shadow-lg shadow-primary-400/30 hover:shadow-xl transition-all uppercase"
            >
              <ShoppingCart className="w-5 h-5" />
              MUA NGAY
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary-400/20 animate-slide-down">
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-xl font-bold text-primary-400 hover:bg-primary-400/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dat-hang"
                className="flex items-center justify-center gap-2 mt-2 px-5 py-3 bg-primary-400 text-slate-900 font-bold rounded-xl shadow-lg uppercase"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                MUA NGAY
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
