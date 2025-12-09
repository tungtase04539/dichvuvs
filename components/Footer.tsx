import Link from "next/link";
import { Bot, Phone, Mail, MapPin, Facebook, Youtube, MessageCircle } from "lucide-react";

interface FooterProps {
  settings: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-slate-900 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                ChatBot<span className="text-purple-400">VN</span>
              </span>
            </Link>
            <p className="text-slate-400 mb-4 max-w-sm">
              Cung cấp giải pháp ChatBot AI hàng đầu Việt Nam. Tự động hóa kinh doanh với công nghệ AI tiên tiến.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-purple-500 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-purple-500 hover:text-white transition-all">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-purple-500 hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Sản phẩm</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/san-pham" className="text-slate-400 hover:text-purple-400 transition-colors">
                  Tất cả ChatBot
                </Link>
              </li>
              <li>
                <Link href="/dat-hang" className="text-slate-400 hover:text-purple-400 transition-colors">
                  Mua ChatBot
                </Link>
              </li>
              <li>
                <Link href="/tra-cuu" className="text-slate-400 hover:text-purple-400 transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {settings.site_phone || "1900 8686"}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.site_email}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {settings.site_email || "contact@chatbotvn.store"}
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{settings.site_address || "TP.HCM"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ChatBot VN Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
