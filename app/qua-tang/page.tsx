import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gift, Users, MessageCircle, Star, ArrowRight, CheckCircle, Sparkles, Bot, Zap, Crown, Award } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function QuaTangPage() {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [globalSettings, setGlobalSettings] = useState<Record<string, string>>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings) setGlobalSettings(data.settings);
      } catch (error) {
        console.error("Fetch settings error:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const gifts = [
    {
      logo: "/gifts/capcut.png",
      title: "Capcut Pro",
      duration: "1 THÁNG",
      description: "Mở khóa toàn bộ tính năng và hiệu ứng cao cấp nhất của Capcut.",
      conditions: [
        "Tài khoản sử dụng trong 30 ngày",
        "Đăng nhập tối đa 1 thiết bị",
        "Không thay đổi thông tin tài khoản",
        "Bảo hành trọn đời thời gian sử dụng"
      ]
    },
    {
      logo: "https://img.icons8.com/fluency/512/chatgpt.png",
      title: "ChatGPT Plus",
      duration: "1 THÁNG / 1 NĂM",
      description: "Trải nghiệm mô hình 5.2 mới nhất với tốc độ phản hồi cực nhanh.",
      conditions: [
        "Sử dụng mô hình 5.2 không giới hạn",
        "Hỗ trợ cài đặt trên App Mobile",
        "Bảo hành lỗi 1 đổi 1 nhanh chóng",
        "Tặng kèm bộ Prompt chuyên sâu"
      ]
    },
    {
      logo: "/gifts/google.png",
      title: "Google Ultra",
      duration: "45K CREDIT",
      description: "Sử dụng veo3 và các tính năng AI đỉnh cao của Google.",
      conditions: [
        "Nạp trực tiếp vào tài khoản cá nhân",
        "Hạn dùng Credit trong 12 tháng",
        "Sử dụng full tính năng Google Gemini Ultra",
        "Hỗ trợ xử lý lỗi kỹ thuật 24/7"
      ]
    },
    {
      logo: "https://img.icons8.com/color/512/canva.png",
      title: "Canva Pro Edu",
      duration: "1 NĂM",
      description: "Thiết kế không giới hạn với kho tài nguyên Pro khổng lồ.",
      conditions: [
        "Tính năng Canva Pro đầy đủ",
        "Sử dụng trên mọi thiết bị",
        "Thời hạn sử dụng cam kết 1 năm",
        "Join vào Group Design độc quyền"
      ]
    },
  ];

  const priceGold = globalSettings.price_gold ? parseFloat(globalSettings.price_gold) : 199000;
  const pricePlatinum = globalSettings.price_platinum ? parseFloat(globalSettings.price_platinum) : 499000;
  const priceStandard = globalSettings.price_standard ? parseFloat(globalSettings.price_standard) : 29000;

  const featuresGoldStr = globalSettings.features_gold || "Hỗ trợ ưu tiên\nUpdate 24/7\nTùy chỉnh chuyên sâu";
  const featuresPlatinumStr = globalSettings.features_platinum || "Toàn bộ tính năng Premium\nBảo hành trọn đời\nHỗ trợ 1-1";
  const featuresStandardStr = globalSettings.features_standard || "Sử dụng vĩnh viễn\nHỗ trợ cộng đồng\nUpdate bảo mật định kỳ";

  const packages = [
    {
      id: "standard",
      name: "TIÊU CHUẨN",
      price: priceStandard,
      features: featuresStandardStr.split("\n").filter(f => f.trim()),
      cta: "CHỌN TRỢ LÝ AI",
      link: "/san-pham",
      icon: <Zap className="w-8 h-8 text-slate-400" />
    },
    {
      id: "gold",
      name: "VÀNG (GOLD)",
      price: priceGold,
      features: featuresGoldStr.split("\n").filter(f => f.trim()),
      cta: "MUA NGAY",
      link: "/dat-hang",
      popular: true,
      icon: <Crown className="w-8 h-8 text-yellow-500" />
    },
    {
      id: "platinum",
      name: "BẠCH KIM (PLATINUM)",
      price: pricePlatinum,
      features: featuresPlatinumStr.split("\n").filter(f => f.trim()),
      cta: "MUA NGAY",
      link: "/dat-hang",
      icon: <Award className="w-8 h-8 text-cyan-400" />
    }
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
                className={`relative min-h-[480px] preserve-3d transition-all duration-700 cursor-pointer ${flippedCards[index] ? 'flipped' : ''}`}
                onClick={() => setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }))}
              >
                {/* Front Face */}
                <div className="absolute inset-0 backface-hidden group p-10 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center text-center overflow-hidden bg-[#2a0101]/60 border-yellow-400/20 hover:border-yellow-400/60 shadow-[0_10px_40px_-15px_rgba(250,204,21,0.1)]">
                  <div className="w-24 h-24 mb-8 transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center bg-white rounded-3xl p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] border-2 border-yellow-400/20 group-hover:border-yellow-400">
                    <img src={gift.logo} alt={gift.title} className="w-full h-full object-contain" />
                  </div>
                  {gift.duration && (
                    <div className="text-[10px] font-black tracking-widest uppercase mb-2 text-yellow-400/60">
                      {gift.duration}
                    </div>
                  )}
                  <h3 className="text-2xl font-black mb-4 uppercase leading-tight text-white group-hover:text-yellow-400 transition-colors">
                    {gift.title}
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-red-100/60 mb-8">
                    {gift.description}
                  </p>
                  <div className="mt-auto">
                    <button className="px-6 py-3 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black rounded-xl hover:bg-yellow-400 hover:text-red-950 transition-all uppercase tracking-widest flex items-center gap-2">
                      Xem điều kiện
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 p-10 rounded-[2.5rem] border-2 border-yellow-400 bg-[#3a0101] shadow-[0_0_60px_rgba(250,204,21,0.2)] flex flex-col items-center text-center">
                  <h4 className="text-yellow-400 font-black text-xs uppercase tracking-[0.2em] mb-8 border-b border-yellow-400/20 pb-4 w-full">
                    ĐIỀU KIỆN NHẬN QUÀ
                  </h4>
                  <div className="space-y-4 w-full">
                    {gift.conditions.map((condition, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-red-50/90 text-left">
                        <CheckCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="font-medium leading-tight">{condition}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <button className="text-xs text-yellow-400/60 font-black uppercase tracking-widest hover:text-yellow-400 transition-colors">
                      🠔 Quay lại
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#2a0101]/40 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              GÓI DỊCH VỤ <span className="text-yellow-400">TRỢ LÝ AI</span>
            </h2>
            <p className="text-red-100/60 mt-4 font-medium uppercase tracking-widest text-sm md:text-base">Nâng tầm hiệu quả công việc với các đặc quyền VIP</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col ${pkg.popular
                    ? "bg-[#250000] border-yellow-400 shadow-[0_20px_50px_rgba(250,204,21,0.2)]"
                    : "bg-[#100000] border-white/5 hover:border-yellow-400/30"
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-950 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl whitespace-nowrap z-20">
                    Phổ biến nhất
                  </div>
                )}

                <div className="mb-8 flex items-center justify-between">
                  <div className={`p-4 rounded-2xl ${pkg.popular ? "bg-yellow-400/10" : "bg-white/5"}`}>
                    {pkg.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-red-200/40 uppercase tracking-widest mb-1">{pkg.name}</div>
                    <div className="text-3xl font-black text-yellow-400">
                      {formatCurrency(pkg.price)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-red-50/80">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${pkg.popular ? "text-yellow-400" : "text-yellow-400/40"}`} />
                      <span className="font-medium leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={pkg.link}
                  className={`block w-full py-5 rounded-2xl text-center font-black uppercase tracking-widest transition-all ${pkg.popular
                      ? "bg-yellow-400 text-red-950 hover:bg-yellow-300 shadow-lg shadow-yellow-400/20"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    }`}
                >
                  {pkg.cta}
                </Link>
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

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
          perspective: 1200px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .flipped {
          transform: rotateY(180deg);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
