"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Gift, Users, MessageCircle, Star, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

export default function QuaTangPage() {
  const gifts = [
    {
      icon: "🎁",
      title: "ChatBot AI Miễn Phí",
      description: "Nhận 1 ChatBot AI hoàn toàn miễn phí khi tham gia nhóm Zalo",
      highlight: true,
    },
    {
      icon: "📚",
      title: "Tài Liệu Hướng Dẫn",
      description: "Bộ tài liệu hướng dẫn cài đặt và sử dụng ChatBot chi tiết",
    },
    {
      icon: "🎥",
      title: "Video Training",
      description: "Khóa học video hướng dẫn tối ưu ChatBot cho kinh doanh",
    },
    {
      icon: "💬",
      title: "Hỗ Trợ 24/7",
      description: "Được hỗ trợ trực tiếp từ đội ngũ chuyên gia trong nhóm",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-400/20 mb-6 border border-primary-400/30">
            <Gift className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase">
            NHẬN QUÀ <span className="text-primary-400">MIỄN PHÍ</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Tham gia nhóm Zalo ngay để nhận ChatBot AI miễn phí và nhiều quà tặng hấp dẫn khác!
          </p>
          
          <a
            href="https://zalo.me/g/ubarcp690"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 shadow-lg shadow-primary-400/30 text-lg uppercase transition-all hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
            THAM GIA NHÓM ZALO NGAY
            <ArrowRight className="w-6 h-6" />
          </a>

          <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
            <Users className="w-5 h-5" />
            <span>1,000+ thành viên đã tham gia</span>
          </div>
        </div>
      </section>

      {/* Gifts Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-bold uppercase tracking-wide mb-4">
              <Sparkles className="w-4 h-4" />
              QUÀ TẶNG ĐẶC BIỆT
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
              BẠN SẼ NHẬN ĐƯỢC GÌ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gifts.map((gift, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                  gift.highlight
                    ? "bg-gradient-to-br from-primary-400/20 to-primary-600/20 border-primary-400/50"
                    : "bg-slate-700/50 border-slate-700 hover:border-primary-400/50"
                }`}
              >
                <span className="text-5xl mb-4 block">{gift.icon}</span>
                <h3 className="text-xl font-bold text-white mb-2">{gift.title}</h3>
                <p className="text-slate-400">{gift.description}</p>
                {gift.highlight && (
                  <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 bg-primary-400 text-slate-900 text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" />
                    HOT
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">
              CÁCH NHẬN QUÀ
            </h2>
            <p className="text-slate-400">Chỉ 3 bước đơn giản</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              { step: 1, title: "Tham gia nhóm Zalo", desc: "Click vào nút bên dưới để vào nhóm" },
              { step: 2, title: "Giới thiệu bản thân", desc: "Chào hỏi và cho biết bạn đến từ đâu" },
              { step: 3, title: "Nhận quà ngay", desc: "Admin sẽ gửi quà tặng trong vòng 24h" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-6 mb-8 last:mb-0">
                <div className="w-14 h-14 rounded-2xl bg-primary-400 flex items-center justify-center text-slate-900 font-bold text-xl shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://zalo.me/g/ubarcp690"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 shadow-lg shadow-primary-400/30 text-lg uppercase transition-all"
            >
              <Gift className="w-6 h-6" />
              NHẬN QUÀ NGAY
            </a>
          </div>
        </div>
      </section>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}

