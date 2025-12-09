import Link from "next/link";
import { Phone, Mail, MapPin, Sparkles, Facebook, Instagram } from "lucide-react";

interface FooterProps {
  settings: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-white">
                VệSinh<span className="text-primary-400">HCM</span>
              </span>
            </Link>
            <p className="text-slate-400 mb-6">
              Dịch vụ vệ sinh chuyên nghiệp hàng đầu TP.HCM. Chúng tôi cam kết mang đến không gian sống sạch sẽ, trong lành cho mọi gia đình.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-4">Dịch vụ</h4>
            <ul className="space-y-3">
              {[
                "Vệ sinh nhà ở",
                "Vệ sinh văn phòng",
                "Giặt ghế sofa",
                "Vệ sinh điều hòa",
                "Vệ sinh sau xây dựng",
              ].map((item) => (
                <li key={item}>
                  <Link href="/#dich-vu" className="hover:text-primary-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/bang-gia" className="hover:text-primary-400 transition-colors">
                  Bảng giá dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/dat-lich" className="hover:text-primary-400 transition-colors">
                  Đặt lịch online
                </Link>
              </li>
              <li>
                <Link href="/tra-cuu" className="hover:text-primary-400 transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/#lien-he" className="hover:text-primary-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{settings.site_phone}</p>
                  <p className="text-sm text-slate-400">Hotline 24/7</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <p className="text-white">{settings.site_email}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <p>{settings.site_address}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} {settings.site_name || "VệSinhHCM"}. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-slate-300">Điều khoản sử dụng</Link>
              <Link href="#" className="hover:text-slate-300">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

