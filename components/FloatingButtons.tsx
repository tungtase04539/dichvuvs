"use client";

import Link from "next/link";
import { Gift, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col gap-3 items-end pointer-events-none">
      {/* Khuyến mại Tết */}
      <Link
        href="/flash-sale"
        className="group pointer-events-auto w-52 sm:w-64"
      >
        <div className="relative flex items-center h-14 sm:h-16 pr-4 pl-14 sm:pl-16 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full shadow-lg shadow-red-500/40 hover:shadow-red-500/60 transition-all duration-300 hover:scale-105 animate-pulse-slow border border-white/20">
          <div className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce-soft shadow-inner border border-red-400/30">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider leading-none opacity-90">Siêu ưu đãi</span>
            <span className="font-bold text-sm sm:text-base whitespace-nowrap">KHUYẾN MẠI TẾT</span>
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin-slow" />
        </div>
      </Link>

      {/* Trải nghiệm miễn phí */}
      <Link
        href="/dung-thu"
        className="group pointer-events-auto w-52 sm:w-64"
      >
        <div className="relative flex items-center h-14 sm:h-16 pr-4 pl-14 sm:pl-16 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-full shadow-lg shadow-green-500/40 hover:shadow-green-500/60 transition-all duration-300 hover:scale-105 border border-white/20">
          <div className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center animate-pulse shadow-inner">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 fill-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider leading-none opacity-90">Dùng thử 0đ</span>
            <span className="font-bold text-sm sm:text-base whitespace-nowrap">TRẢI NGHIỆM MIỄN PHÍ</span>
          </div>
        </div>
      </Link>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-55%) scale(1.08); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        .animate-bounce-soft {
          animation: bounce-soft 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
