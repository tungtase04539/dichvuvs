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

  const stats = [
    { value: "10,000+", label: "Khách hàng tin dùng" },
    { value: "50M+", label: "Tin nhắn xử lý/tháng" },
    { value: "99.9%", label: "Uptime cam kết" },
    { value: "24/7", label: "Hỗ trợ kỹ thuật" },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn An",
      role: "CEO, BDS Leader",
      content: "Sàn trợ lý AI cung cấp các trợ lý được lập trình chuyên sâu cho ngành Bất động sản. Trợ lý này hiểu rõ các dự án và tư vấn cho khách hàng của tôi cực kỳ chuyên nghiệp.",
      avatar: "A",
    },
    {
      name: "Trần Thị Bình",
      role: "Founder, BeautyShop",
      content: "Tôi rất ấn tượng với Trợ lý AI ngành Thẩm mỹ. Nó không chỉ trả lời tin nhắn mà còn nắm rõ quy trình tư vấn làm đẹp, giúp khách hàng tin tưởng hơn rất nhiều.",
      avatar: "B",
    },
    {
      name: "Lê Minh Châu",
      role: "Giám đốc trung tâm Anh ngữ",
      content: "Sử dụng Trợ lý AI chuyên biệt cho ngành Giáo dục giúp trung tâm của tôi giải đáp thắc mắc của học viên ngay lập tức và chính xác 100%.",
      avatar: "C",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{ site_phone: "0345 501 969" }} />

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight">
              SÀN TRỢ LÝ AI <span className="text-primary-400">SIÊU THÔNG MINH VIP</span> <span className="text-white/80 text-2xl md:text-3xl block mt-2">( CHATBOT AI )</span>
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
                DANH SÁCH CÁC TRỢ LÝ AI
                <span className="bg-primary-400/10 text-primary-400 text-sm px-3 py-1 rounded-full border border-primary-400/20">
                  {allProducts.length} trợ lý chuyên biệt
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
                  NHẬN BÃO QUÀ TẶNG CỰC XỊN
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
      <section className="py-20 bg-slate-900">
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
              <div key={index} className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
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
            <a href="tel:0345501969" className="px-10 py-5 bg-transparent text-white border-2 border-white/40 hover:bg-white/10 text-lg font-black rounded-2xl transition-all uppercase">
              GỌI TƯ VẤN: 0345 501 969
            </a>
          </div>
        </div>
      </section>

      <Footer settings={{ site_phone: "0345 501 969" }} />

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
