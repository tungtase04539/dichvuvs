"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
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
  const [selectedPackage, setSelectedPackage] = useState<"single" | "standard" | "gold" | "platinum">("single");
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
  const priceGold = globalSettings.price_gold ? parseFloat(globalSettings.price_gold) : 600000;
  const pricePlatinum = globalSettings.price_platinum ? parseFloat(globalSettings.price_platinum) : 1999999;
  const priceStandard = globalSettings.price_standard ? parseFloat(globalSettings.price_standard) : product.price;

  const featuresGoldStr = globalSettings.features_gold || product.featuresGold || "Hỗ trợ 24/7\nTặng ChatGPT Plus 1 tháng\nTặng Capcut Pro 28 ngày\nTặng AI VIP\nTặng Tài liệu Marketing";
  const featuresPlatinumStr = globalSettings.features_platinum || product.featuresPlatinum || "Hỗ trợ 24/7\nTặng ChatGPT Plus 1 năm\nTặng Capcut Pro 60 ngày\nTặng Canva 1 năm\nTặng full hệ sinh thái AI";
  const featuresStandardStr = globalSettings.features_standard || "Hỗ trợ 24/7\nCộng đồng hỗ trợ lớn mạnh";

  const descriptionGold = globalSettings.description_gold || "Combo 30 Trợ lý + ChatGPT plus 1 tháng + Capcut Pro 28 ngày";
  const descriptionPlatinum = globalSettings.description_platinum || "Combo 30 Trợ lý + ChatGPT plus 1 năm + Capcut Pro 60 ngày + Canva 1 năm + ...";
  const descriptionStandard = globalSettings.description_standard || "Hỗ trợ 24/7 , cộng đồng hỗ trợ lớn mạnh";

  const packages = [
    {
      id: "single",
      name: "MUA RIÊNG",
      price: product.price,
      features: ["Chỉ mua riêng trợ lý này", "Hỗ trợ 24/7", "Không kèm combo"],
      color: "emerald",
    },
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

  const handleRegister = (pkgId: string) => {
    const cart = [{ id: product.id, quantity: 1, packageType: pkgId }];
    sessionStorage.setItem("cart", JSON.stringify(cart));
    router.push("/dat-hang");
  };

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

              {/* Related Products - MOVED HERE */}
              {relatedProducts.length > 0 && (
                <div className="mt-16 bg-[#150000]/40 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-sm">
                  <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-2 h-6 bg-amber-400 rounded-full" />
                    Trợ lý AI liên quan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedProducts.map((item) => (
                      <Link
                        key={item.id}
                        href={`/san-pham/${item.slug}`}
                        className="group bg-[#2a0000]/60 p-5 rounded-2xl border border-white/5 hover:border-amber-400/30 transition-all hover:-translate-y-1 block"
                      >
                        <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
                        <h3 className="font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-amber-400 font-black">
                          {formatCurrency(item.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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

                  {/* 3D Package Selection Cards */}
                  <div className="space-y-6">
                    {packages.map((pkg: any) => (
                      <div
                        key={pkg.id}
                        className="relative h-[250px] preserve-3d group cursor-pointer"
                        onClick={() => setSelectedPackage(pkg.id as "standard" | "gold" | "platinum")}
                      >
                        <div className={cn(
                          "absolute inset-0 transition-all duration-700 preserve-3d rounded-3xl border-2",
                          flippedCards[pkg.id] ? "rotate-y-180" : "",
                          selectedPackage === pkg.id
                            ? (pkg.id === 'platinum' ? "border-cyan-400 animate-premium-glow-platinum shadow-[0_0_30px_rgba(34,211,238,0.3)]" : "border-amber-400 animate-premium-glow shadow-[0_0_30px_rgba(245,158,11,0.3)]")
                            : "border-white/10",
                          pkg.id === 'gold' && "before:absolute before:inset-[-3px] before:rounded-3xl before:bg-gradient-to-r before:from-red-500 before:via-amber-400 before:to-red-500 before:animate-border-sparkle before:pointer-events-none before:opacity-80 before:blur-[1px] before:content-['']",
                          pkg.id === 'platinum' && "before:absolute before:inset-[-3px] before:rounded-3xl before:bg-gradient-to-r before:from-cyan-500 before:via-white before:to-blue-500 before:animate-border-sparkle-platinum before:pointer-events-none before:opacity-90 before:blur-[1px] before:content-['']"
                        )}>
                          {/* Front Side */}
                          <div className={cn(
                            "absolute inset-0 backface-hidden rounded-[1.4rem] p-6 flex flex-col justify-between overflow-hidden",
                            pkg.id === 'standard' ? "bg-slate-900" : (pkg.id === 'gold' ? "bg-gradient-to-br from-[#450a0a] to-[#1a0101]" : "bg-gradient-to-br from-[#083344] to-[#01161e]")
                          )}>
                            {/* Selected Checkmark */}
                            {selectedPackage === pkg.id && (
                              <div className="absolute top-4 right-4 z-20">
                                <CheckCircle className={cn("w-6 h-6", pkg.id === 'platinum' ? "text-cyan-400" : "text-amber-400")} />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {pkg.id === 'standard' ? <Zap className="w-4 h-4 text-slate-400" /> : (pkg.id === 'gold' ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Bot className="w-4 h-4 text-cyan-400" />)}
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", pkg.id === 'platinum' ? "text-cyan-400" : "text-amber-400")}>{pkg.name}</span>
                              </div>
                              <div className="text-3xl font-black mb-2 flex items-baseline gap-1">
                                {formatCurrency(pkg.price).replace('₫', '').replace(' đ', '')}
                                <span className="text-2xl opacity-50">đ</span>
                              </div>
                              <p className="text-[11px] text-white/70 leading-tight line-clamp-2 italic">
                                "{pkg.id === 'standard' ? descriptionStandard : (pkg.id === 'gold' ? descriptionGold : descriptionPlatinum)}"
                              </p>
                            </div>

                            <div className="space-y-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegister(pkg.id);
                                }}
                                className={cn(
                                  "w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn shadow-xl active:scale-95",
                                  pkg.id === 'platinum' ? "bg-cyan-400 text-slate-950" : "bg-amber-400 text-red-950"
                                )}
                              >
                                <span className="relative z-10">ĐĂNG KÝ SỬ DỤNG {pkg.id === 'gold' ? '★' : (pkg.id === 'platinum' ? '🤖' : '')}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlippedCards(prev => ({ ...prev, [pkg.id]: true }));
                                }}
                                className="w-full text-[10px] text-amber-500/80 hover:text-amber-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1 group/link transition-colors"
                              >
                                Xem chi tiết ưu đãi
                                <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>

                          {/* Back Side */}
                          <div className={cn(
                            "absolute inset-0 backface-hidden rotate-y-180 rounded-[1.4rem] p-6 flex flex-col justify-between overflow-hidden",
                            pkg.id === 'standard' ? "bg-slate-900" : (pkg.id === 'gold' ? "bg-gradient-to-br from-red-950 to-[#0a0000]" : "bg-gradient-to-br from-cyan-950 to-[#000a0a]")
                          )}>
                            <div className="space-y-3 pr-1">
                              <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Đặc quyền gói {pkg.name}</div>
                              <div className="space-y-2.5 overflow-y-auto max-h-[120px] scrollbar-hide">
                                {pkg.features.map((f: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-[10px] text-white/90 leading-tight">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 shrink-0 shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                                    <span>{f}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegister(pkg.id);
                                }}
                                className="w-full py-3 bg-amber-400 text-red-950 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg flex items-center justify-center"
                              >
                                ĐĂNG KÝ NGAY !
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlippedCards(prev => ({ ...prev, [pkg.id]: false }));
                                }}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 text-white/60 hover:text-white"
                              >
                                Quay lại
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Purchase Button - Proceed to checkout */}
                  <button
                    onClick={() => handleRegister(selectedPackage)}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-base font-black rounded-2xl hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 group/confirm relative overflow-hidden active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      XÁC NHẬN ĐĂNG KÝ
                      <ArrowRight className="w-6 h-6 group-hover/confirm:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/confirm:animate-shimmer transition-transform" />
                  </button>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 ml-2">1,248 khách hàng tin dùng</span>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-6">
                    <p className="text-[10px] text-white/20 italic text-center uppercase tracking-[0.2em] font-black leading-tight">
                      Bàn giao tài khoản tự động ngay sau khi thanh toán
                    </p>
                  </div>
                </div>

                {/* Consultation Card - MOVED HERE */}
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-[#450a0a] to-[#2a0101] rounded-3xl p-8 text-white border border-amber-400/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Bot className="w-20 h-20" />
                    </div>

                    <h3 className="text-xl font-black mb-3 text-amber-400 uppercase tracking-tighter leading-tight relative z-10">CẦN TƯ VẤN CHUYÊN SÂU?</h3>
                    <p className="text-red-100/60 text-sm mb-6 leading-relaxed relative z-10">
                      Liên hệ ngay với đội ngũ chuyên gia để được tư vấn giải pháp AI tối ưu nhất.
                    </p>

                    <div className="space-y-4 relative z-10">
                      <a
                        href="tel:0345501969"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-amber-400 text-red-950 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all shadow-lg"
                      >
                        <Bot className="w-5 h-5" />
                        0345 501 969
                      </a>
                      <a
                        href="https://zalo.me/0345501969"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-[0.2em] underline underline-offset-4"
                      >
                        Hoặc Chat qua Zalo
                      </a>
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
                @keyframes border-sparkle-platinum {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 100%; }
                  100% { background-position: 0% 50%; }
                }
                .animate-border-sparkle {
                  animation: border-sparkle 4s ease infinite;
                }
                .animate-border-sparkle-platinum {
                  animation: border-sparkle-platinum 3s linear infinite;
                  background-size: 200% 200%;
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
          </div>
        </div>
      </main>

      <Footer settings={{ site_phone: "0345 501 969" }} />
    </div>
  );
}
