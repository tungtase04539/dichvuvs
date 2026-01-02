"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoModal from "@/components/VideoModal";
import {
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Play,
  Sparkles,
  HeadphonesIcon,
  Gift,
  Flame,
  Timer,
  Bot,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  videoUrl: string | null;
  featured: boolean;
  categoryId: string | null;
  category: Category | null;
}

function HomePageContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    url: "",
    title: "",
  });

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        let url = `/api/products?_=${Date.now()}`;

        console.log("Loading products from:", url);

        const res = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!res.ok) {
          console.error("Fetch failed:", res.status, res.statusText);
          setAllProducts([]);
          return;
        }

        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        } else {
          setAllProducts([]);
        }
      } catch (error) {
        console.error("Load products error:", error);
        setAllProducts([]);
      }
    };

    loadProducts();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadProducts();
    }, 10000);

    return () => clearInterval(interval);
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
      content: "Sàn trợ lý AI giúp shop tôi tiết kiệm 80% thời gian trả lời tin nhắn. Doanh số tăng 40% sau 2 tháng sử dụng!",
      avatar: "A",
    },
    {
      name: "Trần Thị Bình",
      role: "Founder, BeautyShop",
      content: "Rất hài lòng với dịch vụ. Trợ lý AI thông minh, hiểu khách hàng và tư vấn chính xác. Đội ngũ support rất nhiệt tình!",
      avatar: "B",
    },
    {
      name: "Lê Minh Châu",
      role: "Marketing Manager",
      content: "Giá cả phải chăng, hiệu quả cao. Sàn trợ lý AI giúp team tôi focus vào những việc quan trọng hơn.",
      avatar: "C",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{ site_phone: "0363 189 699" }} />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-6 uppercase tracking-wide border border-primary-400/30">
              <Sparkles className="w-4 h-4" />
              #1 SÀN TRỢ LÝ AI TẠI VIỆT NAM
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase">
              DANH SÁCH <span className="text-primary-400">TRỢ LÝ AI</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Sở hữu ngay Trợ lý AI tối ưu cho ngành nghề của bạn.
              Chỉ từ <span className="text-primary-400 font-bold">29K/tháng</span>!
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary-400" />
                Tất cả Trợ lý AI
                <span className="bg-primary-400/10 text-primary-400 text-sm px-3 py-1 rounded-full border border-primary-400/20">
                  {allProducts.length} sản phẩm
                </span>
              </h3>
            </div>

            {allProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-all group hover:scale-[1.02] border border-slate-700/50 hover:border-primary-400/50 shadow-lg"
                  >
                    <Link href={`/san-pham/${product.slug}`} className="flex flex-col flex-1">
                      <div className="w-full aspect-video rounded-xl bg-slate-600 flex items-center justify-center mb-4 overflow-hidden relative shadow-inner">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <Bot className="w-12 h-12 mb-2 opacity-20" />
                            <span className="text-xs uppercase font-bold tracking-widest opacity-40">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-xs font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary-400" />
                            Click để xem chi tiết
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors mb-2 line-clamp-2 text-lg">
                          {product.name}
                        </h4>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-grow leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Chỉ từ</span>
                            <span className="text-primary-400 font-black text-xl">{formatCurrency(product.price)}</span>
                          </div>
                          <div className="p-2 bg-primary-400 text-slate-900 rounded-lg group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-slate-700">
                <Bot className="w-16 h-16 text-slate-700 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-400 text-lg">Hiện đang cập nhật thêm các Trợ lý AI mới...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-16 bg-gradient-to-r from-red-900 via-slate-900 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-bold uppercase tracking-wide mb-4 border border-red-500/30">
                <Flame className="w-4 h-4" />
                FLASH SALE - GIẢM SỐC
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                GIẢM ĐẾN <span className="text-red-500">50%</span> TẤT CẢ TRỢ LÝ AI
              </h2>
              <p className="text-slate-300 text-lg">
                Mua ngay kẻo lỡ! Ưu đãi có hạn + Quà tặng hấp dẫn
              </p>
            </div>
            <Link
              href="/flash-sale"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 text-lg uppercase transition-all hover:scale-105 active:scale-95"
            >
              <Flame className="w-5 h-5" />
              XEM FLASH SALE
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tinh-nang" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
              <Zap className="w-4 h-4" />
              TÍNH NĂNG NỔI BẬT
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 uppercase">
              TẠI SAO CHỌN <span className="text-primary-400">SÀN TRỢ LÝ AI</span>?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Giải pháp Trợ lý AI toàn diện, giúp doanh nghiệp tự động hóa và tăng trưởng vượt trội
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 hover:border-primary-400/50 transition-all hover:translate-y-[-5px] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-400/10 flex items-center justify-center mb-6 group-hover:bg-primary-400 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
              <Star className="w-4 h-4" />
              ĐÁNH GIÁ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 uppercase">
              KHÁCH HÀNG <span className="text-primary-400">NÓI GÌ</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-900 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary-400 fill-primary-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-8 italic leading-relaxed text-lg">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-400/20 flex items-center justify-center text-primary-400 font-black text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Sẵn sàng tự động hóa kinh doanh?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Bắt đầu ngay hôm nay với Sàn trợ lý AI. Chỉ từ <span className="text-white font-black underline decoration-white/30 underline-offset-8">29K/tháng</span>!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dat-hang" className="px-10 py-5 bg-white text-primary-600 hover:bg-primary-50 text-lg font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase">
              MUA TRỢ LÝ AI NGAY
            </Link>
            <a href="tel:0363189699" className="px-10 py-5 bg-transparent text-white border-2 border-white/40 hover:bg-white/10 text-lg font-black rounded-2xl transition-all uppercase">
              GỌI TƯ VẤN: 0363 189 699
            </a>
          </div>
        </div>
      </section>

      <Footer settings={{ site_phone: "0363 189 699" }} />

      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
        youtubeUrl={videoModal.url}
        title={videoModal.title}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Bot className="w-10 h-10 text-primary-400 animate-spin" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}
