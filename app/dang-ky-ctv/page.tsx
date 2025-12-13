"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Users, DollarSign, TrendingUp, Gift, CheckCircle, ArrowRight, Loader2, Star, Zap } from "lucide-react";

export default function DangKyCTVPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    facebook: "",
    experience: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/ctv/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra khi đăng ký");
    setIsSubmitting(false);
        return;
      }

    setSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Hoa hồng hấp dẫn",
      desc: "Nhận 30-50% hoa hồng cho mỗi đơn hàng thành công",
    },
    {
      icon: TrendingUp,
      title: "Thu nhập không giới hạn",
      desc: "Càng bán nhiều, càng kiếm nhiều. Không giới hạn thu nhập",
    },
    {
      icon: Gift,
      title: "Quà tặng & thưởng",
      desc: "Thưởng nóng theo doanh số, quà tặng cho top seller",
    },
    {
      icon: Users,
      title: "Hỗ trợ tận tình",
      desc: "Được đào tạo bài bản, hỗ trợ marketing và bán hàng",
    },
  ];

  const levels = [
    {
      level: "CTV Thường",
      commission: "30%",
      requirement: "Từ 0 đơn",
      color: "slate",
    },
    {
      level: "CTV Bạc",
      commission: "35%",
      requirement: "Từ 10 đơn/tháng",
      color: "slate",
    },
    {
      level: "CTV Vàng",
      commission: "40%",
      requirement: "Từ 30 đơn/tháng",
      color: "primary",
    },
    {
      level: "Đại Lý",
      commission: "50%",
      requirement: "Từ 100 đơn/tháng",
      color: "primary",
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-bold uppercase tracking-wide mb-6 border border-primary-400/30">
            <DollarSign className="w-4 h-4" />
            KIẾM TIỀN KHÔNG GIỚI HẠN
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase">
            TRỞ THÀNH <span className="text-primary-400">CTV/ĐẠI LÝ</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Kiếm tiền không giới hạn từ con số 0. Chỉ cần điện thoại và internet, 
            bạn có thể tạo ra thu nhập thụ động hàng triệu đồng mỗi tháng!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 shadow-lg shadow-primary-400/30 text-lg uppercase"
            >
              <Zap className="w-6 h-6" />
              ĐĂNG KÝ NGAY
            </a>
            <a
              href="https://zalo.me/g/ubarcp690"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-primary-400 border-2 border-primary-400/50 font-bold rounded-xl hover:bg-primary-400/10 text-lg uppercase"
            >
              TƯ VẤN QUA ZALO
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">
              QUYỀN LỢI KHI THAM GIA
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-2xl p-6 border border-slate-700 hover:border-primary-400/50 transition-all text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-400/20 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Levels */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">
              CẤP BẬC & HOA HỒNG
            </h2>
            <p className="text-slate-400">Càng bán nhiều, hoa hồng càng cao</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level, index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 border transition-all ${
                  level.highlight
                    ? "bg-gradient-to-br from-primary-400/20 to-primary-600/10 border-primary-400/50"
                    : "bg-slate-800 border-slate-700 hover:border-primary-400/50"
                }`}
              >
                {level.highlight && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-400 text-slate-900 text-xs font-bold rounded-full mb-4">
                    <Star className="w-3 h-3" />
                    PHỔ BIẾN NHẤT
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{level.level}</h3>
                <div className="text-4xl font-bold text-primary-400 mb-2">{level.commission}</div>
                <p className="text-slate-400 text-sm">{level.requirement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white uppercase mb-8">
              THU NHẬP DỰ KIẾN
            </h2>
            <div className="bg-slate-700/50 rounded-2xl p-8 border border-slate-700">
              <p className="text-slate-400 mb-4">Giả sử bạn bán được 30 đơn/tháng (CTV Vàng - 40%)</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-600">
                  <span className="text-slate-400">Giá sản phẩm</span>
                  <span className="text-white font-bold">29.000đ</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-600">
                  <span className="text-slate-400">Số đơn/tháng</span>
                  <span className="text-white font-bold">30 đơn</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-600">
                  <span className="text-slate-400">Hoa hồng 40%</span>
                  <span className="text-white font-bold">11.600đ/đơn</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xl font-bold text-white">THU NHẬP/THÁNG</span>
                  <span className="text-3xl font-bold text-primary-400">348.000đ</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                * Chưa tính thưởng nóng và quà tặng cho top seller
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">
                ĐĂNG KÝ NGAY
              </h2>
              <p className="text-slate-400">Điền thông tin để trở thành CTV/Đại lý</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">ĐĂNG KÝ THÀNH CÔNG!</h3>
                  <p className="text-slate-400 mb-6">
                    Chúng tôi sẽ liên hệ với bạn trong vòng 24h để hướng dẫn chi tiết.
                  </p>
                  <a
                    href="https://zalo.me/g/ubarcp690"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium"
                  >
                    Tham gia nhóm Zalo CTV
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
                      Facebook/Zalo
                    </label>
                    <input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      className="input"
                      placeholder="Link Facebook hoặc số Zalo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Kinh nghiệm bán hàng
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="input"
                    >
                      <option value="">Chọn kinh nghiệm</option>
                      <option value="none">Chưa có kinh nghiệm</option>
                      <option value="beginner">Dưới 1 năm</option>
                      <option value="intermediate">1-3 năm</option>
                      <option value="expert">Trên 3 năm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Lý do muốn trở thành CTV
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="input resize-none"
                      rows={3}
                      placeholder="Chia sẻ lý do bạn muốn tham gia..."
                    />
                  </div>
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}
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
                        <Users className="w-5 h-5" />
                        ĐĂNG KÝ TRỞ THÀNH CTV
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}

