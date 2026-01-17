"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Bot, Star, Sparkles, MessageCircle, Copy, Check, ArrowLeft, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  isTrial: boolean;
  trialCode: string | null;
  chatbotLink: string | null;
}

export default function FreeTrialPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadTrialProducts = async () => {
      try {
        const res = await fetch("/api/products?isTrial=true");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Load trial products error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrialProducts();
  }, []);

  const handleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0000] text-white selection:bg-amber-400 selection:text-red-950 overflow-x-hidden">
      <Header settings={{ site_phone: "0345 501 969" }} />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/10 text-amber-400 rounded-full text-sm font-bold mb-6 border border-amber-400/20 uppercase tracking-widest relative z-10">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Trải nghiệm không giới hạn
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-none relative z-10">
            DÙNG THỬ <span className="text-amber-400 drop-shadow-glow">MIỄN PHÍ</span>
          </h1>

          <p className="text-xl text-red-100/60 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
            Khám phá sức mạnh của các trợ lý AI hàng đầu hoàn toàn miễn phí.
            Chọn trợ lý bạn muốn và bắt đầu ngay hôm nay!
          </p>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 relative z-10">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 text-amber-400/60 hover:text-amber-400 font-bold uppercase tracking-widest text-xs mb-12 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Xem tất cả sản phẩm
          </Link>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
              <p className="text-amber-400/60 font-black uppercase tracking-widest text-xs">Đang tải trợ lý...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "relative h-[450px] preserve-3d transition-all duration-700 cursor-pointer",
                    flippedCards[product.id] ? "flipped" : ""
                  )}
                  onClick={() => handleFlip(product.id)}
                >
                  {/* Front Face */}
                  <div className="absolute inset-0 backface-hidden group p-8 rounded-[2.5rem] border-2 border-white/10 bg-zinc-900 overflow-hidden flex flex-col hover:border-amber-400/50 transition-colors shadow-2xl shadow-black/60">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />

                    {/* Image/Icon */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-black flex items-center justify-center border border-white/5">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🤖</span>
                      )}
                      <div className="absolute top-3 right-3 bg-amber-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                        FREE TRIAL
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-red-100/40 text-sm line-clamp-3 mb-6 font-medium leading-relaxed italic">
                      {product.description}
                    </p>

                    <div className="mt-auto">
                      <div className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-white group-hover:bg-amber-400 group-hover:text-black transition-all">
                        Trải nghiệm ngay
                      </div>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-[2.5rem] border-2 border-amber-400 bg-black shadow-[0_0_50px_rgba(251,191,36,0.2)] flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />

                    <Bot className="w-12 h-12 text-amber-400 mb-6 animate-float" />

                    <h4 className="text-amber-400 font-black text-sm uppercase tracking-[0.2em] mb-8 border-b border-amber-400/20 pb-4 w-full">
                      THÔNG TIN TRUY CẬP
                    </h4>

                    <div className="w-full space-y-6">
                      {/* Link Button */}
                      <div className="space-y-3 w-full">
                        <a
                          href={product.chatbotLink || "https://t.me/your_bot"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-3 w-full py-4 bg-amber-400 text-black rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Mở Trợ Lý AI
                        </a>

                        <a
                          href="https://zalo.me/g/nfcsbd681"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                        >
                          <Users className="w-5 h-5" />
                          Tham gia Zalo
                        </a>
                      </div>

                      {/* verification code */}
                      {product.trialCode && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/60 text-left px-2">Mã xác minh</p>
                          <div className="relative group/copy">
                            <div className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-amber-400 text-lg flex items-center justify-center gap-3">
                              {product.trialCode}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(product.trialCode || "", product.id);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                {copiedId === product.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            {copiedId === product.id && (
                              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                                Đã sao chép!
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="mt-8 text-[10px] text-red-100/40 font-bold uppercase tracking-widest italic animate-pulse">
                      Số lượng người dùng cùng lúc có hạn!
                    </p>

                    <button className="mt-8 text-xs text-amber-400/40 font-black uppercase tracking-widest hover:text-amber-400 transition-colors">
                      🠔 Quay lại
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
              <Bot className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Chưa có trợ lý dùng thử</h3>
              <p className="text-red-100/40 max-w-md mx-auto mb-8 font-medium italic">
                Chúng tôi đang cập nhật các trợ lý AI mới nhất. Vui lòng quay lại sau!
              </p>
              <Link href="/san-pham" className="px-10 py-4 bg-amber-400 text-black font-black uppercase rounded-2xl hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20 active:scale-95 inline-block">
                Xem tất cả trợ lý
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer settings={{}} />

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
          perspective: 1200px;
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));
        }
      `}</style>
    </div>
  );
}
