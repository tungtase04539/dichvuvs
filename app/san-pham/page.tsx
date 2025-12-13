"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import VideoModal from "@/components/VideoModal";
import { ArrowRight, Star, Bot, ShoppingCart, Loader2, Play, Search, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  videoUrl: string | null;
  featured: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const url = categoryParam 
          ? `/api/products?category=${categoryParam}`
          : "/api/products";
        const res = await fetch(url);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      } catch (error) {
        console.error("Load products error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [categoryParam]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

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

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 text-primary-400 rounded-full text-sm font-bold mb-6 border border-primary-400/30 uppercase tracking-wide">
            <Bot className="w-4 h-4" />
            {products.length} SẢN PHẨM
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 uppercase">
            TẤT CẢ <span className="text-primary-400">CHATBOT</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Chọn ChatBot AI phù hợp với nhu cầu kinh doanh của bạn. 
            Mỗi bot chỉ <span className="text-primary-400 font-bold">29K/tháng</span>!
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ChatBot AI..."
              className="w-full pl-12 pr-12 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-all text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
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
              {/* Search Results Info */}
              {searchQuery && (
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-slate-400">
                    Tìm thấy <span className="text-primary-400 font-bold">{filteredProducts.length}</span> kết quả cho "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-primary-400 hover:text-primary-300 font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-slate-800 rounded-2xl border border-slate-700 shadow-sm hover:shadow-xl hover:border-primary-400/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                  >
                    {product.featured && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-400 to-primary-500 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          HOT
                        </span>
                      </div>
                    )}
                    
                    {/* Product Image or Icon - Clickable */}
                    <Link href={`/san-pham/${product.slug}`} className="block">
                      {product.image ? (
                        <div className="relative aspect-video bg-slate-700 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <span className="text-6xl">🤖</span>
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 flex flex-col flex-grow">
                      <Link href={`/san-pham/${product.slug}`}>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
                        {product.description}
                      </p>

                      {/* Bottom Section - Always aligned */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                          <div>
                            <span className="text-xl font-bold text-primary-400">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-slate-500 line-through text-xs ml-2">
                              {formatCurrency(product.price * 2)}
                            </span>
                          </div>
                          <Link 
                            href={`/san-pham/${product.slug}`}
                            className="w-9 h-9 rounded-full bg-primary-400/20 flex items-center justify-center hover:bg-primary-400 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4 text-primary-400 group-hover:text-slate-900 transition-colors" />
                          </Link>
                        </div>

                        {/* Video Demo Button */}
                        {product.videoUrl && (
                          <button
                            onClick={(e) => openVideoModal(e, product)}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-slate-900 rounded-xl font-bold hover:from-primary-300 hover:to-primary-400 transition-all shadow-lg shadow-primary-400/25 hover:shadow-primary-400/40 uppercase"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            XEM VIDEO DEMO
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-16">
                  <Bot className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy ChatBot</h3>
                  <p className="text-slate-400 mb-6">Không có ChatBot nào phù hợp với "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn btn-primary"
                  >
                    XEM TẤT CẢ SẢN PHẨM
                  </button>
                </div>
              )}

              {/* CTA */}
              <div className="text-center bg-gradient-cta rounded-3xl p-12 relative overflow-hidden">
                <div className="absolute inset-0 pattern-dots opacity-10" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-4 uppercase">
                    Không biết chọn ChatBot nào?
                  </h2>
                  <p className="text-slate-300 mb-6 max-w-xl mx-auto">
                    Liên hệ với chúng tôi để được tư vấn miễn phí. Đội ngũ chuyên gia sẽ giúp bạn chọn ChatBot phù hợp nhất!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/dat-hang"
                      className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 font-bold uppercase shadow-lg shadow-primary-400/30"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      MUA NHIỀU CHATBOT
                    </Link>
                    <a
                      href="tel:0363189699"
                      className="btn bg-transparent text-primary-400 border-2 border-primary-400/50 hover:bg-primary-400/10 font-bold uppercase"
                    >
                      TƯ VẤN: 0363 189 699
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
        youtubeUrl={videoModal.url}
        title={videoModal.title}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900">
        <Header settings={{}} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
        <Footer settings={{}} />
        <ChatWidget />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
