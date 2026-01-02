"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Star, Bot, Loader2, CheckCircle, Minus, Plus } from "lucide-react";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
    <div className="min-h-screen bg-slate-900">
      <Header settings={{ site_phone: "0345 501 969" }} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-16">
        <div className="container mx-auto px-4">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            QUAY LẠI DANH SÁCH
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-6xl">🤖</span>
            <div>
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-400 text-slate-900 text-xs font-bold rounded-full mb-2">
                  <Star className="w-3 h-3 fill-current" />
                  BÁN CHẠY NHẤT
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {product.name}
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
              {/* Description */}

              {/* Long Description */}
              <div className="bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6 uppercase">Chi tiết sản phẩm</h2>
                <div className="prose prose-slate max-w-none">
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

                    <div className="grid grid-cols-1 gap-6">
                      {/* Standard Package */}
                      <div
                        className={`relative group cursor-pointer transition-all preserve-3d min-h-[220px] ${flippedCards['standard'] ? 'flipped' : ''}`}
                        onClick={() => setSelectedPackage("standard")}
                      >
                        {/* Front Side */}
                        <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 border-2 transition-all flex flex-col ${selectedPackage === "standard" ? "bg-slate-700 border-primary-500 shadow-lg shadow-primary-500/20" : "bg-slate-700/30 border-slate-700 hover:border-slate-600"}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">MUA TRỢ LÝ AI (Tiêu chuẩn)</span>
                            {selectedPackage === "standard" && <CheckCircle className="w-4 h-4 text-primary-500" />}
                          </div>
                          <div className="text-xl font-bold text-white mb-1">{formatCurrency(priceStandard)}</div>
                          <p className="text-slate-400 text-[10px] mb-4">{descriptionStandard}</p>

                          <div className="mt-auto space-y-3">
                            {selectedPackage === "standard" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cart = [{ id: product.id, quantity: 1, packageType: "standard" }];
                                  sessionStorage.setItem("cart", JSON.stringify(cart));
                                  router.push("/dat-hang");
                                }}
                                className="relative overflow-hidden w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 text-xs font-black rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition-all uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] group/btn"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  Đăng ký sử dụng
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, standard: !prev.standard }));
                              }}
                              className="w-full text-center text-[10px] text-primary-400 font-bold hover:text-primary-300 underline underline-offset-4"
                            >
                              Xem chi tiết ưu đãi ➔
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rounded-2xl p-5 bg-slate-800 border-2 border-primary-500 rotate-y-180 flex flex-col">
                          <p className="text-white font-bold text-xs mb-2">Ưu đãi Tiêu chuẩn:</p>
                          <div className="grid grid-cols-1 gap-1.5 overflow-hidden pr-1 mb-4">
                            {featuresStandardStr.split("\n").filter((f: string) => f.trim()).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300 leading-tight">
                                <CheckCircle className="w-2.5 h-2.5 shrink-0 mt-0.5 text-emerald-400" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "standard" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="relative overflow-hidden w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 text-xs font-black rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition-all uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] group/btn"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Đăng ký sử dụng
                                <CheckCircle className="w-3.5 h-3.5" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, standard: !prev.standard }));
                              }}
                              className="w-full text-center text-[10px] text-slate-500 font-bold hover:text-slate-400"
                            >
                              🠔 Quay lại
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gold Package */}
                      <div
                        className={`relative group cursor-pointer transition-all preserve-3d min-h-[220px] ${flippedCards['gold'] ? 'flipped' : ''}`}
                        onClick={() => setSelectedPackage("gold")}
                      >
                        {/* Sparkle Border Container - VIBRANT & PERSISTENT */}
                        <div className={`absolute -inset-[2.5px] rounded-[19px] z-0 bg-[length:300%_300%] bg-gradient-to-r from-amber-600 via-yellow-200 to-amber-400 via-orange-400 to-amber-600 animate-border-sparkle`}></div>

                        {/* Front Side */}
                        <div className={`relative z-10 h-full backface-hidden rounded-2xl p-5 border-2 transition-all flex flex-col ${selectedPackage === "gold" ? "bg-slate-900/40 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-premium-glow" : "bg-slate-900/95 border-transparent"}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 tracking-wider ${selectedPackage === "gold" ? "text-white" : "text-amber-400"}`}>
                              <Star className={`w-3 h-3 ${selectedPackage === "gold" ? "fill-white" : "fill-amber-400"}`} />
                              Gói VÀNG
                            </span>
                            {selectedPackage === "gold" && <CheckCircle className="w-5 h-5 text-amber-400 drop-shadow-glow" />}
                          </div>
                          <div className={`text-2xl font-black mb-1 drop-shadow-sm ${selectedPackage === "gold" ? "text-white" : "text-amber-400"}`}>{formatCurrency(priceGold)}</div>
                          <p className={`text-[10px] mb-4 font-medium ${selectedPackage === "gold" ? "text-amber-100" : "text-amber-100/60"}`}>{descriptionGold}</p>

                          <div className="mt-auto space-y-3">
                            {selectedPackage === "gold" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cart = [{ id: product.id, quantity: 1, packageType: "gold" }];
                                  sessionStorage.setItem("cart", JSON.stringify(cart));
                                  router.push("/dat-hang");
                                }}
                                className="relative overflow-hidden w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-black rounded-lg hover:from-amber-300 hover:to-amber-500 transition-all uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] group/btn"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  Đăng ký sử dụng
                                  <Star className="w-3.5 h-3.5 fill-slate-900" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, gold: !prev.gold }));
                              }}
                              className="w-full text-center text-[10px] text-amber-500 font-bold hover:text-amber-400 underline underline-offset-4"
                            >
                              Xem chi tiết ưu đãi ➔
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rounded-2xl p-5 bg-amber-950 border-2 border-amber-500 rotate-y-180 flex flex-col">
                          <p className="text-white font-bold text-xs mb-2">Ưu đãi Combo Vàng:</p>
                          <div className="grid grid-cols-1 gap-1.5 overflow-hidden pr-1 mb-4">
                            {featuresGoldStr.split("\n").filter((f: string) => f.trim()).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-amber-100/90 leading-tight">
                                <CheckCircle className="w-2.5 h-2.5 shrink-0 mt-0.5 text-amber-400" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "gold" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="relative overflow-hidden w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-black rounded-lg hover:from-amber-300 hover:to-amber-500 transition-all uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] group/btn"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Đăng ký sử dụng
                                <Star className="w-3.5 h-3.5 fill-slate-900" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, gold: !prev.gold }));
                              }}
                              className="w-full text-center text-[10px] text-amber-200 font-bold hover:text-amber-300"
                            >
                              🠔 Quay lại
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Platinum Package */}
                      <div
                        className={`relative group cursor-pointer transition-all preserve-3d min-h-[220px] ${flippedCards['platinum'] ? 'flipped' : ''}`}
                        onClick={() => setSelectedPackage("platinum")}
                      >
                        {/* Sparkle Border Container - VIBRANT & PERSISTENT */}
                        <div className={`absolute -inset-[2.5px] rounded-[19px] z-0 bg-[length:300%_300%] bg-gradient-to-r from-cyan-600 via-white to-blue-400 via-cyan-200 to-cyan-600 animate-border-sparkle`}></div>

                        {/* Front Side */}
                        <div className={`relative z-10 h-full backface-hidden rounded-2xl p-5 border-2 transition-all flex flex-col ${selectedPackage === "platinum" ? "bg-slate-900/40 border-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.4)] animate-premium-glow-platinum" : "bg-slate-900/95 border-transparent"}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 tracking-wider ${selectedPackage === "platinum" ? "text-white" : "text-cyan-400"}`}>
                              <Bot className="w-3 h-3" />
                              BACH KIM
                            </span>
                            {selectedPackage === "platinum" && <CheckCircle className="w-5 h-5 text-cyan-400 drop-shadow-glow" />}
                          </div>
                          <div className={`text-2xl font-black mb-1 drop-shadow-sm ${selectedPackage === "platinum" ? "text-white" : "text-cyan-400"}`}>{formatCurrency(pricePlatinum)}</div>
                          <p className={`text-[10px] mb-4 font-medium ${selectedPackage === "platinum" ? "text-cyan-100" : "text-cyan-100/60"}`}>{descriptionPlatinum}</p>

                          <div className="mt-auto space-y-3">
                            {selectedPackage === "platinum" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cart = [{ id: product.id, quantity: 1, packageType: "platinum" }];
                                  sessionStorage.setItem("cart", JSON.stringify(cart));
                                  router.push("/dat-hang");
                                }}
                                className="relative overflow-hidden w-full py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-900 text-xs font-black rounded-lg hover:from-cyan-300 hover:to-cyan-500 transition-all uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] group/btn"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  Đăng ký sử dụng
                                  <Bot className="w-3.5 h-3.5" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, platinum: !prev.platinum }));
                              }}
                              className="w-full text-center text-[10px] text-cyan-400 font-bold hover:text-cyan-300 underline underline-offset-4"
                            >
                              Xem chi tiết ưu đãi ➔
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rounded-2xl p-5 bg-cyan-950 border-2 border-cyan-400 rotate-y-180 flex flex-col">
                          <p className="text-white font-bold text-xs mb-2">Đặc quyền Bạch Kim:</p>
                          <div className="grid grid-cols-1 gap-1.5 overflow-hidden pr-1 mb-4">
                            {featuresPlatinumStr.split("\n").filter((f: string) => f.trim()).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-cyan-100/90 leading-tight">
                                <CheckCircle className="w-2.5 h-2.5 shrink-0 mt-0.5 text-cyan-400" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "platinum" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="relative overflow-hidden w-full py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-900 text-xs font-black rounded-lg hover:from-cyan-300 hover:to-cyan-500 transition-all uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] group/btn"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Đăng ký sử dụng
                                <Bot className="w-3.5 h-3.5" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCards(prev => ({ ...prev, platinum: !prev.platinum }));
                              }}
                              className="w-full text-center text-[10px] text-cyan-200 font-bold hover:text-cyan-300"
                            >
                              🠔 Quay lại
                            </button>
                          </div>
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

                  <div className="pt-6 border-t border-slate-700 mt-6">
                    <p className="text-[10px] text-slate-500 italic text-center uppercase tracking-widest font-bold">
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
                <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Hoặc Chat qua Zalo</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={{ site_phone: "0345 501 969" }} />
    </div>
  );
}
