"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import VideoModal from "@/components/VideoModal";
import { ArrowRight, Star, Bot, ShoppingCart, Loader2, Play } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  icon: string | null;
  image: string | null;
  videoUrl: string | null;
  featured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from("Service")
        .select("id, name, slug, description, price, icon, image, videoUrl, featured")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("name");

      if (data) setProducts(data);
      setIsLoading(false);
    };

    loadProducts();
  }, []);

  const openVideoModal = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.videoUrl) {
      setVideoModal({
        isOpen: true,
        url: product.videoUrl,
        title: `Video Demo - ${product.name}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Bot className="w-4 h-4" />
            {products.length} sản phẩm
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Tất cả <span className="text-accent-300">ChatBot</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Chọn ChatBot AI phù hợp với nhu cầu kinh doanh của bạn. 
            Mỗi bot chỉ <span className="text-white font-bold">30.000đ</span>!
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <Link href={`/san-pham/${product.slug}`} className="block">
                      {product.featured && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                            <Star className="w-3 h-3 fill-current" />
                            HOT
                          </span>
                        </div>
                      )}
                      
                      {/* Product Image or Icon */}
                      {product.image ? (
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                          <span className="text-6xl">{product.icon}</span>
                        </div>
                      )}

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-xl font-bold text-primary-600">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-slate-400 line-through text-xs ml-2">
                              {formatCurrency(product.price * 2)}
                            </span>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                            <ArrowRight className="w-4 h-4 text-primary-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Video Demo Button */}
                    {product.videoUrl && (
                      <div className="px-5 pb-5 pt-0">
                        <button
                          onClick={(e) => openVideoModal(e, product)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Xem Video Demo
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center bg-gradient-cta rounded-3xl p-12 relative overflow-hidden">
                <div className="absolute inset-0 pattern-dots opacity-10" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Không biết chọn ChatBot nào?
                  </h2>
                  <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                    Liên hệ với chúng tôi để được tư vấn miễn phí. Đội ngũ chuyên gia sẽ giúp bạn chọn ChatBot phù hợp nhất!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/dat-hang"
                      className="btn btn-white"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Mua nhiều ChatBot
                    </Link>
                    <a
                      href="tel:19008686"
                      className="btn bg-transparent text-white border-2 border-white/30 hover:bg-white/10"
                    >
                      Tư vấn: 1900 8686
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer settings={{}} />
      <ChatWidget />

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
        videoUrl={videoModal.url}
        title={videoModal.title}
      />
    </div>
  );
}
