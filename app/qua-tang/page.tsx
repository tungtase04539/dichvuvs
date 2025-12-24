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
    <div className="min-h-screen bg-[#b91c1c] overflow-x-hidden">
      <Header settings={{}} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🌸</div>
          <div className="absolute top-40 right-20 text-5xl animate-bounce" style={{ animationDuration: '4s' }}>🌸</div>
          <div className="absolute bottom-20 left-1/4 text-4xl animate-pulse">✨</div>
          <div className="absolute top-1/3 right-1/4 text-6xl opacity-20">🏮</div>
          <div className="absolute bottom-1/3 left-10 text-6xl opacity-20">🏮</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-400 shadow-2xl shadow-yellow-400/50 mb-8 border-4 border-white animate-pulse">
            <Gift className="w-12 h-12 text-red-600" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
            TẶNG QUÀ <span className="text-yellow-400">KHỦNG</span> <br className="hidden md:block" />
            MỪNG XUÂN TỚI
          </h1>

          <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto mb-12 font-medium">
            Mở bát đầu năm với hàng ngàn phần quà hấp dẫn dành riêng cho cộng đồng ChatBot VN.
            Đừng bỏ lỡ vận may!
          </p>

          <a
            href="https://zalo.me/g/ubarcp690"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-yellow-400 text-red-700 font-black rounded-full hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:shadow-white/50 text-xl uppercase tracking-widest scale-110"
          >
            <MessageCircle className="w-8 h-8" />
            VÀO NHÓM NHẬN QUÀ NGAY
            <Sparkles className="w-6 h-6 animate-spin" />
            {/* Glossy Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="mt-8 text-white/80 font-bold flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[
                { name: "A", color: "bg-blue-500" },
                { name: "H", color: "bg-emerald-500" },
                { name: "M", color: "bg-orange-500" },
                { name: "T", color: "bg-purple-500" }
              ].map((user, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-red-600 flex items-center justify-center text-white font-bold shadow-lg ${user.color}`}
                >
                  {user.name}
                </div>
              ))}
            </div>
            1,250+ người đã nhận quà
          </div>
        </div>
      </section>

      {/* Gifts Grid */}
      <section className="py-20 bg-white/5 backdrop-blur-md relative">
        {/* Traditional Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 uppercase drop-shadow-lg">Ưu Đãi Tuyệt Vời</h2>
            <div className="h-1 w-24 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gifts.map((gift, index) => (
              <div
                key={index}
                className={`group p-8 rounded-[2rem] border-2 transition-all duration-500 hover:-translate-y-3 flex flex-col items-center text-center ${gift.highlight
                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-white shadow-2xl shadow-yellow-400/20"
                  : "bg-white/10 border-white/20 hover:border-yellow-400 active:bg-white/20"
                  }`}
              >
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                  {gift.icon}
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${gift.highlight ? "text-red-700" : "text-white"}`}>
                  {gift.title}
                </h3>
                <p className={`${gift.highlight ? "text-red-800" : "text-red-100/80"} leading-relaxed`}>
                  {gift.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-16 uppercase">Làm sao để nhận?</h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 max-w-5xl mx-auto">
            {[
              { n: 1, t: "Tham gia nhóm", d: "Ấn vào nút vàng nổi bật ở trên" },
              { n: 2, t: "Giới thiệu mình", d: "Chào mọi người và gõ 'NHẬN QUÀ'" },
              { n: 3, t: "Hưởng ưu đãi", d: "Bot sẽ tự động gửi quà tặng cho bạn" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 rounded-full bg-yellow-400 text-red-700 flex items-center justify-center text-3xl font-black shadow-xl group-hover:rotate-[360deg] transition-transform duration-700">
                  {step.n}
                </div>
                <h3 className="text-2xl font-bold text-white mt-4">{step.t}</h3>
                <p className="text-red-100/60">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <a
          href="https://zalo.me/g/ubarcp690"
          className="inline-block px-12 py-6 bg-white text-red-600 font-black text-2xl rounded-full shadow-2xl hover:bg-yellow-400 hover:text-red-700 transition-all uppercase"
        >
          Gia nhập cộng đồng ngay 🏮
        </a>
      </section>

      <Footer settings={{}} />
    </div>
  );
}

