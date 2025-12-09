"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ArrowRight, Star, Bot, ShoppingCart, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  icon: string | null;
  featured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from("Service")
        .select("id, name, slug, description, price, icon, featured")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("name");

      if (data) setProducts(data);
      setIsLoading(false);
    };

    loadProducts();
  }, []);

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
                  <Link
                    key={product.id}
                    href={`/san-pham/${product.slug}`}
                    className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1"
                  >
                    {product.featured && (
                      <div className="absolute -top-3 -right-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          HOT
                        </span>
                      </div>
                    )}
                    
                    <div className="text-5xl mb-4">{product.icon}</div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-slate-400 line-through text-sm ml-2">
                          {formatCurrency(product.price * 2)}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                        <ArrowRight className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
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
    </div>
  );
}
