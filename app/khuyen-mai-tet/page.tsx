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
        <div className="min-h-screen bg-gradient-to-br from-[#064e3b] via-[#052e16] to-[#022c22] text-white overflow-x-hidden relative">
            <Header settings={{}} />

            {/* Tet Decorations - Floating Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Peach Blossoms */}
                <div className="absolute top-20 left-[10%] text-5xl animate-float-slow opacity-80">🌸</div>
                <div className="absolute top-40 right-[15%] text-4xl animate-float-delayed opacity-70">🌸</div>
                <div className="absolute bottom-40 left-[5%] text-6xl animate-float opacity-90">🌸</div>
                <div className="absolute top-[60%] right-[10%] text-5xl animate-float-slow opacity-60">🌸</div>

                {/* Firecrackers */}
                <div className="absolute top-10 right-10 text-7xl animate-wiggle opacity-40">🧨</div>
                <div className="absolute bottom-10 left-10 text-7xl animate-wiggle opacity-40">🧨</div>

                {/* Golden Sparkles */}
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-300 rounded-full animate-ping delay-700" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden text-center">
                {/* Traditional Pattern Overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 font-bold uppercase tracking-widest mb-8 animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <Flame className="w-5 h-5 fill-current" />
                        SỰ KIỆN TẾT BÍNH NGỌ 2026 - GIẢM GIÁ CỰC MẠNH
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        XẢ KHO <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">ĐÓN XUÂN</span><br />
                        <span className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">SALE UP TO 70%</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-emerald-50/90 max-w-2xl mx-auto mb-12 font-medium">
                        Cơ hội sở hữu ChatBot AI chuyên nghiệp với mức giá hời nhất trong năm.
                        Nâng cấp kinh doanh, bứt phá doanh thu ngay đầu năm mới!
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
                                    <div className="w-20 h-24 sm:w-28 sm:h-32 bg-red-600/10 backdrop-blur-xl border border-red-500/30 rounded-2xl flex items-center justify-center text-4xl sm:text-6xl font-black text-yellow-400 shadow-[0_10px_40px_rgba(220,38,38,0.2)]">
                                        {String(t.v).padStart(2, '0')}
                                    </div>
                                    <span className="mt-2 text-xs uppercase font-bold text-yellow-500/70 tracking-widest">{t.l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/dat-hang"
                            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-yellow-400 text-red-700 font-black text-2xl rounded-2xl hover:bg-white transition-all shadow-[0_10px_30px_rgba(250,204,21,0.4)] hover:scale-105"
                        >
                            <ShoppingCart className="w-8 h-8" />
                            SĂN DEAL NGAY
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Promotion Features */}
            <section className="py-20 bg-black/30 backdrop-blur-sm border-t border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { t: "Lì Xì May Mắn", d: "Mua gói 3 Bot tặng thêm 1 tháng sử dụng", i: "🧧" },
                            { t: "Combo Khởi Đầu", d: "Ưu đãi trọn bộ kịch bản bán hàng Tết", i: "🌸" },
                            { t: "Hỗ Trợ Xuyên Tết", d: "Đội ngũ kỹ thuật trực 24/7 phục vụ bạn", i: "⚡" },
                        ].map((f, i) => (
                            <div key={i} className="group flex flex-col items-center text-center p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-red-600/10 hover:border-red-500/30 transition-all duration-500">
                                <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{f.i}</span>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 text-yellow-400">{f.t}</h3>
                                    <p className="text-emerald-100/70 text-lg leading-relaxed">{f.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product List */}
            <section className="py-24 relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 p-20 opacity-10 text-8xl pointer-events-none">🌸</div>
                <div className="absolute bottom-0 left-0 p-20 opacity-10 text-8xl pointer-events-none">🧧</div>

                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">Sản phẩm <span className="text-yellow-400">Đón Tết</span></h2>
                            <div className="h-2 w-48 bg-red-600 rounded-full mx-auto md:mx-0"></div>
                        </div>
                        <Link href="/san-pham" className="group px-6 py-3 bg-white/10 hover:bg-yellow-400 hover:text-red-700 border border-white/20 font-bold rounded-xl transition-all flex items-center gap-3">
                            Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map(p => (
                            <div key={p.id} className="group bg-[#042f2e]/50 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden hover:border-yellow-400/50 transition-all duration-500 hover:-translate-y-3 shadow-2xl">
                                <div className="aspect-[4/3] bg-emerald-900/50 relative overflow-hidden">
                                    {p.image ? (
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-8xl opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500">🤖</div>
                                    )}
                                    {/* Discount Overlay */}
                                    <div className="absolute top-6 left-6 px-5 py-2 bg-red-600 text-white font-black rounded-full text-sm shadow-2xl animate-pulse">
                                        LÌ XÌ -50%
                                    </div>
                                    <div className="absolute top-6 right-6 text-2xl group-hover:animate-bounce-soft transition-all">🏮</div>
                                </div>
                                <div className="p-10">
                                    <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-yellow-400 transition-colors uppercase">{p.name}</h3>
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="text-4xl font-black text-yellow-400">{formatCurrency(p.price)}</span>
                                        <span className="text-xl text-white/30 line-through font-bold">{formatCurrency(p.price * 2)}</span>
                                    </div>
                                    <Link
                                        href={`/san-pham/${p.slug}`}
                                        className="w-full py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-yellow-400 hover:to-yellow-500 hover:text-red-900 text-white flex items-center justify-center gap-3 font-black rounded-[1.5rem] transition-all duration-300 uppercase shadow-lg shadow-red-950/60"
                                    >
                                        MUA NGAY <Sparkles className="w-6 h-6 animate-twinkle" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Urgency Section */}
            <section className="py-32 relative text-center overflow-hidden border-t border-white/5">
                {/* Background Decorations */}
                <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-[radial-gradient(circle,rgba(220,38,38,0.15)_0%,transparent_70%)]" />

                <div className="container mx-auto px-4 relative z-10">
                    <Sparkles className="w-20 h-20 text-yellow-400/20 mx-auto mb-8 animate-spin-slow" />
                    <h2 className="text-5xl md:text-8xl font-black mb-8 uppercase leading-tight tracking-tighter drop-shadow-2xl">
                        KHAI XUÂN <span className="text-red-500">NHƯ Ý</span><br />
                        <span className="text-yellow-400">PHÁT TÀI PHÁT LỘC</span>
                    </h2>
                    <p className="text-2xl text-emerald-50/70 max-w-3xl mx-auto mb-16 leading-relaxed">
                        Hàng ngàn doanh nghiệp đã ứng dụng ChatBot AI và tăng trưởng vượt bậc.
                        Năm nay sẽ là năm của bạn cùng đồng hành với ChatBot VN!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link
                            href="/dat-hang"
                            className="px-16 py-8 bg-yellow-400 text-red-700 font-black text-3xl rounded-[2rem] hover:bg-white transition-all shadow-2xl shadow-yellow-400/30 scale-110 active:scale-100"
                        >
                            ĐẶT HÀNG NGAY 🧨
                        </Link>
                        <a
                            href="tel:0363189699"
                            className="px-16 py-8 border-4 border-white/20 text-white font-black text-3xl rounded-[2rem] hover:bg-white hover:text-red-700 transition-all flex items-center gap-4"
                        >
                            Tư Vấn <Sparkles className="w-8 h-8" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer settings={{}} />

            <style jsx global>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0) rotate(0); }
                  50% { transform: translateY(-30px) rotate(10deg); }
                }
                @keyframes float-slow {
                  0%, 100% { transform: translateY(0) rotate(0); }
                  50% { transform: translateY(-50px) rotate(-15deg); }
                }
                @keyframes float-delayed {
                  0%, 100% { transform: translateY(0) rotate(0); }
                  50% { transform: translateY(-40px) rotate(20deg); }
                }
                @keyframes wiggle {
                  0%, 100% { transform: rotate(-5deg); }
                  50% { transform: rotate(5deg); }
                }
                @keyframes twinkle {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(0.8); }
                }
                @keyframes spin-slow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes bounce-soft {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                
                .animate-float { animation: float 6s infinite ease-in-out; }
                .animate-float-slow { animation: float-slow 10s infinite ease-in-out; }
                .animate-float-delayed { animation: float-delayed 8s infinite ease-in-out; }
                .animate-wiggle { animation: wiggle 2s infinite ease-in-out; }
                .animate-twinkle { animation: twinkle 1s infinite ease-in-out; }
                .animate-spin-slow { animation: spin-slow 15s linear infinite; }
                .animate-bounce-soft { animation: bounce-soft 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
}
