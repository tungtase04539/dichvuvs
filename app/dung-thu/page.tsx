"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, CheckCircle, ArrowRight, Zap, Shield, Bot, Loader2, Sparkles, MessageCircle } from "lucide-react";

export default function DungThuPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    business: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const features = [
    "Trải nghiệm Full tính năng AI",
    "Tích hợp Đa kênh Facebook/Zalo",
    "Setup kịch bản theo yêu cầu",
    "Không tốn phí - Không cần thẻ",
    "Hỗ trợ cài đặt từ chuyên gia",
    "Bảo mật dữ liệu tuyệt đối",
  ];

  return (
    <div className="min-h-screen bg-[#f59e0b] text-slate-900 overflow-x-hidden font-sans">
      <Header settings={{}} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-20 left-10 w-32 h-32 opacity-10 animate-pulse" />
          <Sparkles className="absolute bottom-20 right-10 w-48 h-48 opacity-10 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/20 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-yellow-400 rounded-full text-sm font-black uppercase tracking-[0.2em] mb-8 shadow-xl">
                <Zap className="w-5 h-5 fill-current" />
                CƠ HỘI DUY NHẤT 0Đ
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] uppercase">
                TRẢI NGHIỆM <br />
                <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">MIỄN PHÍ</span> <br />
                CHATBOT CHUYÊN GIA
              </h1>

              <p className="text-xl md:text-2xl text-slate-800/80 mb-10 max-w-xl font-semibold leading-relaxed">
                Đừng bỏ lỡ cơ hội bứt phá doanh thu. Đăng ký ngay để nhận 3 ngày dùng thử ChatBot AI đỉnh cao hoàn toàn không mất phí!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-slate-900 font-bold group">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Registration Card */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/30 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all" />
              <div className="relative bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white/50">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8 animate-bounce">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 uppercase">ĐĂNG KÝ THÀNH CÔNG!</h3>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                      Chuyên gia của chúng tôi sẽ liên hệ với bạn trong vòng 24h để bàn giao ChatBot.
                    </p>
                    <a
                      href="https://zalo.me/g/ubarcp690"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-slate-900 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl uppercase tracking-wider"
                    >
                      <MessageCircle className="w-6 h-6" />
                      NHẬN HỖ TRỢ QUA ZALO
                    </a>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase text-center tracking-widest">
                      Form Đăng Ký 0đ
                      <div className="h-1.5 w-20 bg-yellow-400 mx-auto mt-2 rounded-full" />
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-black text-slate-500 ml-2 uppercase tracking-tighter">Họ và tên *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold text-lg"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-black text-slate-500 ml-2 uppercase tracking-tighter">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold text-lg"
                          placeholder="0912 345 678"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-black text-slate-500 ml-2 uppercase tracking-tighter">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold text-lg"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-[1.5rem] hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-xl flex items-center justify-center gap-4 uppercase active:scale-95"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-7 h-7 animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-6 h-6" />
                              Bắt đầu dùng thử ngay
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-center text-xs text-slate-400 font-medium">Bảo mật thông tin khách hàng 100%</p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-around gap-12 text-center md:text-left">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-yellow-100 flex items-center justify-center">
                <Shield className="w-10 h-10 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">An Toàn Tuyệt Đối</h4>
                <p className="text-slate-500 font-medium font-semibold">Tự động hủy sau 3 ngày dùng thử</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">Full Tính Năng</h4>
                <p className="text-slate-500 font-medium font-semibold">Công nghệ AI tiên tiến hàng đầu</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">Setup Trong 24h</h4>
                <p className="text-slate-500 font-medium font-semibold">Liên hệ nhanh chóng qua Zalo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={{}} />
    </div>
  );
}

