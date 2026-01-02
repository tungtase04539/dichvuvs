"use client";

import Link from "next/link";
import { Bot, Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react";

interface FooterProps {
  settings: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#110101] text-white border-t border-yellow-400/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Sàn trợ lý AI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold">
                Sàn trợ lý <span className="text-yellow-400 font-black">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Hệ thống cung cấp Trợ lý AI hàng đầu Việt Nam, giúp doanh nghiệp tự động hóa chăm sóc khách hàng và tăng trưởng doanh số vượt trội.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-red-900 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-black/20"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://zalo.me/0345501969"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-red-900 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-black/20"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black mb-6 text-yellow-500 uppercase tracking-widest">SẢN PHẨM</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/san-pham" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Tất cả ChatBot
                </Link>
              </li>
              <li>
                <Link href="/dat-hang" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Mua ChatBot
                </Link>
              </li>
              <li>
                <Link href="/tra-cuu" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/tuyen-ctv" className="text-slate-400 hover:text-yellow-400 transition-colors font-bold">
                  Tuyển Cộng tác viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-black mb-6 text-yellow-500 uppercase tracking-widest">HỖ TRỢ</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Hướng dẫn sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-black mb-6 text-yellow-500 uppercase tracking-widest">LIÊN HỆ</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                  <Phone className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">HOTLINE/ZALO</p>
                  <a href={`tel:${settings.site_phone?.replace(/[\s–]/g, "").split("–")[0] || "0345501969"}`} className="font-bold text-white hover:text-yellow-400">
                    {settings.site_phone || "0345 501 969"}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                  <Mail className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">EMAIL</p>
                  <a href="mailto:support@chatbotvn.com" className="font-bold text-white hover:text-yellow-400">
                    support@chatbotvn.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0 border border-yellow-400/20">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">ĐỊA CHỈ</p>
                  <p className="font-bold text-white">RUBY CT1-2-3 PHÚC LỢI – HÀ NỘI</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0 border border-yellow-400/20">
                  <MessageCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">ZALO HỖ TRỢ</p>
                  <a href="https://zalo.me/0345501969" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-yellow-400">
                    Liên hệ Zalo
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} Sàn trợ lý AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 group">
              <span>Được phát triển với</span>
              <span className="text-yellow-400 animate-pulse">❤️</span>
              <span>tại Việt Nam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
