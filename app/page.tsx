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
    <div className="min-h-screen bg-[#1a0101]">
      <Header settings={{ site_phone: "0345 501 969" }} />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-[#4a0404] via-[#2a0101] to-[#1a0101] relative overflow-hidden">
        {/* Tet Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-30" style={{ animationDuration: '4s' }}>🌸</div>
          <div className="absolute top-24 right-20 text-3xl animate-pulse opacity-30" style={{ animationDuration: '3s' }}>🌼</div>
          <div className="absolute top-40 left-1/4 text-5xl animate-bounce opacity-10" style={{ animationDuration: '5s' }}>🏮</div>
          <div className="absolute top-60 right-1/4 text-4xl animate-pulse opacity-10" style={{ animationDuration: '6s' }}>🏮</div>

          <div className="absolute top-20 left-10 w-72 h-72 bg-red-600 rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-[120px] opacity-10" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-bold mb-6 uppercase tracking-widest border border-yellow-400/30 backdrop-blur-md shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              #1 SÀN TRỢ LÝ AI TẠI VIỆT NAM - XUÂN BÍNH NGỌ 2026
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
              SÀN TRỢ LÝ AI <span className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">SIÊU THÔNG MINH</span> <br />
              <span className="text-white/80 text-2xl md:text-4xl block mt-4 font-bold">( CHATBOT AI THẾ HỆ MỚI )</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-200 max-w-2xl mx-auto font-medium">
              Khai xuân rạng rỡ với Trợ lý AI tối ưu cho doanh nghiệp.
              Giá cực lộc chỉ từ <span className="text-yellow-400 font-black decoration-yellow-400/30 underline underline-offset-8">29K/tháng</span>!
            </p>
          </div>

          <div className="bg-[#2a0101]/60 rounded-[2.5rem] p-6 md:p-10 border border-yellow-400/20 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute top-0 left-10 -translate-y-1/2 bg-yellow-400 text-red-900 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg border-2 border-white">
              Lộc Xuân Tràn Đầy
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-yellow-400/10 gap-4">
              <h3 className="text-2xl md:text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                  <Bot className="w-7 h-7 text-red-800" />
                </div>
                DANH SÁCH TRỢ LÝ AI
              </h3>
              <div className="bg-white/10 text-yellow-200 text-sm px-5 py-2 rounded-full border border-yellow-400/20 font-bold backdrop-blur-md">
                {allProducts.length} trợ lý chuyên nghiệp
              </div>
            </div>

            {allProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col p-5 bg-[#3a0202]/40 rounded-3xl hover:bg-[#4a0404]/60 transition-all group hover:scale-[1.05] border border-white/5 hover:border-yellow-400/50 shadow-xl relative overflow-hidden"
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
                      <div className="flex-1 flex flex-col pt-4">
                        <h4 className="font-black text-white group-hover:text-yellow-400 transition-colors mb-3 line-clamp-2 text-xl uppercase tracking-tight">
                          {product.name}
                        </h4>
                        <p className="text-base text-slate-300/80 mb-5 line-clamp-3 flex-grow leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-yellow-500/60 uppercase font-black tracking-widest">Giá khai xuân</span>
                            <span className="text-yellow-400 font-black text-2xl drop-shadow-sm">{formatCurrency(product.price)}</span>
                          </div>
                          <div className="w-12 h-12 bg-yellow-400 text-red-900 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg">
                            <ArrowRight className="w-6 h-6" />
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
      <section className="py-20 bg-[#2a0101]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Quà tặng */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-all duration-500 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Gift className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 uppercase text-center tracking-tight">NHẬN QUÀ <span className="text-yellow-400">KHAI XUÂN</span></h3>
                <p className="text-slate-400 mb-8 text-center text-lg leading-relaxed max-w-lg mx-auto">
                  Tham gia cộng đồng ngay để nhận Trợ lý AI miễn phí và nhận gói quà tặng đặc biệt trị giá <span className="text-red-400 font-bold">2.000.000đ</span>!
                </p>
                <div className="flex justify-center">
                  <Link
                    href="/qua-tang"
                    className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black rounded-2xl hover:from-red-500 hover:to-rose-400 transition-all uppercase shadow-[0_15px_35px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_20px_45px_-10px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-95 text-lg"
                  >
                    <Gift className="w-6 h-6" />
                    NHẬN BÃO QUÀ TẶNG
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#1a0101] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-bold mb-6 uppercase tracking-widest border border-yellow-400/20">
              <Star className="w-4 h-4 fill-yellow-400" />
              ĐÁNH GIÁ TỪ KHÁCH HÀNG
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase tracking-tighter">
              CHIA SẺ <span className="text-yellow-400">ĐẦU XUÂN</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#2a0101]/40 p-8 rounded-[2rem] border border-yellow-400/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">🏮</div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-200 mb-8 italic leading-relaxed text-lg">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-red-900 flex items-center justify-center font-black text-2xl shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{testimonial.name}</p>
                    <p className="text-xs text-yellow-500/60 uppercase tracking-[0.2em] font-black">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-br from-[#6b0000] to-[#2a0101] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #facc15 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-none">
            BẮT ĐẦU NĂM MỚI <br />
            <span className="text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]">BỨT PHÁ DOANH SỐ</span>
          </h2>
          <p className="text-xl md:text-2xl text-red-100 mb-12 max-w-3xl mx-auto font-medium">
            Sở hữu Trợ lý AI chuyên biệt ngay hôm nay. Vận hành tự động, chốt đơn xuyên Tết!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dat-hang" className="px-12 py-6 bg-yellow-400 text-red-900 hover:bg-yellow-300 text-xl font-black rounded-[2rem] shadow-[0_20px_50px_rgba(250,204,21,0.3)] transition-all hover:scale-105 active:scale-95 uppercase tracking-wider">
              MUA TRỢ LÝ AI NGAY
            </Link>
            <a href="tel:0345501969" className="px-12 py-6 bg-transparent text-white border-2 border-white/40 hover:bg-white/10 text-xl font-black rounded-[2rem] transition-all uppercase tracking-wider border-2">
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
