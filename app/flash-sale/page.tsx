"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Zap, Clock, Gift, Star, ArrowRight, ShoppingCart, Flame } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
}

export default function FlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data } = await supabase
        .from("Service")
        .select("id, name, slug, description, price, image")
        .eq("active", true)
        .limit(6);

      if (data) setProducts(data);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const gifts = [
    "🎁 Mua 2 tặng 1 ChatBot miễn phí",
    "📚 Tặng khóa học sử dụng ChatBot",
    "💎 Giảm thêm 20% cho đơn từ 3 bot",
    "🎯 Hỗ trợ cài đặt miễn phí 100%",
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-900 via-slate-900 to-orange-900 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-bold uppercase tracking-wide mb-6 border border-red-500/30 animate-pulse">
            <Flame className="w-4 h-4" />
            FLASH SALE - GIẢM SỐC
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase">
            <span className="text-red-500">SALE</span> KHỦNG
            <span className="block text-primary-400">GIẢM ĐẾN 50%</span>
          </h1>

          {/* Countdown */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { value: timeLeft.hours, label: "Giờ" },
              { value: timeLeft.minutes, label: "Phút" },
              { value: timeLeft.seconds, label: "Giây" },
            ].map((item, index) => (
              <div key={index} className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 min-w-[80px] border border-slate-700">
                <div className="text-4xl font-bold text-primary-400">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-xs text-slate-400 uppercase">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="text-xl text-slate-300 mb-8">
            Mua ngay kẻo lỡ! Ưu đãi có hạn trong hôm nay!
          </p>

          <Link
            href="/dat-hang"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 text-lg uppercase transition-all hover:scale-105"
          >
            <ShoppingCart className="w-6 h-6" />
            MUA NGAY - CHỈ 29K
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Gifts Banner */}
      <section className="py-8 bg-primary-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {gifts.map((gift, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-900 font-bold">
                {gift}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">
              SẢN PHẨM <span className="text-red-500">FLASH SALE</span>
            </h2>
            <p className="text-slate-400">Giảm giá sốc - Số lượng có hạn</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="relative bg-slate-700/50 rounded-2xl border border-slate-700 overflow-hidden group hover:border-red-500/50 transition-all"
              >
                {/* Sale Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    <Zap className="w-3 h-3" />
                    -50%
                  </span>
                </div>

                {/* Product Image */}
                <div className="aspect-video bg-slate-700 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">🤖</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-red-500">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-slate-500 line-through text-sm ml-2">
                        {formatCurrency(product.price * 2)}
                      </span>
                    </div>
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors uppercase text-sm"
                    >
                      MUA NGAY
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-red-900 to-orange-900">
        <div className="container mx-auto px-4 text-center">
          <Gift className="w-16 h-16 text-primary-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase">
            MUA NGAY - NHẬN QUÀ LIỀN TAY
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Đặt hàng trong hôm nay để nhận thêm quà tặng đặc biệt trị giá 500.000đ
          </p>
          <Link
            href="/dat-hang"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 shadow-lg text-lg uppercase transition-all"
          >
            <ShoppingCart className="w-6 h-6" />
            ĐẶT HÀNG NGAY
          </Link>
        </div>
      </section>

      <Footer settings={{}} />
    </div>
  );
}

