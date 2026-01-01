"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartButton from "./AddToCartButton";
import { ArrowLeft, Star, Bot, Loader2, CheckCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

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
                    <div className="flex items-center gap-2 text-primary-400 font-bold uppercase text-xs tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                      Chọn gói phù hợp với bạn
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
                          <div className="text-xl font-bold text-white mb-1">{formatCurrency(product.price)}</div>
                          <p className="text-slate-400 text-[10px] mb-4">Gói cơ bản phù hợp cho cá nhân khởi đầu</p>

                          <div className="mt-auto space-y-3">
                            {selectedPackage === "standard" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cart = [{ id: product.id, quantity: 1, packageType: "standard" }];
                                  sessionStorage.setItem("cart", JSON.stringify(cart));
                                  router.push("/dat-hang");
                                }}
                                className="w-full py-2 bg-primary-500 text-slate-900 text-xs font-bold rounded-lg hover:bg-primary-400 transition-colors uppercase"
                              >
                                Đăng ký sử dụng
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
                          <p className="text-slate-300 text-[10px] leading-snug mb-4">Full tính năng cơ bản, Hỗ trợ cộng đồng, Update bảo mật định kỳ.</p>

                          <div className="mt-auto space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "standard" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="w-full py-2 bg-primary-500 text-slate-900 text-xs font-bold rounded-lg hover:bg-primary-400 transition-colors uppercase"
                            >
                              Đăng ký sử dụng
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
                        {/* Front Side */}
                        <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 border-2 transition-all flex flex-col ${selectedPackage === "gold" ? "bg-amber-900/20 border-amber-500 shadow-lg shadow-amber-500/20" : "bg-amber-900/10 border-amber-900/30 hover:border-amber-500/50"}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-amber-400 text-[10px] font-bold uppercase flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              Gói VÀNG
                            </span>
                            {selectedPackage === "gold" && <CheckCircle className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="text-xl font-bold text-amber-400 mb-1">{formatCurrency(product.priceGold || product.price * 1.5)}</div>
                          <p className="text-amber-100/60 text-[10px] mb-4">Combo: Trợ lý AI + Thương hiệu & Quà tặng</p>

                          <div className="mt-auto space-y-3">
                            {selectedPackage === "gold" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cart = [{ id: product.id, quantity: 1, packageType: "gold" }];
                                  sessionStorage.setItem("cart", JSON.stringify(cart));
                                  router.push("/dat-hang");
                                }}
                                className="w-full py-2 bg-amber-500 text-slate-900 text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors uppercase"
                              >
                                Đăng ký sử dụng
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
                          <p className="text-amber-100/80 text-[10px] leading-snug mb-4">Sở hữu Standard + Đóng gói thương hiệu riêng, Quà tặng đặc biệt từ Admin.</p>

                          <div className="mt-auto space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "gold" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="w-full py-2 bg-amber-500 text-slate-900 text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors uppercase"
                            >
                              Đăng ký sử dụng
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
                        {/* Front Side */}
                        <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 border-2 transition-all flex flex-col ${selectedPackage === "platinum" ? "bg-cyan-900/20 border-cyan-400 shadow-lg shadow-cyan-400/20" : "bg-cyan-900/10 border-cyan-900/30 hover:border-cyan-400/50"}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-cyan-400 text-[10px] font-bold uppercase flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              BACH KIM
                            </span>
                            {selectedPackage === "platinum" && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                          </div>
                          <div className="text-xl font-bold text-cyan-400 mb-1">{formatCurrency(product.pricePlatinum || product.price * 2.5)}</div>
                          <p className="text-cyan-100/60 text-[10px] mb-4">Full Option: Trợ lý AI + Hệ sinh thái đặc quyền</p>

                          <div className="mt-auto space-y-3">
                            {selectedPackage === "platinum" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cart = [{ id: product.id, quantity: 1, packageType: "platinum" }];
                                  sessionStorage.setItem("cart", JSON.stringify(cart));
                                  router.push("/dat-hang");
                                }}
                                className="w-full py-2 bg-cyan-400 text-slate-900 text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors uppercase"
                              >
                                Đăng ký sử dụng
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
                          <p className="text-cyan-100/80 text-[10px] leading-snug mb-4">Full giải pháp AI, Kỹ thuật hỗ trợ 1-1, Setup link Bot riêng, SLA 99.9%.</p>

                          <div className="mt-auto space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cart = [{ id: product.id, quantity: 1, packageType: "platinum" }];
                                sessionStorage.setItem("cart", JSON.stringify(cart));
                                router.push("/dat-hang");
                              }}
                              className="w-full py-2 bg-cyan-400 text-slate-900 text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors uppercase"
                            >
                              Đăng ký sử dụng
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

                  {/* 3. Pricing & Call to Action */}
                  <div className="pt-6 border-t border-slate-700">
                    <div className="mb-6 p-5 bg-slate-900/80 rounded-2xl border border-primary-500/20">
                      <div className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">
                        {selectedPackage === "standard" ? "Giá mua sản phẩm:" : "Phí dịch vụ trọn gói:"}
                      </div>
                      <div className="flex items-end gap-3 mb-3">
                        <span className="text-3xl font-black text-primary-400">
                          {formatCurrency(
                            selectedPackage === "gold" ? (product.priceGold || product.price * 1.5) :
                              selectedPackage === "platinum" ? (product.pricePlatinum || product.price * 2.5) :
                                product.price
                          )}
                        </span>
                        <span className="text-lg text-slate-500 line-through mb-1">
                          {formatCurrency(
                            (selectedPackage === "gold" ? (product.priceGold || product.price * 1.5) :
                              selectedPackage === "platinum" ? (product.pricePlatinum || product.price * 2.5) :
                                product.price) * 2
                          )}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-red-500 uppercase tracking-tighter">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          Ưu đãi giới hạn - Giảm 50% chỉ hôm nay
                        </span>
                        {selectedPackage !== 'standard' && (
                          <p className="text-[10px] text-primary-300 italic">
                            * Gói {selectedPackage.toUpperCase()} đã bao gồm bản quyền Trợ lý AI tiêu chuẩn.
                          </p>
                        )}
                      </div>
                    </div>

                    <AddToCartButton
                      product={{
                        ...product,
                        price: selectedPackage === "gold" ? (product.priceGold || product.price * 1.5) :
                          selectedPackage === "platinum" ? (product.pricePlatinum || product.price * 2.5) :
                            product.price,
                        packageType: selectedPackage
                      }}
                    />
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
                  href="tel:0363189699"
                  className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 px-10 py-4 text-xl font-black uppercase shadow-xl shadow-primary-400/40 flex items-center gap-3 transition-all hover:scale-105"
                >
                  <Bot className="w-6 h-6" />
                  0363 189 699
                </a>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Hoặc Chat qua Zalo</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={{}} />
    </div>
  );
}
