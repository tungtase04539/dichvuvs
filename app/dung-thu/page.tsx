"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Clock, CheckCircle, ArrowRight, Zap, Shield, Bot, Loader2 } from "lucide-react";

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const features = [
    "Truy cập đầy đủ tính năng ChatBot AI",
    "Tích hợp Facebook, Zalo, Website",
    "Hỗ trợ kỹ thuật 24/7",
    "Không cần thẻ tín dụng",
    "Tự động hủy sau 3 ngày",
    "Dữ liệu được bảo mật",
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-bold uppercase tracking-wide mb-6 border border-primary-400/30">
                <Clock className="w-4 h-4" />
                MIỄN PHÍ 3 NGÀY
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase">
                TRẢI NGHIỆM <span className="text-primary-400">CHATBOT AI</span> MIỄN PHÍ
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Đăng ký ngay để dùng thử ChatBot AI trong 3 ngày hoàn toàn miễn phí. 
                Không cần thẻ tín dụng, không ràng buộc!
              </p>

              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-primary-400 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">ĐĂNG KÝ THÀNH CÔNG!</h3>
                  <p className="text-slate-400 mb-6">
                    Chúng tôi sẽ liên hệ với bạn trong vòng 24h để kích hoạt tài khoản dùng thử.
                  </p>
                  <a
                    href="https://zalo.me/g/ubarcp690"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium"
                  >
                    Tham gia nhóm Zalo để được hỗ trợ nhanh hơn
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6 uppercase text-center">
                    ĐĂNG KÝ DÙNG THỬ
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input"
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input"
                        placeholder="0912 345 678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Lĩnh vực kinh doanh
                      </label>
                      <select
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                        className="input"
                      >
                        <option value="">Chọn lĩnh vực</option>
                        <option value="shop">Shop online</option>
                        <option value="spa">Spa/Làm đẹp</option>
                        <option value="restaurant">Nhà hàng/Cafe</option>
                        <option value="education">Giáo dục</option>
                        <option value="healthcare">Y tế/Sức khỏe</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-full uppercase"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          ĐANG XỬ LÝ...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          ĐĂNG KÝ DÙNG THỬ NGAY
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
              TẠI SAO NÊN DÙNG THỬ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "Trải nghiệm thực tế",
                desc: "Dùng thử ChatBot với đầy đủ tính năng để đánh giá hiệu quả",
              },
              {
                icon: Shield,
                title: "Không rủi ro",
                desc: "Không cần thanh toán, tự động hủy sau 3 ngày nếu không muốn tiếp tục",
              },
              {
                icon: Zap,
                title: "Hỗ trợ tận tình",
                desc: "Đội ngũ kỹ thuật hướng dẫn cài đặt và sử dụng chi tiết",
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-8 bg-slate-700/50 rounded-2xl border border-slate-700">
                <div className="w-16 h-16 rounded-2xl bg-primary-400/20 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}

