"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Zap, Clock, Star, ArrowRight, ShoppingCart, Flame, Sparkles } from "lucide-react";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string | null;
}

export default function KhuyenMaiTetPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });

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
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 48, minutes: 0, seconds: 0 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#064e3b] text-white overflow-x-hidden">
            <Header settings={{}} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden text-center">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-400/20 border border-emerald-400/30 rounded-full text-emerald-400 font-bold uppercase tracking-widest mb-8 animate-bounce">
                        <Zap className="w-5 h-5 fill-current" />
                        SỰ KIỆN TẾT 2024 - GIẢM GIÁ CỰC MẠNH
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight uppercase">
                        XẢ KHO <span className="text-emerald-400">ĐÓN TẾT</span><br />
                        <span className="text-yellow-400">SALE UP TO 70%</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-emerald-100/80 max-w-2xl mx-auto mb-12">
                        Cơ hội sở hữu ChatBot AI chuyên nghiệp với mức giá hời nhất trong năm.
                        Nâng cấp kinh doanh, bứt phá doanh thu ngay hôm nay!
                    </p>

                    {/* Countdown Wrapper */}
                    <div className="flex flex-col items-center gap-6 mb-16">
                        <div className="flex gap-4 sm:gap-6">
                            {[
                                { v: timeLeft.hours, l: "Giờ" },
                                { v: timeLeft.minutes, l: "Phút" },
                                { v: timeLeft.seconds, l: "Giây" }
                            ].map((t, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-20 h-24 sm:w-28 sm:h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-4xl sm:text-6xl font-black text-emerald-400 shadow-2xl">
                                        {String(t.v).padStart(2, '0')}
                                    </div>
                                    <span className="mt-2 text-xs uppercase font-bold text-emerald-200 tracking-widest">{t.l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/dat-hang"
                        className="group relative inline-flex items-center gap-4 px-12 py-6 bg-emerald-400 text-emerald-950 font-black text-2xl rounded-2xl hover:bg-white transition-all shadow-2xl hover:scale-105"
                    >
                        <ShoppingCart className="w-8 h-8" />
                        SĂN DEAL NGAY
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Promotion Features */}
            <section className="py-20 bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { t: "Combo Tiết Kiệm", d: "Mua gói 3 Bot giảm ngay 30%", i: "📦" },
                            { t: "Quà Tặng VIP", d: "Tặng ngay khóa học đào tạo AI", i: "🎁" },
                            { t: "Hỗ Trợ Thần Tốc", d: "Ưu tiên thiết lập trong 2h", i: "⚡" },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
                                <span className="text-5xl">{f.i}</span>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{f.t}</h3>
                                    <p className="text-emerald-100/60 text-sm">{f.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product List */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-black uppercase">Sản phẩm <span className="text-emerald-400">Hot Sale</span></h2>
                            <div className="h-1.5 w-32 bg-emerald-400 mt-4"></div>
                        </div>
                        <Link href="/san-pham" className="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-2 mb-2">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(p => (
                            <div key={p.id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-emerald-400 transition-all hover:-translate-y-2">
                                <div className="aspect-[4/3] bg-emerald-900/50 relative overflow-hidden">
                                    {p.image ? (
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-8xl opacity-30">🤖</div>
                                    )}
                                    {/* Discount Overlay */}
                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-yellow-400 text-emerald-950 font-black rounded-full text-sm shadow-xl">
                                        -50% TẾT SALE
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-4">{p.name}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-black text-emerald-400">{formatCurrency(p.price)}</span>
                                        <span className="text-lg text-white/30 line-through">{formatCurrency(p.price * 2)}</span>
                                    </div>
                                    <Link
                                        href={`/san-pham/${p.slug}`}
                                        className="mt-8 w-full py-4 bg-white/10 hover:bg-emerald-400 hover:text-emerald-950 border border-white/20 flex items-center justify-center gap-2 font-bold rounded-2xl transition-all"
                                    >
                                        Xem Chi Tiết <Sparkles className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Urgency Section */}
            <section className="py-24 bg-gradient-to-t from-emerald-950 to-emerald-900 text-center relative overflow-hidden">
                <Sparkles className="absolute top-10 left-10 w-20 h-20 text-yellow-400/20 animate-spin-slow" />
                <Sparkles className="absolute bottom-10 right-10 w-32 h-32 text-emerald-400/10 animate-spin-slow" />

                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase leading-tight">
                        NĂM MỚI <span className="text-emerald-400">VẬN HỘI MỚI</span><br />
                        ĐỪNG ĐỂ ĐỐI THỦ VƯỢT MẶT
                    </h2>
                    <p className="text-xl text-emerald-200/60 max-w-2xl mx-auto mb-12">
                        Hàng trăm doanh nghiệp đã ứng dụng ChatBot AI và tăng trưởng vượt bậc trong năm qua.
                        Giờ là lúc của bạn!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/dat-hang"
                            className="px-12 py-6 bg-yellow-400 text-emerald-900 font-black text-2xl rounded-full hover:scale-110 transition-all shadow-2xl shadow-yellow-400/30"
                        >
                            ĐẶT HÀNG NGAY 🚀
                        </Link>
                        <a
                            href="tel:0363189699"
                            className="px-12 py-6 border-2 border-emerald-400 text-emerald-400 font-black text-2xl rounded-full hover:bg-emerald-400/10 transition-all"
                        >
                            TƯ VẤN MIỄN PHÍ
                        </a>
                    </div>
                </div>
            </section>

            <Footer settings={{}} />

            <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
        </div>
    );
}
