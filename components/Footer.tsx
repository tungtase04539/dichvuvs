"use client";

import Link from "next/link";
import { Bot, Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react";

interface FooterProps {
  settings: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                ChatBot<span className="text-primary-400">VN</span>
              </span>
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Giải pháp ChatBot AI hàng đầu Việt Nam, giúp doanh nghiệp tự động hóa chăm sóc khách hàng và tăng trưởng doanh số.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
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
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
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
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hotline</p>
                  <a href={`tel:${settings.site_phone?.replace(/\s/g, "") || "19008686"}`} className="font-semibold hover:text-primary-400">
                    {settings.site_phone || "1900 8686"}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <a href="mailto:support@chatbotvn.com" className="font-semibold hover:text-primary-400">
                    support@chatbotvn.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Địa chỉ</p>
                  <p className="font-semibold">123 Nguyễn Huệ, Q.1, TP.HCM</p>
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
              © {currentYear} ChatBot VN. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Được phát triển với</span>
              <span className="text-red-500">❤️</span>
              <span>tại Việt Nam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
