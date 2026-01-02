"use client";

import { useState, useEffect } from "react";
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

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    url: "",
    title: "",
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Load categories error:", error);
      }
    };
    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Build URL đúng cách
        let url = "/api/products";
        if (selectedCategory && selectedCategory !== "all") {
          url = `/api/products?category=${encodeURIComponent(selectedCategory)}`;
        }
        // Thêm timestamp để tránh cache
        url += url.includes("?") ? `&_=${Date.now()}` : `?_=${Date.now()}`;

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
        console.log("Loaded products for category:", selectedCategory, "count:", data.products?.length || 0);

        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        } else {
          console.warn("Invalid products data:", data);
          setAllProducts([]);
        }
      } catch (error) {
        console.error("Load products error:", error);
        setAllProducts([]);
      }
    };

    // Load immediately
    loadProducts();

    // Auto-refresh every 3 seconds (nhanh hơn)
    const interval = setInterval(() => {
      loadProducts();
    }, 3000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };

    // Refresh when window gets focus
    const handleFocus = () => {
      loadProducts();
    };

    // Listen to storage events (khi có thay đổi từ tab khác)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'products-updated') {
        loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedCategory]);

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

      {/* Category Filter Section - Main Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-semibold mb-6 uppercase tracking-wide border border-primary-400/30">
              <Sparkles className="w-4 h-4" />
              #1 SÀN TRỢ LÝ AI TẠI VIỆT NAM
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              CHỌN <span className="text-primary-400">LĨNH VỰC</span> CỦA BẠN
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Chọn lĩnh vực phù hợp để tìm Trợ lý AI tối ưu cho ngành nghề của bạn.
              Chỉ từ <span className="text-primary-400 font-bold">29K/tháng</span>!
            </p>
          </div>

          {/* Category Grid - Compact */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-5xl mx-auto">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === "all"
                ? "bg-primary-400 text-slate-900 shadow-lg shadow-primary-400/40"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-primary-400/50"
                }`}
            >
              <span className="text-lg">🌟</span>
              <span>Tất cả</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category.slug
                  ? "bg-primary-400 text-slate-900 shadow-lg shadow-primary-400/40"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-primary-400/50"
                  }`}
              >
                <span className="text-lg">{category.icon || "📦"}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Products Grid - Full Display */}
          <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {selectedCategory === "all" ? "Tất cả Trợ lý AI" : (
                  <>Kết quả: <span className="text-primary-400">{allProducts.length}</span> Trợ lý AI</>
                )}
              </h3>
              {allProducts.length > 6 && (
                <Link
                  href={selectedCategory === "all" ? "/san-pham" : `/san-pham?category=${selectedCategory}`}
                  className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {allProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all group hover:scale-[1.02] border border-slate-600/50 hover:border-primary-400/50"
                  >
                    <Link href={`/san-pham/${product.slug}`} className="flex flex-col flex-1">
                      <div className="w-full aspect-video rounded-lg bg-slate-600 flex items-center justify-center mb-3 overflow-hidden relative">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-4xl">🤖</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-400 mb-2 line-clamp-2 flex-grow">{product.description}</p>
                        {product.category && (
                          <span className="inline-block text-xs px-2 py-1 bg-primary-400/20 text-primary-400 rounded mb-2 w-fit">
                            {product.category.name}
                          </span>
                        )}
                        <p className="text-primary-400 font-bold text-lg mt-auto">{formatCurrency(product.price)}</p>
                      </div>
                    </Link>
                    {/* Video Demo Button */}
                    {product.videoUrl && (
                      <button
                        onClick={(e) => openVideoModal(e, product)}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-slate-900 font-bold rounded-lg hover:from-primary-300 hover:to-primary-400 transition-all shadow-md hover:shadow-lg text-sm"
                      >
                        <Play className="w-4 h-4" />
                        XEM VIDEO DEMO
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Chưa có Trợ lý AI nào trong lĩnh vực này</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-2xl md:text-3xl font-bold text-primary-400 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-16 bg-gradient-to-r from-red-900 via-slate-900 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-bold uppercase tracking-wide mb-4 border border-red-500/30 animate-pulse">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/flash-sale"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 text-lg uppercase transition-all hover:scale-105"
              >
                <Flame className="w-5 h-5" />
                XEM FLASH SALE
              </Link>
            </div>
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
              TẠI SAO CHỌN <span className="text-primary-400">SÀN TRỢ LÝ AI</span>?
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

      {/* Gift & Free Trial Section */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quà tặng */}
            <div className="bg-gradient-to-br from-primary-400/20 to-primary-600/10 rounded-3xl p-8 border border-primary-400/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary-400/20 flex items-center justify-center mb-6">
                  <Gift className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 uppercase">NHẬN QUÀ MIỄN PHÍ</h3>
                <p className="text-slate-300 mb-6">
                  Tham gia nhóm Zalo ngay để nhận Trợ lý AI miễn phí và nhiều quà tặng hấp dẫn!
                </p>
                <Link
                  href="/qua-tang"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 transition-all uppercase"
                >
                  <Gift className="w-5 h-5" />
                  NHẬN QUÀ NGAY
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Dùng thử */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 rounded-3xl p-8 border border-green-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6">
                  <Timer className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 uppercase">DÙNG THỬ 3 NGÀY</h3>
                <p className="text-slate-300 mb-6">
                  Trải nghiệm Trợ lý AI hoàn toàn miễn phí trong 3 ngày. Không cần thẻ tín dụng!
                </p>
                <Link
                  href="/dung-thu"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-all uppercase"
                >
                  <Zap className="w-5 h-5" />
                  ĐĂNG KÝ DÙNG THỬ
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
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

          <div className="text-center mt-12">
            <Link href="/danh-gia" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-bold uppercase transition-colors">
              XEM TẤT CẢ ĐÁNH GIÁ
              <ArrowRight className="w-5 h-5" />
            </Link>
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
              Bắt đầu ngay hôm nay với Sàn trợ lý AI. Chỉ từ <span className="text-primary-400 font-bold">29K/tháng</span>!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dat-hang" className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 text-lg font-bold uppercase shadow-lg shadow-primary-400/30">
                MUA TRỢ LÝ AI NGAY
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
