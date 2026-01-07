"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoModal from "@/components/VideoModal";
import {
  TrendingUp,
  ArrowRight,
  Star,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Play,
  Sparkles,
  Gift,
  Timer,
  Bot,
  Zap,
  CheckCircle,
  Shield,
  Rocket,
  ChevronRight,
  ShoppingCart
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
    <div className="min-h-screen bg-[#0a0000]">
      <Header settings={{ site_phone: "0345 501 969" }} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        {/* Tet Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-10 left-[5%] text-6xl animate-bounce opacity-40 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ animationDuration: '4s' }}>🌸</div>
          <div className="absolute top-24 right-[8%] text-5xl animate-pulse opacity-40 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ animationDuration: '3s' }}>🌼</div>
          <div className="absolute top-40 left-1/4 text-7xl animate-bounce opacity-15" style={{ animationDuration: '5s' }}>🏮</div>
          <div className="absolute top-60 right-1/4 text-6xl animate-pulse opacity-15" style={{ animationDuration: '6s' }}>🏮</div>

          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.15)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-400 text-red-950 rounded-full text-xs font-black mb-10 uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(251,191,36,0.4)] border-2 border-white/40 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              #1 SÀN TRỢ LÝ AI TẠI VIỆT NAM - XUÂN BÍNH NGỌ 2026
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              SÀN TRỢ LÝ AI <br />
              <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">SIÊU THÔNG MINH</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-50 max-w-2xl mx-auto font-bold mb-8 drop-shadow-md">
              Khai xuân rạng rỡ với Trợ lý AI tối ưu cho doanh nghiệp.
              Giá cực lộc chỉ từ <span className="text-amber-400 bg-red-950/50 px-3 py-1 rounded-lg">29K/tháng</span>!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/dung-thu"
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400/10 text-amber-400 border-2 border-amber-400/40 font-black rounded-2xl hover:bg-amber-400 hover:text-red-950 transition-all uppercase tracking-widest text-sm shadow-lg hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                DÙNG THỬ MIỄN PHÍ
              </Link>
            </div>
          </div>

          <div className="bg-[#200000]/80 rounded-[3rem] p-8 md:p-12 border border-amber-400/20 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative">
            <div className="absolute top-0 left-10 -translate-y-1/2 bg-amber-400 text-red-950 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl border-2 border-white/50 rotate-[-1deg]">
              Lộc Xuân Tràn Đầy
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-yellow-400/10 gap-4">
              <h3 className="text-3xl md:text-4xl font-black text-white flex items-center gap-6 uppercase tracking-tighter">
                <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform border-2 border-white/20">
                  <Bot className="w-8 h-8 text-red-950" />
                </div>
                DANH SÁCH TRỢ LÝ AI
              </h3>
              <div className="bg-amber-400/10 text-amber-400 text-xs px-6 py-2.5 rounded-full border border-amber-400/30 font-black uppercase tracking-widest backdrop-blur-md">
                {allProducts.length} trợ lý chuyên nghiệp
              </div>
            </div>

            {allProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col p-6 bg-[#150000] rounded-[2rem] hover:bg-[#300000] transition-all group hover:scale-[1.03] border border-white/5 hover:border-amber-400/50 shadow-2xl relative overflow-hidden"
                  >
                    <Link href={`/san-pham/${product.slug}`} className="flex flex-col flex-1">
                      <div className="w-full aspect-video rounded-2xl bg-red-950/30 flex items-center justify-center mb-6 overflow-hidden relative shadow-inner border border-white/5">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="flex flex-col items-center text-red-50/20">
                            <Bot className="w-12 h-12 mb-2" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">AI Assistant</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-amber-400 text-xs font-black flex items-center gap-2 uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" />
                            Chi tiết trợ lý
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col pt-2">
                        <h4 className="font-black text-white group-hover:text-amber-400 transition-colors mb-4 line-clamp-2 text-xl uppercase tracking-tight leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-sm text-red-50/60 mb-8 line-clamp-3 flex-grow leading-relaxed font-medium">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-1">Giá khai xuân</span>
                            <span className="text-amber-400 font-black text-2xl drop-shadow-glow">{formatCurrency(product.price)}</span>
                          </div>
                          <div className="w-14 h-14 bg-amber-400 text-red-950 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-[0_10px_20px_rgba(251,191,36,0.3)] border-2 border-white/20">
                            <ArrowRight className="w-7 h-7" />
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

      {/* Gift Section */}
      <section className="py-24 bg-[#150000] border-y border-amber-400/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#400000] to-[#150000] rounded-[3rem] p-10 md:p-16 border border-amber-400/20 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 opacity-5 blur-[120px] group-hover:opacity-10 transition-opacity" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="w-32 h-32 shrink-0 rounded-[2.5rem] bg-amber-400 text-red-950 flex items-center justify-center shadow-[0_20px_40px_rgba(251,191,36,0.3)] border-4 border-white rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <Gift className="w-16 h-16" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
                    LỘC XUÂN <span className="text-amber-400">2.000.000Đ</span>
                  </h3>
                  <p className="text-red-50/70 mb-10 text-xl leading-relaxed font-medium">
                    Tham gia cộng đồng ngay để nhận Trợ lý AI miễn phí và bộ quà tặng trị giá 2 triệu đồng dành riêng cho khách hàng đăng ký đầu năm!
                  </p>
                  <Link
                    href="/qua-tang"
                    className="inline-flex items-center gap-4 px-12 py-6 bg-amber-400 text-red-950 font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase shadow-[0_20px_50px_-10px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 text-xl tracking-widest border-2 border-white/20"
                  >
                    NHẬN QUÀ NGAY 🧧
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0a0000] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-6 py-2 bg-amber-400/10 text-amber-400 rounded-full text-xs font-black mb-6 uppercase tracking-[0.2em] border border-amber-400/20">
              <Star className="w-4 h-4 fill-amber-400" />
              ĐÁNH GIÁ TỪ KHÁCH HÀNG
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase tracking-tighter">
              CHIA SỂ <span className="text-amber-400">ĐẦU XUÂN</span>
            </h2>
            <div className="h-1.5 w-24 bg-amber-400 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#150000] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-1.5 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  ))}
                </div>
                <p className="text-red-50/80 mb-10 italic leading-relaxed text-lg font-medium">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-amber-400 text-red-950 flex items-center justify-center font-black text-2xl shadow-xl border-2 border-white group-hover:scale-110 transition-transform">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-black text-white text-xl uppercase tracking-tight">{testimonial.name}</p>
                    <p className="text-[10px] text-amber-500/80 uppercase tracking-[0.2em] font-black">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-cta relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fbbf24 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-10 uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
            BẮT ĐẦU NĂM MỚI <br />
            <span className="text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">BỨT PHÁ DOANH SỐ</span>
          </h2>
          <p className="text-2xl md:text-3xl text-red-50/90 mb-16 max-w-4xl mx-auto font-bold leading-relaxed">
            Sở hữu Trợ lý AI chuyên biệt ngay hôm nay. Vận hành tự động, chốt đơn xuyên Tết!
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link href="/dat-hang" className="w-full sm:w-auto px-16 py-8 bg-amber-400 text-red-950 hover:bg-yellow-400 text-2xl font-black rounded-2xl shadow-[0_20px_60px_-10px_rgba(251,191,36,0.6)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border-2 border-white/30">
              MUA TRỢ LÝ AI NGAY
            </Link>
            <a href="tel:0345501969" className="w-full sm:w-auto px-12 py-7 bg-white/5 text-white border-2 border-white/20 hover:bg-white/10 text-xl font-black rounded-2xl transition-all uppercase tracking-widest backdrop-blur-md">
              HOTLINE: 0345 501 969
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
    </div >
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Bot className="w-10 h-10 text-primary-400 animate-spin" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}
