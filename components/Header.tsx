"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Sparkles } from "lucide-react";
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
    { href: "/#dich-vu", label: "Dịch vụ" },
    { href: "/bang-gia", label: "Bảng giá" },
    { href: "/#lien-he", label: "Liên hệ" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-slate-900">
              VệSinh<span className="text-primary-500">HCM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium"
            >
              <Phone className="w-5 h-5" />
              {settings.site_phone}
            </a>
            <Link href="/dat-lich" className="btn btn-primary">
              Đặt lịch ngay
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-100 animate-slide-down">
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-xl text-slate-600 hover:bg-primary-50 hover:text-primary-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dat-lich"
                className="btn btn-primary mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đặt lịch ngay
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

