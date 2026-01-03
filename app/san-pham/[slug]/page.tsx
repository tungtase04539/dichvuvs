"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Star, Bot, Loader2, CheckCircle, Minus, Plus, Sparkles, Gift, Zap, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string | null;
  price: number;
  image: string | null;
  videoUrl: string | null;
  featured: boolean;
  priceGold: number | null;
  pricePlatinum: number | null;
  featuresGold: string | null;
  featuresPlatinum: string | null;
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<"standard" | "gold" | "platinum">("standard");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [globalSettings, setGlobalSettings] = useState<Record<string, string>>({});
  const router = useRouter();

  const getYoutubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.hostname.includes("youtube.com")) {
        if (u.searchParams.get("v")) {
          return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
        }
        if (u.pathname.startsWith("/shorts/")) {
          const id = u.pathname.split("/shorts/")[1];
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`);

        if (!res.ok) {
          router.push("/san-pham");
          return;
        }

        const data = await res.json();

        if (!data.product) {
          router.push("/san-pham");
          return;
        }

        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);

        // Fetch global settings for packages
        try {
          const settingsRes = await fetch("/api/admin/settings", { cache: "no-store" });
          const settingsData = await settingsRes.json();
          if (settingsData.settings) {
            setGlobalSettings(settingsData.settings);
          }
        } catch (e) {
          console.warn("Could not load global settings, using defaults");
        }
      } catch (error) {
        console.error("Load product error:", error);
        router.push("/san-pham");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a0101] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!product) return null;

  // Global-aware pricing & features logic
  const priceGold = globalSettings.price_gold ? parseFloat(globalSettings.price_gold) : (product.priceGold || product.price * 1.5);
  const pricePlatinum = globalSettings.price_platinum ? parseFloat(globalSettings.price_platinum) : (product.pricePlatinum || product.price * 2.5);
  const priceStandard = globalSettings.price_standard ? parseFloat(globalSettings.price_standard) : product.price;

  const featuresGoldStr = globalSettings.features_gold || product.featuresGold || "Hỗ trợ ưu tiên\nUpdate 24/7\nTùy chỉnh chuyên sâu";
  const featuresPlatinumStr = globalSettings.features_platinum || product.featuresPlatinum || "Toàn bộ tính năng Premium\nBảo hành trọn đời\nHỗ trợ 1-1";
  const featuresStandardStr = globalSettings.features_standard || "Sử dụng vĩnh viễn\nHỗ trợ cộng đồng\nUpdate bảo mật định kỳ";

  const descriptionGold = globalSettings.description_gold || "Combo: Trợ lý AI + Thương hiệu & Quà tặng";
  const descriptionPlatinum = globalSettings.description_platinum || "Full Option: Trợ lý AI + Hệ sinh thái đặc quyền";
  const descriptionStandard = globalSettings.description_standard || "Gói cơ bản phù hợp cho cá nhân khởi đầu";

  const packages = [
    {
      id: "standard",
      name: "TIÊU CHUẨN",
      price: priceStandard,
      features: featuresStandardStr.split("\n").filter((f: string) => f.trim()),
      color: "slate",
    },
    {
      id: "gold",
      name: "VÀNG (GOLD)",
      price: priceGold,
      features: featuresGoldStr.split("\n").filter((f: string) => f.trim()),
      color: "amber",
      popular: true,
    },
    {
      id: "platinum",
      name: "BẠCH KIM (PLATINUM)",
      price: pricePlatinum,
      features: featuresPlatinumStr.split("\n").filter((f: string) => f.trim()),
      color: "cyan",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0000] text-white selection:bg-amber-400 selection:text-red-950">
      <Header settings={{ site_phone: "0345 501 969" }} />

      {/* Hero Section */}
      <section className="bg-gradient-hero pt-32 pb-24 relative overflow-hidden">
        {/* Tet Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
          <div className="absolute top-10 right-[10%] text-6xl animate-bounce">🏮</div>
          <div className="absolute bottom-20 left-[5%] text-5xl animate-pulse">🌸</div>
          <div className="absolute top-40 left-[15%] text-4xl animate-bounce" style={{ animationDuration: '5s' }}>🌼</div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1)_0%,transparent_60%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-8 transition-all font-bold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-widest text-sm">Quay lại danh sách</span>
          </Link>
          <div className="flex flex-col gap-6 max-w-4xl">
            <p className="text-red-50/90 text-xl leading-relaxed font-bold drop-shadow-md">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 rounded-xl border border-white/5 backdrop-blur-sm">
                <Bot className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-widest text-white/80">AI Pro ✨</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 rounded-xl border border-white/5 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-widest text-white/80">Fast Response ⚡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
              {/* Description */}

              {/* Long Description */}
              <div className="bg-[#200000]/60 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-amber-400/10 backdrop-blur-2xl">
                <h2 className="text-3xl font-black text-white mb-10 uppercase tracking-tighter flex items-center gap-4">
                  <div className="w-3 h-10 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
                  CHI TIẾT TRỢ LÝ AI
                </h2>
                <div className="prose prose-invert max-w-none">
                  {product.longDescription ? (
                    <div className="whitespace-pre-wrap text-slate-300">{product.longDescription}</div>
                  ) : (
                    <div className="space-y-6 text-slate-300">
                      <p>
                        <strong className="text-white">{product.name}</strong> là giải pháp Trợ lý AI tiên tiến,
                        được thiết kế đặc biệt để tự động hóa quy trình kinh doanh và tăng hiệu quả tương tác với khách hàng.
                      </p>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">🚀 Lợi ích khi sử dụng:</h3>
                        <ul className="space-y-2">
                          {[
                            "Tự động trả lời khách hàng 24/7, không bỏ lỡ bất kỳ cơ hội nào",
                            "Giảm 80% thời gian xử lý các câu hỏi thường gặp",
                            "Tăng tỷ lệ chuyển đổi lên đến 300%",
                            "Tiết kiệm chi phí nhân sự",
                            "Tích hợp dễ dàng với Facebook, Zalo, Website",
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">📦 Bạn sẽ nhận được:</h3>
                        <ul className="space-y-2">
                          {[
                            "1 Trợ lý AI đã được cấu hình sẵn",
                            "Hướng dẫn cài đặt chi tiết",
                            "Hỗ trợ kỹ thuật 24/7",
                            "Update tính năng mới miễn phí trọn đời",
                            "Bảo hành và hoàn tiền trong 7 ngày",
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 order-1 lg:order-2">

              {/* Unified Purchase Card */}
              <div className="bg-slate-800 rounded-2xl shadow-xl border border-primary-500/20 ring-1 ring-white/5 overflow-hidden">
                {/* Header */}
                <div className="bg-primary-500 p-4">
                  <h3 className="text-slate-900 font-black uppercase text-center tracking-widest text-lg flex items-center justify-center gap-2">
                    <Star className="w-5 h-5 fill-slate-900" />
                    ĐĂNG KÝ DỊCH VỤ
                    <Star className="w-5 h-5 fill-slate-900" />
                  </h3>
                </div>

                <div className="p-6 space-y-8">
                  {/* 1. Video Demo (NOW AT TOP) */}
                  {product.videoUrl && getYoutubeEmbedUrl(product.videoUrl) && (
                    <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black shadow-inner">
                      <iframe
                        src={`${getYoutubeEmbedUrl(product.videoUrl)}?rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video demo"
                      />
                    </div>
                  )}

                  {/* 2. Package Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary-400 font-bold uppercase text-xs tracking-wider mb-4">
                      Chọn gói phù hợp
                    </div>

                    {/* Package Grid Title */}
                    <div className="text-center mb-16">
                      <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                        CHỌN GÓI <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">KHAI XUÂN</span>
                      </h2>
                      <div className="h-2 w-24 bg-amber-400 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Standard Package */}
                      <div
                        className={`relative group cursor-pointer transition-all preserve-3d min-h-[480px] ${flippedCards['standard'] ? 'flipped' : ''}`}
                        onClick={() => setSelectedPackage("standard")}
                      >
                        {/* Front Side */}
                        <div className={`relative z-10 h-full backface-hidden rounded-[2.5rem] p-8 border-2 transition-all flex flex-col ${selectedPackage === "standard" ? "bg-[#250000] border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.3)]" : "bg-[#100000] border-white/5 hover:border-amber-400/30"}`}>
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black uppercase text-amber-500/80 tracking-[0.2em]">Dành cho cá nhân</span>
                            {selectedPackage === "standard" && <CheckCircle className="w-7 h-7 text-amber-400 drop-shadow-glow" />}
                          </div>
                          <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">Gói Tiêu Chuẩn</div>
                          <div className="text-4xl font-black mb-4 text-white drop-shadow-sm">{formatCurrency(priceStandard)}</div>
                          <p className="text-sm text-red-50/60 mb-8 font-medium leading-relaxed">{descriptionStandard}</p>

                          <div className="mt-auto space-y-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "standard" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="relative overflow-hidden w-full py-4 bg-amber-400 text-red-950 text-sm font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-xl border-2 border-white/20 group/btn"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Đăng ký ngay
                                <ArrowRight className="w-5 h-5" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, standard: !prev.standard }));
                              }}
                              className="w-full text-center text-xs text-amber-500 font-black hover:text-amber-400 uppercase tracking-widest transition-colors"
                            >
                              Xem tính năng ➔
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rounded-[2.5rem] p-8 bg-[#300000] border-2 border-amber-400 rotate-y-180 flex flex-col shadow-2xl">
                          <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-6">Đặc quyền Tiêu chuẩn:</h4>
                          <div className="grid grid-cols-1 gap-4 mb-8">
                            {featuresStandardStr.split("\n").filter((f: string) => f.trim()).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 text-xs text-white/90 leading-tight group/item">
                                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 drop-shadow-glow" />
                                <span className="font-medium">{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto space-y-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "standard" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="w-full py-4 bg-amber-400 text-red-950 text-sm font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-xl border-2 border-white/20"
                            >
                              Đăng ký ngay
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, standard: !prev.standard }));
                              }}
                              className="w-full text-center text-xs text-amber-500/60 font-black hover:text-amber-400 uppercase tracking-widest transition-colors"
                            >
                              🠔 Quay lại
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gold Package */}
                      <div
                        className={`relative group cursor-pointer transition-all preserve-3d min-h-[480px] ${flippedCards['gold'] ? 'flipped' : ''}`}
                        onClick={() => setSelectedPackage("gold")}
                      >
                        {/* Premium Sparkle Border */}
                        <div className={`absolute -inset-[3px] rounded-[2.5rem] z-0 bg-[length:300%_300%] bg-gradient-to-r from-amber-600 via-white to-amber-400 animate-border-sparkle opacity-80 shadow-[0_0_40px_rgba(251,191,36,0.5)]`}></div>

                        {/* Front Side */}
                        <div className={`relative z-10 h-full backface-hidden rounded-[2.5rem] p-8 border-2 transition-all flex flex-col ${selectedPackage === "gold" ? "bg-[#300000] border-amber-400 shadow-2xl" : "bg-[#150000] border-transparent hover:border-amber-400/30"}`}>
                          <div className="flex justify-between items-start mb-6">
                            <span className={`text-[10px] font-black uppercase flex items-center gap-2 tracking-[0.2em] ${selectedPackage === "gold" ? "text-white" : "text-amber-500"}`}>
                              <Star className={`w-4 h-4 ${selectedPackage === "gold" ? "fill-white" : "fill-amber-500"}`} />
                              Gói Vàng (Gold)
                            </span>
                            {selectedPackage === "gold" && <CheckCircle className="w-8 h-8 text-amber-400 drop-shadow-glow" />}
                          </div>
                          <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">Dành cho Doanh nghiệp</div>
                          <div className={`text-4xl font-black mb-4 drop-shadow-md ${selectedPackage === "gold" ? "text-white" : "text-amber-400"}`}>{formatCurrency(priceGold)}</div>
                          <p className={`text-sm mb-8 font-medium leading-relaxed ${selectedPackage === "gold" ? "text-amber-50" : "text-red-50/60"}`}>{descriptionGold}</p>

                          <div className="mt-auto space-y-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "gold" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="relative overflow-hidden w-full py-4 bg-amber-400 text-red-950 text-sm font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-[0_20px_40px_rgba(251,191,36,0.4)] border-2 border-white/30 group/btn"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                ĐĂNG KÝ NGAY
                                <Star className="w-4 h-4 fill-red-950" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, gold: !prev.gold }));
                              }}
                              className="w-full text-center text-xs text-amber-400 font-black hover:text-white uppercase tracking-widest transition-colors"
                            >
                              Xem đặc quyền ➔
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rounded-[2.5rem] p-8 bg-[#400000] border-2 border-amber-400 rotate-y-180 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                          <h4 className="text-amber-400 font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Star className="w-5 h-5 fill-amber-400" />
                            ĐẶC QUYỀN GÓI VÀNG:
                          </h4>
                          <div className="grid grid-cols-1 gap-5 mb-8">
                            {featuresGoldStr.split("\n").filter((f: string) => f.trim()).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-4 text-xs text-amber-50 leading-tight">
                                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400 drop-shadow-glow" />
                                <span className="font-bold">{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto space-y-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "gold" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="w-full py-4 bg-amber-400 text-red-950 text-sm font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-xl border-2 border-white/20"
                            >
                              Đăng ký ngay
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, gold: !prev.gold }));
                              }}
                              className="w-full text-center text-xs text-amber-200/60 font-black hover:text-amber-400 uppercase tracking-widest transition-colors"
                            >
                              🠔 Quay lại
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Platinum Package */}
                      <div
                        className={`relative group cursor-pointer transition-all preserve-3d min-h-[480px] ${flippedCards['platinum'] ? 'flipped' : ''}`}
                        onClick={() => setSelectedPackage("platinum")}
                      >
                        {/* Premium Sparkle Border */}
                        <div className={`absolute -inset-[3px] rounded-[2.5rem] z-0 bg-[length:300%_300%] bg-gradient-to-r from-cyan-600 via-white to-blue-400 animate-border-sparkle opacity-80 shadow-[0_0_40px_rgba(34,211,238,0.3)]`}></div>

                        {/* Front Side */}
                        <div className={`relative z-10 h-full backface-hidden rounded-[2.5rem] p-8 border-2 transition-all flex flex-col ${selectedPackage === "platinum" ? "bg-[#200000] border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.3)]" : "bg-[#100000] border-white/5 hover:border-amber-400/30"}`}>
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black uppercase text-amber-500/80 tracking-[0.2em]">Dành cho Đại lý</span>
                            {selectedPackage === "platinum" && <CheckCircle className="w-7 h-7 text-amber-400 drop-shadow-glow" />}
                          </div>
                          <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">Gói Bạch Kim</div>
                          <div className="text-4xl font-black mb-4 text-white drop-shadow-sm">{formatCurrency(pricePlatinum)}</div>
                          <p className="text-sm text-red-50/60 mb-8 font-medium leading-relaxed">{descriptionPlatinum}</p>

                          <div className="mt-auto space-y-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "platinum" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="relative overflow-hidden w-full py-4 bg-amber-400 text-red-950 text-sm font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-xl border-2 border-white/20 group/btn"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                ĐĂNG KÝ NGAY
                                <Sparkles className="w-4 h-4" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, platinum: !prev.platinum }));
                              }}
                              className="w-full text-center text-xs text-amber-500 font-black hover:text-amber-400 uppercase tracking-widest transition-colors"
                            >
                              Xem hệ sinh thái ➔
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rounded-[2.5rem] p-8 bg-[#300000] border-2 border-amber-400 rotate-y-180 flex flex-col shadow-2xl overflow-hidden group">
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-[60px]" />
                          <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Sparkles className="w-4 h-4 fill-amber-400" />
                            HỆ SINH THÁI PLATINUM:
                          </h4>
                          <div className="grid grid-cols-1 gap-4 mb-8">
                            {featuresPlatinumStr.split("\n").filter((f: string) => f.trim()).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 text-xs text-white/90 leading-tight">
                                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 drop-shadow-glow" />
                                <span className="font-medium">{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto space-y-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "platinum" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="w-full py-4 bg-amber-400 text-red-950 text-sm font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-xl border-2 border-white/20"
                            >
                              Đăng ký ngay
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, platinum: !prev.platinum }));
                              }}
                              className="w-full text-center text-xs text-amber-500/60 font-black hover:text-amber-400 uppercase tracking-widest transition-colors"
                            >
                              🠔 Quay lại
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 ml-2">128 khách hàng đã tin dùng</span>
                    </div>

                    <div className="pt-6 border-t border-yellow-400/10 mt-6">
                      <p className="text-[10px] text-yellow-500/40 italic text-center uppercase tracking-widest font-black">
                        Giao dịch được bảo mật bởi hệ thống thanh toán tự động
                      </p>
                    </div>
                  </div>
                </div>

                <style jsx>{`
                .preserve-3d {
                  transform-style: preserve-3d;
                  perspective: 1000px;
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
                @keyframes shimmer {
                  from { transform: translateX(-100%); }
                  to { transform: translateX(200%); }
                }
                .animate-shimmer {
                  animation: shimmer 1.5s infinite;
                }
                @keyframes border-sparkle {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 100%; }
                  100% { background-position: 0% 50%; }
                }
                .animate-border-sparkle {
                  animation: border-sparkle 4s ease infinite;
                }
                .drop-shadow-glow {
                  filter: drop-shadow(0 0 8px currentColor);
                }
                @keyframes premium-glow {
                  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
                  50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.6); }
                }
                .animate-premium-glow {
                  animation: premium-glow 2s ease-in-out infinite;
                }
                @keyframes premium-glow-platinum {
                  0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
                  50% { box-shadow: 0 0 45px rgba(34, 211, 238, 0.7); }
                }
                .animate-premium-glow-platinum {
                  animation: premium-glow-platinum 2s ease-in-out infinite;
                }
              `}</style>



              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-white mb-8 uppercase">Trợ lý AI liên quan</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/san-pham/${item.slug}`}
                      className="group bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-primary-400/50 transition-all hover:-translate-y-1"
                    >
                      <div className="text-4xl mb-3">🤖</div>
                      <h3 className="font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-primary-400 font-bold">
                        {formatCurrency(item.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Card - NOW AT BOTTOM */}
            <div className="mt-20">
              <div className="bg-gradient-cta rounded-3xl p-10 text-white border border-primary-400/20 text-center max-w-4xl mx-auto shadow-2xl">
                <h3 className="text-3xl font-black mb-4 text-primary-400 uppercase tracking-tighter">CẦN TƯ VẤN CHUYÊN SÂU?</h3>
                <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                  Bạn chưa biết chọn gói nào? Liên hệ ngay với đội ngũ chuyên gia của chúng tôi để được tư vấn giải pháp AI tối ưu nhất cho doanh nghiệp của bạn.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a
                    href="tel:0345501969"
                    className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 px-10 py-4 text-xl font-black uppercase shadow-xl shadow-primary-400/40 flex items-center gap-3 transition-all hover:scale-105"
                  >
                    <Bot className="w-6 h-6" />
                    0345 501 969
                  </a>
                  <a
                    href="https://zalo.me/0345501969"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 font-bold uppercase tracking-widest text-sm underline underline-offset-4 transition-all"
                  >
                    Hoặc Chat qua Zalo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={{ site_phone: "0345 501 969" }} />
    </div >
  );
}
