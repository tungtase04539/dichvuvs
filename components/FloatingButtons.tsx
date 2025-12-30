"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingButtons() {
  const pathname = usePathname();

  // Không hiện ở Dashboard admin hoặc Dashboard người dùng
  const hidePaths = ["/admin", "/tai-khoan"];
  const shouldHide = hidePaths.some(path => pathname?.startsWith(path));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col gap-4 items-end pointer-events-none">
      {/* Tặng quà - Xanh Emerald & Vàng Gold */}
      <Link
        href="/qua-tang"
        className="group pointer-events-auto w-52 sm:w-64"
      >
        <div className="relative flex items-center h-14 sm:h-16 pr-4 pl-14 sm:pl-16 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white rounded-full shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-110 animate-glow-green border border-yellow-400/30 overflow-hidden">
          <div className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 animate-wiggle" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] leading-none opacity-90 animate-pulse text-yellow-200">Ưu đãi hôm nay</span>
            <span className="font-black text-sm sm:text-lg whitespace-nowrap drop-shadow-sm uppercase">TẶNG QUÀ MIỄN PHÍ</span>
          </div>
          <Sparkles className="absolute top-1 right-2 w-4 h-4 text-yellow-300 animate-twinkle" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </Link>

      {/* Khuyến mại Tết - Đỏ Nhung & Vàng Gold */}
      <Link
        href="/khuyen-mai-tet"
        className="group pointer-events-auto w-52 sm:w-64"
      >
        <div className="relative flex items-center h-14 sm:h-16 pr-4 pl-14 sm:pl-16 bg-gradient-to-r from-red-600 via-red-700 to-red-900 text-white rounded-full shadow-lg shadow-red-900/40 hover:shadow-red-600/60 transition-all duration-300 hover:scale-110 animate-glow-red border border-yellow-400/50 overflow-hidden">
          <div className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 fill-red-700 animate-flash" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] leading-none opacity-90 text-yellow-200 drop-shadow-md">🏮 Lễ Hội Xuân 🏮</span>
            <span className="font-black text-sm sm:text-lg whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase italic text-white flex items-center gap-1">
              KHUYẾN MẠI TẾT 🌸
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent animate-scan opacity-30" />
        </div>
      </Link>

      {/* Trải nghiệm miễn phí - Vàng */}
      <Link
        href="/dung-thu"
        className="group pointer-events-auto w-52 sm:w-64"
      >
        <div className="relative flex items-center h-14 sm:h-16 pr-4 pl-14 sm:pl-16 bg-gradient-to-r from-yellow-500 to-amber-400 text-slate-900 rounded-full shadow-lg shadow-yellow-500/40 hover:shadow-yellow-500/60 transition-all duration-300 hover:scale-110 animate-glow-yellow border border-white/30 overflow-hidden">
          <div className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] leading-none opacity-70">Thực tế 0đ</span>
            <span className="font-black text-sm sm:text-lg whitespace-nowrap uppercase">Dùng thử ngay</span>
          </div>
          <div className="absolute top-0 right-4 w-1 h-full bg-white/20 skew-x-12 animate-slide" />
        </div>
      </Link>

      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes flash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0); }
          50% { opacity: 0.5; transform: scale(0.8) rotate(45deg); }
        }
        @keyframes glow-red {
          0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
        }
        @keyframes glow-green {
          0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.6); }
        }
        @keyframes glow-yellow {
          0%, 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6); }
        }
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        @keyframes slide {
          from { transform: translateX(-200%) skewX(-20deg); }
          to { transform: translateX(300%) skewX(-20deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-wiggle { animation: wiggle 0.5s infinite ease-in-out; }
        .animate-flash { animation: flash 0.8s infinite ease-in-out; }
        .animate-twinkle { animation: twinkle 1s infinite alternate; }
        .animate-glow-red { animation: glow-red 2s infinite ease-in-out; }
        .animate-glow-green { animation: glow-green 2s infinite ease-in-out; }
        .animate-glow-yellow { animation: glow-yellow 2s infinite ease-in-out; }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-slide { animation: slide 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
      `}</style>
    </div>
  );
}
