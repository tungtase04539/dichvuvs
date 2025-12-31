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
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {product.name}
              </h1>
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
              <div className="bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 uppercase">Mô tả sản phẩm</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Long Description */}
              <div className="bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6 uppercase">Chi tiết sản phẩm</h2>
                <div className="prose prose-slate max-w-none">
                  {product.longDescription ? (
                    <div className="whitespace-pre-wrap text-slate-300">{product.longDescription}</div>
                  ) : (
                    <div className="space-y-6 text-slate-300">
                      <p>
                        <strong className="text-white">{product.name}</strong> là giải pháp ChatBot AI tiên tiến,
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
                            "1 ChatBot AI đã được cấu hình sẵn",
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
              {/* Price Card */}
              <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700">
                {product.videoUrl && getYoutubeEmbedUrl(product.videoUrl) && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black">
                    <iframe
                      src={`${getYoutubeEmbedUrl(product.videoUrl)}?rel=0`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video demo"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary-400 fill-primary-400" />
                  ))}
                  <span className="text-sm text-slate-500 ml-2">(128 đánh giá)</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xl text-slate-500 line-through">
                      {formatCurrency(product.price * 2)}
                    </span>
                  </div>
                  <span className="inline-flex px-3 py-1 bg-red-900/50 text-red-400 text-sm font-bold rounded-full">
                    Giảm 50%
                  </span>
                </div>

                <AddToCartButton
                  product={{
                    ...product,
                    price: selectedPackage === "gold" ? (product.priceGold || product.price) :
                      selectedPackage === "platinum" ? (product.pricePlatinum || product.price) :
                        product.price
                  }}
                />

              </div>

              {/* Package Selection Section */}
              <div className="space-y-4">
                <h3 className="text-white font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary-400" />
                  Chọn gói dịch vụ
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {/* Standard Package */}
                  <div
                    className={`relative group cursor-pointer transition-all preserve-3d h-48 ${flippedCards['standard'] ? 'flipped' : ''}`}
                    onClick={() => {
                      setSelectedPackage("standard");
                      setFlippedCards(prev => ({ ...prev, standard: !prev.standard }));
                    }}
                  >
                    <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 border-2 transition-all ${selectedPackage === "standard" ? "bg-slate-800 border-primary-500 shadow-lg shadow-primary-500/20" : "bg-slate-800/50 border-slate-700 hover:border-slate-600"}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase">Tiêu chuẩn</span>
                        {selectedPackage === "standard" && <CheckCircle className="w-5 h-5 text-primary-500" />}
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">{formatCurrency(product.price)}</div>
                      <p className="text-slate-400 text-xs">Gói cơ bản phù hợp cho cá nhân khởi đầu</p>
                      <div className="absolute bottom-4 right-4 text-primary-400 text-[10px] font-bold uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem ưu đãi <ArrowLeft className="w-3 h-3 rotate-180" />
                      </div>
                    </div>

                    <div className="absolute inset-0 backface-hidden rounded-2xl p-5 bg-slate-700 border-2 border-primary-500 rotate-y-180 flex flex-col justify-center">
                      <h4 className="text-white font-bold mb-3 text-sm">Ưu đãi Tiêu chuẩn:</h4>
                      <ul className="space-y-2">
                        {["Full tính năng cơ bản", "Hỗ trợ cộng đồng", "Update bảo mật"].map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle className="w-3 h-3 text-primary-400" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Gold Package */}
                  <div
                    className={`relative group cursor-pointer transition-all preserve-3d h-48 ${flippedCards['gold'] ? 'flipped' : ''}`}
                    onClick={() => {
                      setSelectedPackage("gold");
                      setFlippedCards(prev => ({ ...prev, gold: !prev.gold }));
                    }}
                  >
                    <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 border-2 transition-all ${selectedPackage === "gold" ? "bg-amber-900/20 border-amber-500 shadow-lg shadow-amber-500/20" : "bg-amber-900/10 border-amber-900/30 hover:border-amber-500/50"}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-amber-400 text-xs font-bold uppercase flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          Gói VÀNG
                        </span>
                        {selectedPackage === "gold" && <CheckCircle className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="text-2xl font-bold text-amber-400 mb-2">{formatCurrency(product.priceGold || product.price * 1.5)}</div>
                      <p className="text-amber-100/60 text-xs">Phù hợp cho doanh nghiệp đang phát triển</p>
                      <div className="absolute bottom-4 right-4 text-amber-400 text-[10px] font-bold uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem ưu đãi <ArrowLeft className="w-3 h-3 rotate-180" />
                      </div>
                    </div>

                    <div className="absolute inset-0 backface-hidden rounded-2xl p-5 bg-amber-900 border-2 border-amber-500 rotate-y-180 flex flex-col justify-center">
                      <h4 className="text-white font-bold mb-3 text-sm">Ưu đãi gói Vàng:</h4>
                      <ul className="space-y-2">
                        {(product.featuresGold?.split('\n') || ["Hỗ trợ ưu tiên", "Tùy chỉnh linh hoạt", "Theo dõi nâng cao"]).map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-amber-100 font-medium">
                            <CheckCircle className="w-3 h-3 text-amber-400" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Platinum Package */}
                  <div
                    className={`relative group cursor-pointer transition-all preserve-3d h-48 ${flippedCards['platinum'] ? 'flipped' : ''}`}
                    onClick={() => {
                      setSelectedPackage("platinum");
                      setFlippedCards(prev => ({ ...prev, platinum: !prev.platinum }));
                    }}
                  >
                    <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 border-2 transition-all ${selectedPackage === "platinum" ? "bg-cyan-900/20 border-cyan-400 shadow-lg shadow-cyan-400/20" : "bg-cyan-900/10 border-cyan-900/30 hover:border-cyan-400/50"}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-cyan-400 text-xs font-bold uppercase flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          BACH KIM
                        </span>
                        {selectedPackage === "platinum" && <CheckCircle className="w-5 h-5 text-cyan-400" />}
                      </div>
                      <div className="text-2xl font-bold text-cyan-400 mb-2">{formatCurrency(product.pricePlatinum || product.price * 2.5)}</div>
                      <p className="text-cyan-100/60 text-xs">Giải pháp tối thượng cho tập đoàn lớn</p>
                      <div className="absolute bottom-4 right-4 text-cyan-400 text-[10px] font-bold uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem ưu đãi <ArrowLeft className="w-3 h-3 rotate-180" />
                      </div>
                    </div>

                    <div className="absolute inset-0 backface-hidden rounded-2xl p-5 bg-cyan-950 border-2 border-cyan-400 rotate-y-180 flex flex-col justify-center">
                      <h4 className="text-white font-bold mb-3 text-sm">Ưu đãi Bạch Kim:</h4>
                      <ul className="space-y-2">
                        {(product.featuresPlatinum?.split('\n') || ["Full giải pháp AI", "Kỹ thuật hỗ trợ 1-1", "SLA cam kết 99.9%"]).map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-cyan-100 font-medium">
                            <CheckCircle className="w-3 h-3 text-cyan-400" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
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

              {/* Contact Card */}
              <div className="bg-gradient-cta rounded-2xl p-6 text-white border border-primary-400/20">
                <h3 className="font-bold text-lg mb-2 text-primary-400 uppercase">CẦN TƯ VẤN?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Liên hệ ngay để được hỗ trợ chọn ChatBot phù hợp
                </p>
                <a
                  href="tel:0363189699"
                  className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 w-full font-bold uppercase shadow-lg shadow-primary-400/30"
                >
                  <Bot className="w-5 h-5" />
                  0363 189 699
                </a>
              </div>


            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8 uppercase">ChatBot liên quan</h2>
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
        </div>
      </main>

      <Footer settings={{}} />
    </div>
  );
}
