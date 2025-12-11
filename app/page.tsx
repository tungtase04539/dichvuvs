"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import VideoModal from "@/components/VideoModal";
import {
  Bot,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Play,
  Sparkles,
  Award,
  HeadphonesIcon,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  icon: string | null;
  image: string | null;
  videoUrl: string | null;
  featured: boolean;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data } = await supabase
        .from("Service")
        .select("id, name, slug, description, price, icon, image, videoUrl, featured")
        .eq("active", true)
        .order("featured", { ascending: false })
        .limit(6);

      if (data) setProducts(data);
    };
    loadProducts();
  }, []);

  const openVideoModal = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.videoUrl) {
      setVideoModal({
        isOpen: true,
        url: product.videoUrl,
        title: `${product.name} - Video Demo`,
      });
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Cài đặt 5 phút",
      description: "Không cần code, cài đặt nhanh chóng với hướng dẫn chi tiết",
    },
    {
      icon: Clock,
      title: "Hoạt động 24/7",
      description: "ChatBot tự động trả lời mọi lúc, không bỏ lỡ khách hàng",
    },
    {
      icon: Shield,
      title: "Bảo mật cao",
      description: "Dữ liệu được mã hóa, bảo vệ thông tin khách hàng tuyệt đối",
    },
    {
      icon: TrendingUp,
      title: "Tăng doanh số",
      description: "Tỷ lệ chuyển đổi tăng 300% với tư vấn tự động thông minh",
    },
    {
      icon: Users,
      title: "Đa nền tảng",
      description: "Tích hợp Facebook, Zalo, Website chỉ với 1 ChatBot",
    },
    {
      icon: HeadphonesIcon,
      title: "Hỗ trợ tận tâm",
      description: "Đội ngũ kỹ thuật hỗ trợ 24/7, giải đáp mọi thắc mắc",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Khách hàng tin dùng" },
    { value: "50M+", label: "Tin nhắn xử lý/tháng" },
    { value: "99.9%", label: "Uptime cam kết" },
    { value: "24/7", label: "Hỗ trợ kỹ thuật" },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn An",
      role: "CEO, TechStore",
      content: "ChatBot giúp shop tôi tiết kiệm 80% thời gian trả lời tin nhắn. Doanh số tăng 40% sau 2 tháng sử dụng!",
      avatar: "A",
    },
    {
      name: "Trần Thị Bình",
      role: "Founder, BeautyShop",
      content: "Rất hài lòng với dịch vụ. ChatBot thông minh, hiểu khách hàng và tư vấn chính xác. Đội ngũ support rất nhiệt tình!",
      avatar: "B",
    },
    {
      name: "Lê Minh Châu",
      role: "Marketing Manager",
      content: "Giá cả phải chăng, hiệu quả cao. ChatBot giúp team tôi focus vào những việc quan trọng hơn.",
      avatar: "C",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{ site_phone: "0363 189 699" }} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-5" />

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                #1 ChatBot AI tại Việt Nam
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Tự động hóa
                <span className="block text-accent-300">Chăm sóc khách hàng</span>
                với AI ChatBot
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Tăng doanh số, tiết kiệm thời gian với ChatBot AI thông minh. 
                Chỉ từ <span className="text-primary-400 font-bold">29K/chatbot AI/tháng</span> - Cài đặt trong 5 phút!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/dat-hang"
                  className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 text-lg font-bold uppercase shadow-lg shadow-primary-400/30"
                >
                  MUA NGAY
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/san-pham"
                  className="btn bg-transparent text-primary-400 border-2 border-primary-400/50 hover:bg-primary-400/10 text-lg font-bold uppercase"
                >
                  XEM SẢN PHẨM
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {["A", "B", "C", "D", "E"].map((letter, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-slate-900 font-semibold text-sm border-2 border-slate-800"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary-400 fill-primary-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">10,000+ khách hàng tin dùng</p>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <div className="w-full max-w-md mx-auto bg-slate-800 rounded-3xl shadow-2xl p-6 animate-float border border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-400/20 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">ChatBot AI</p>
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Đang hoạt động
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-700 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                      <p className="text-sm text-slate-200">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                    </div>
                    <div className="bg-primary-400 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto">
                      <p className="text-sm text-slate-900 font-medium">Tôi muốn mua ChatBot cho shop online</p>
                    </div>
                    <div className="bg-slate-700 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                      <p className="text-sm text-slate-200">Tuyệt vời! Chúng tôi có nhiều gói ChatBot phù hợp với shop online. Bạn muốn tư vấn gói nào?</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-10 -right-10 w-20 h-20 bg-primary-400 rounded-2xl rotate-12 opacity-80" />
              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-primary-500 rounded-xl -rotate-12" />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#1e293b"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-800 relative -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6">
                <p className="text-3xl md:text-4xl font-bold text-primary-400 mb-1">{stat.value}</p>
                <p className="text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tinh-nang" className="section bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
              <Zap className="w-4 h-4" />
              TÍNH NĂNG NỔI BẬT
            </span>
            <h2 className="section-title">
              TẠI SAO CHỌN <span className="text-primary-400">CHATBOT VN</span>?
            </h2>
            <p className="section-subtitle">
              Giải pháp ChatBot AI toàn diện, giúp doanh nghiệp tự động hóa và tăng trưởng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover p-8 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-400/20 flex items-center justify-center mb-6 group-hover:bg-primary-400 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="san-pham" className="section bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
              <Bot className="w-4 h-4" />
              SẢN PHẨM
            </span>
            <h2 className="section-title">
              CHATBOT <span className="text-primary-400">PHÙ HỢP</span> VỚI BẠN
            </h2>
            <p className="section-subtitle">
              Đa dạng loại ChatBot cho mọi ngành nghề, mọi quy mô kinh doanh
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="card-hover p-0 overflow-hidden flex flex-col h-full relative"
              >
                {product.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-400 to-primary-500 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      HOT
                    </span>
                  </div>
                )}

                {/* Product Image - Clickable */}
                <Link href={`/san-pham/${product.slug}`} className="group">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">{product.icon || "🤖"}</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <Link href={`/san-pham/${product.slug}`} className="group">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>

                  {/* Bottom Section - Always at bottom */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div>
                        <span className="text-2xl font-bold text-primary-400">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <Link 
                        href={`/san-pham/${product.slug}`}
                        className="w-10 h-10 rounded-full bg-primary-400/20 flex items-center justify-center hover:bg-primary-400 transition-colors group"
                      >
                        <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-slate-900 transition-colors" />
                      </Link>
                    </div>

                    {/* Video Demo Button */}
                    {product.videoUrl && (
                      <button
                        onClick={(e) => openVideoModal(e, product)}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-slate-900 font-bold rounded-xl hover:from-primary-300 hover:to-primary-400 transition-all shadow-md hover:shadow-lg"
                      >
                        <Play className="w-4 h-4" />
                        XEM VIDEO DEMO
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/san-pham" className="btn btn-primary uppercase">
              XEM TẤT CẢ SẢN PHẨM
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
              <Star className="w-4 h-4" />
              ĐÁNH GIÁ
            </span>
            <h2 className="section-title">
              KHÁCH HÀNG <span className="text-primary-400">NÓI GÌ</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary-400 fill-primary-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-cta relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 uppercase">
              Sẵn sàng tự động hóa kinh doanh?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Bắt đầu ngay hôm nay với ChatBot AI. Chỉ từ <span className="text-primary-400 font-bold">29K/tháng</span>!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dat-hang" className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 text-lg font-bold uppercase shadow-lg shadow-primary-400/30">
                MUA CHATBOT NGAY
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="tel:0363189699" className="btn bg-transparent text-primary-400 border-2 border-primary-400/50 hover:bg-primary-400/10 text-lg font-bold uppercase">
                <Phone className="w-5 h-5" />
                GỌI TƯ VẤN: 0363 189 699
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="lien-he" className="section bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
                <MessageSquare className="w-4 h-4" />
                LIÊN HỆ
              </span>
              <h2 className="section-title mb-6">
                CHÚNG TÔI SẴN SÀNG <span className="text-primary-400">HỖ TRỢ</span> BẠN
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Có câu hỏi? Đội ngũ của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 24/7.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-400/20 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">HOTLINE/ZALO</p>
                    <a href="tel:0363189699" className="text-xl font-semibold text-white hover:text-primary-400">
                      0363 189 699 – 0345 501 969
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-400/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">EMAIL</p>
                    <a href="mailto:support@chatbotvn.com" className="text-xl font-semibold text-white hover:text-primary-400">
                      support@chatbotvn.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-400/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">ĐỊA CHỈ</p>
                    <p className="text-xl font-semibold text-white">
                      RUBY CT1-2-3 PHÚC LỢI – HÀ NỘI
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-400/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">GROUP ZALO HỖ TRỢ</p>
                    <a href="https://zalo.me/g/ubarcp690" target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-white hover:text-primary-400">
                      Tham gia nhóm Zalo
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-2xl font-bold text-white mb-6 uppercase">Gửi tin nhắn</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Họ tên</label>
                    <input type="text" className="input" placeholder="Nhập họ tên" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại</label>
                    <input type="tel" className="input" placeholder="0912 345 678" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input type="email" className="input" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung</label>
                  <textarea rows={4} className="input resize-none" placeholder="Nhập nội dung tin nhắn..." />
                </div>
                <button type="submit" className="btn btn-primary w-full uppercase">
                  GỬI TIN NHẮN
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={{ site_phone: "0363 189 699 – 0345 501 969" }} />
      <ChatWidget />

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
        youtubeUrl={videoModal.url}
        title={videoModal.title}
      />
    </div>
  );
}
