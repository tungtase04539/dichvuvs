"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gift, Users, MessageCircle, Star, ArrowRight, CheckCircle, Sparkles, Bot } from "lucide-react";

export default function QuaTangPage() {
  const gifts = [
    {
      logo: "/gifts/capcut.png",
      title: "Capcut Pro",
      duration: "1 THÁNG",
      description: "Mở khóa toàn bộ tính năng và hiệu ứng cao cấp nhất của Capcut.",
      highlight: true,
    },
    {
      logo: "https://img.icons8.com/fluency/512/chatgpt.png",
      title: "ChatGPT Plus",
      duration: "1 THÁNG / 1 NĂM",
      description: "Trải nghiệm mô hình GPT-4o mới nhất với tốc độ phản hồi cực nhanh.",
    },
    {
      logo: "/gifts/google.png",
      title: "Google Ultra",
      duration: "45K CREDIT",
      description: "Sử dụng veo3 và các tính năng AI đỉnh cao của Google.",
    },
    {
      logo: "https://img.icons8.com/color/512/canva.png",
      title: "Canva Pro Edu",
      duration: "1 NĂM",
      description: "Thiết kế không giới hạn với kho tài nguyên Pro khổng lồ.",
    },
  ];

  const customerInitials = ["H", "M", "T", "A", "N", "V", "L"];

  return (
    <div className="min-h-screen bg-[#1a0101] overflow-x-hidden text-white">
      <Header settings={{ site_phone: "0345 501 969" }} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-hero">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🌸</div>
          <div className="absolute top-40 right-20 text-5xl animate-bounce" style={{ animationDuration: '4s' }}>🌼</div>
          <div className="absolute bottom-20 left-1/4 text-4xl animate-pulse">✨</div>
          <div className="absolute top-1/3 right-1/4 text-6xl opacity-20">🏮</div>
          <div className="absolute bottom-1/3 left-10 text-6xl opacity-20">🏮</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)] mb-8 border-4 border-white/20 animate-float rotate-3">
            <Gift className="w-14 h-14 text-red-900" />
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight uppercase tracking-tighter">
            NHẬN QUÀ <span className="text-yellow-400">KHAI XUÂN</span> <br className="hidden md:block" />
            <span className="text-white/60 text-4xl md:text-6xl block mt-4">VẠN SỰ NHƯ Ý 2026</span>
          </h1>

          <p className="text-xl md:text-2xl text-red-100/80 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
            Khai xuân rạng rỡ với hàng ngàn phần quà hấp dẫn từ Sàn trợ lý AI.
            Món quà đầu năm thay lời chúc thịnh vượng và thành công vượt trội!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <a
              href="https://zalo.me/0345501969"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-5 px-14 py-7 bg-yellow-400 text-red-950 font-black rounded-[2.5rem] hover:bg-yellow-300 transition-all duration-500 shadow-[0_25px_60px_-15px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 text-2xl uppercase tracking-wider"
            >
              <MessageCircle className="w-8 h-8" />
              NHẬN QUÀ QUA ZALO
              <Sparkles className="w-6 h-6 animate-spin" />
            </a>
          </div>

          <div className="mt-16 text-white font-bold flex flex-col items-center gap-4">
            <div className="flex -space-x-4">
              {customerInitials.map((initial, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#1a0101] bg-yellow-400 flex items-center justify-center text-red-900 font-bold shadow-xl">
                  {initial}
                </div>
              ))}
            </div>
            <span className="text-lg md:text-xl text-yellow-400/80 uppercase tracking-widest font-black">2,450+ khách hàng đã nhận lộc xuân</span>
          </div>
        </div>
      </section>

      {/* Gifts Grid */}
      <section className="py-24 bg-[#2a0101]/40 backdrop-blur-xl relative border-y border-yellow-400/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
              BỘ QUÀ TẶNG <span className="text-yellow-400">LỘC XUÂN</span>
            </h2>
            <div className="h-1.5 w-32 bg-yellow-400 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gifts.map((gift, index) => (
              <div
                key={index}
                className={`group p-10 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-3 flex flex-col items-center text-center relative overflow-hidden ${gift.highlight
                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-white/20 shadow-[0_20px_50px_rgba(250,204,21,0.2)]"
                  : "bg-[#2a0101]/60 border-yellow-400/10 hover:border-yellow-400/40"
                  }`}
              >
                <div className="w-24 h-24 mb-8 transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center bg-white/10 rounded-3xl p-4 backdrop-blur-md">
                  <img src={gift.logo} alt={gift.title} className="w-full h-full object-contain" />
                </div>
                {gift.duration && (
                  <div className={`text-[10px] font-black tracking-widest uppercase mb-2 ${gift.highlight ? "text-red-900/60" : "text-yellow-400/60"}`}>
                    {gift.duration}
                  </div>
                )}
                <h3 className={`text-2xl font-black mb-4 uppercase leading-tight ${gift.highlight ? "text-red-950" : "text-white"}`}>
                  {gift.title}
                </h3>
                <p className={`text-base font-medium leading-relaxed ${gift.highlight ? "text-red-900/80" : "text-red-100/60"}`}>
                  {gift.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-20 uppercase tracking-tight">CÁCH THỨC NHẬN LỘC</h2>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto">
            {[
              { n: 1, t: "Kết nối Zalo", d: "Click vào nút nhận quà để mở Zalo hỗ trợ" },
              { n: 2, t: "Nhắn tin nhận quà", d: "Soạn cú pháp 'NHẬN QUÀ XUÂN' nhắn vào box chat" },
              { n: 3, t: "Nhận quà ngay", d: "Quà tặng sẽ được gửi tự động và ngay lập tức" },
            ].map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-6 group p-10 bg-[#2a0101]/40 rounded-[2.5rem] border border-yellow-400/10 hover:border-yellow-400/40 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-red-900 flex items-center justify-center text-2xl font-black shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                  {step.n}
                </div>
                <h3 className="text-xl font-black text-yellow-400 uppercase">{step.t}</h3>
                <p className="text-red-100/60 text-base font-medium leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center bg-gradient-to-b from-transparent to-[#2a0101]">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-12 uppercase tracking-tighter">
            KHAI XUÂN <span className="text-yellow-400">RẠNG RỠ</span>
          </h2>
          <a
            href="https://zalo.me/0345501969"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-16 py-8 bg-yellow-400 text-red-950 font-black text-3xl rounded-[2.5rem] shadow-[0_30px_60px_-10px_rgba(250,204,21,0.4)] hover:bg-yellow-300 transition-all uppercase hover:scale-105 active:scale-95"
          >
            LIÊN HỆ NHẬN QUÀ NGAY 🏮
          </a>
          <p className="mt-12 text-xl text-yellow-400/60 font-black uppercase tracking-[0.2em] animate-pulse">Lộc Xuân chỉ dành cho 50 người/ngày!</p>
        </div>
      </section>

      <Footer settings={{ site_phone: "0345 501 969" }} />
    </div>
  );
}
