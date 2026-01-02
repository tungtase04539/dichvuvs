"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gift, Users, MessageCircle, Star, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

export default function QuaTangPage() {
  const gifts = [
    {
      icon: "🤖",
      title: "ChatBot AI Miễn Phí",
      description: "Nhận 1 ChatBot AI hoàn toàn miễn phí khi gia nhập cộng đồng",
      highlight: true,
    },
    {
      icon: "🎁",
      title: "Lì Xì May Mắn",
      description: "Voucher giảm giá 20-50% cho tất cả các dịch vụ ChatBot",
    },
    {
      icon: "📚",
      title: "Bộ Template VIP",
      description: "Kho kịch bản ChatBot tối ưu cho hơn 20 ngành nghề",
    },
    {
      icon: "💎",
      title: "Đặc Quyền Hội Viên",
      description: "Hỗ trợ 1-1 cài đặt và tối ưu ChatBot trọn đời",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 overflow-x-hidden text-white">
      <Header settings={{}} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🌸</div>
          <div className="absolute top-40 right-20 text-5xl animate-bounce" style={{ animationDuration: '4s' }}>🌸</div>
          <div className="absolute bottom-20 left-1/4 text-4xl animate-pulse">✨</div>
          <div className="absolute top-1/3 right-1/4 text-6xl opacity-10">🏮</div>
          <div className="absolute bottom-1/3 left-10 text-6xl opacity-10">🏮</div>
          {/* Golden Sparkles */}
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white rounded-full animate-ping delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)] mb-8 border-4 border-white animate-bounce">
            <Gift className="w-14 h-14 text-emerald-700" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight uppercase">
            QUÀ TẶNG <span className="text-yellow-400">MAY MẮN</span> <br className="hidden md:block" />
            <span className="text-green-300">XUÂN BÍNH NGỌ</span>
          </h1>

          <p className="text-2xl md:text-3xl text-emerald-50 max-w-3xl mx-auto mb-16 font-bold drop-shadow-lg leading-relaxed">
            Mở bát đầu năm với hàng ngàn phần quà hấp dẫn dành riêng cho cộng đồng ChatBot VN.
            Vạn sự như ý - Tỷ sự thành công!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <a
              href="https://zalo.me/0345501969"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-5 px-14 py-7 bg-white text-emerald-800 font-extrabold rounded-full hover:bg-yellow-400 hover:text-emerald-900 transition-all duration-500 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 text-2xl uppercase tracking-tighter"
            >
              <MessageCircle className="w-10 h-10" />
              NHẬN QUÀ QUA ZALO
              <Sparkles className="w-8 h-8 animate-spin text-yellow-500" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <div className="mt-12 text-white font-black flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              {[
                { name: "A", color: "bg-blue-500" },
                { name: "H", color: "bg-emerald-500" },
                { name: "M", color: "bg-orange-500" },
                { name: "T", color: "bg-purple-500" },
                { name: "N", color: "bg-pink-500" }
              ].map((user, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-full border-4 border-emerald-800 flex items-center justify-center text-white font-black shadow-2xl ${user.color} transform hover:-translate-y-2 transition-transform`}
                >
                  {user.name}
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-emerald-800 bg-emerald-600 flex items-center justify-center text-white font-black shadow-2xl hover:scale-110 transition-transform">
                +
              </div>
            </div>
            <span className="text-xl md:text-2xl drop-shadow-md">1,850+ người đã nhận quà Tết</span>
          </div>
        </div>
      </section>

      {/* Gifts Grid */}
      <section className="py-24 bg-white/5 backdrop-blur-xl relative border-y-8 border-yellow-400/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-yellow-400 uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]">Lộc Xuân Tràn Đầy</h2>
            <div className="h-2 w-48 bg-yellow-400 mx-auto mt-6 rounded-full shadow-lg"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {gifts.map((gift, index) => (
              <div
                key={index}
                className={`group p-10 rounded-[3rem] border-4 transition-all duration-500 hover:-translate-y-4 flex flex-col items-center text-center shadow-2xl ${gift.highlight
                  ? "bg-gradient-to-br from-yellow-400/90 to-amber-500 border-white shadow-yellow-400/20"
                  : "bg-white/10 border-white/20 hover:border-yellow-400 hover:bg-white/20"
                  }`}
              >
                <div className="text-8xl mb-8 transform group-hover:scale-125 transition-transform duration-500 drop-shadow-xl">
                  {gift.icon}
                </div>
                <h3 className={`text-3xl font-black mb-4 uppercase leading-tight ${gift.highlight ? "text-emerald-900" : "text-white"}`}>
                  {gift.title}
                </h3>
                <p className={`text-xl font-medium ${gift.highlight ? "text-emerald-800" : "text-emerald-50/80"} leading-relaxed`}>
                  {gift.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-32 relative overflow-hidden bg-emerald-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-20 uppercase drop-shadow-lg tracking-tighter">Quy Trình Nhận Lộc</h2>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-12 max-w-6xl mx-auto">
            {[
              { n: 1, t: "Liên hệ Zalo", d: "Ấn vào nút trắng nổi bật phía trên" },
              { n: 2, t: "Gõ lệnh Nhận", d: "Chào mọi người và gõ 'NHẬN QUÀ'" },
              { n: 3, t: "Hưởng ưu đãi", d: "Bot sẽ tự động gửi quà tặng ngay lập tức" },
            ].map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-6 group p-10 bg-white/5 rounded-3xl border-2 border-white/10 hover:border-yellow-400 transition-all">
                <div className="w-24 h-24 rounded-full bg-yellow-400 text-emerald-900 flex items-center justify-center text-4xl font-black shadow-2xl group-hover:rotate-[360deg] transition-all duration-1000 border-4 border-white">
                  {step.n}
                </div>
                <h3 className="text-3xl font-black text-white mt-4 uppercase text-yellow-400">{step.t}</h3>
                <p className="text-emerald-50/70 text-xl font-medium">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center bg-emerald-800 border-t-8 border-yellow-400">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-12 uppercase drop-shadow-2xl">ĐỪNG BỎ LỠ!</h2>
          <a
            href="https://zalo.me/0345501969"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-20 py-10 bg-white text-emerald-700 font-black text-4xl rounded-full shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] hover:bg-yellow-400 hover:text-emerald-900 transition-all uppercase hover:scale-110 active:scale-95 border-b-8 border-gray-200 hover:border-yellow-600"
          >
            LIÊN HỆ ZALO NGAY 🏮
          </a>
          <p className="mt-12 text-2xl text-emerald-200 font-bold animate-pulse">Quà tặng giới hạn cho 50 người đầu tiên mỗi ngày!</p>
        </div>
      </section>

      <Footer settings={{}} />
    </div>
  );
}
