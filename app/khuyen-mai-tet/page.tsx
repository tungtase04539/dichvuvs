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

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white overflow-x-hidden relative">
            <Header settings={{}} />

            {/* Tet Decorations - Floating Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Peach Blossoms */}
                <div className="absolute top-20 left-[10%] text-5xl animate-float-slow opacity-90 drop-shadow-lg">🌸</div>
                <div className="absolute top-40 right-[15%] text-4xl animate-float-delayed opacity-80 drop-shadow-lg">🌸</div>
                <div className="absolute bottom-40 left-[5%] text-6xl animate-float opacity-100 drop-shadow-xl">🌸</div>
                <div className="absolute top-[60%] right-[10%] text-5xl animate-float-slow opacity-70 drop-shadow-lg">🌸</div>

                {/* Firecrackers */}
                <div className="absolute top-10 right-10 text-7xl animate-wiggle opacity-60 drop-shadow-2xl">🧨</div>
                <div className="absolute bottom-10 left-10 text-7xl animate-wiggle opacity-60 drop-shadow-2xl">🧨</div>

                {/* Golden Sparkles */}
                <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-ping shadow-[0_0_10px_#fde047]" />
                <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white rounded-full animate-ping delay-700 shadow-[0_0_15px_#fff]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden text-center">
                {/* Traditional Pattern Overlay */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 border border-white/30 rounded-full text-white font-black uppercase tracking-widest mb-8 animate-bounce shadow-xl">
                        <Flame className="w-5 h-5 fill-current text-yellow-300" />
                        SỰ KIỆN TẾT BÍNH NGỌ 2026 - GIẢM GIÁ CỰC MẠNH
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black mb-8 leading-tight uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-white">
                        XẢ KHO <span className="text-yellow-300">ĐÓN XUÂN</span><br />
                        <span className="text-white bg-red-600 px-6 py-2 rounded-2xl inline-block mt-4 shadow-2xl border-4 border-yellow-400 rotate-[-2deg]">SALE 70%</span>
                    </h1>

                    <p className="text-2xl md:text-3xl text-white font-bold max-w-2xl mx-auto mb-16 drop-shadow-md">
                        Cơ hội sở hữu Trợ lý AI chuyên nghiệp với mức giá hời nhất trong năm.
                        Nâng cấp kinh doanh ngay đầu năm mới!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link
                            href="/dat-hang"
                            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-white text-red-600 font-black text-3xl rounded-3xl hover:bg-yellow-400 hover:text-red-700 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 border-b-8 border-gray-200 hover:border-yellow-600"
                        >
                            <ShoppingCart className="w-10 h-10" />
                            SĂN DEAL NGAY
                            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Promotion Features */}
            <section className="py-24 bg-white/10 backdrop-blur-md border-y-4 border-white/20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { t: "Lì Xì May Mắn", d: "Mua gói 3 Bot tặng thêm 1 tháng sử dụng", i: "🧧" },
                            { t: "Combo Khởi Đầu", d: "Ưu đãi trọn bộ kịch bản bán hàng Tết", i: "🌸" },
                            { t: "Hỗ Trợ Xuyên Tết", d: "Đội ngũ kỹ thuật trực 24/7 phục vụ bạn", i: "⚡" },
                        ].map((f, i) => (
                            <div key={i} className="group flex flex-col items-center text-center p-10 bg-white rounded-[3rem] shadow-2xl hover:-translate-y-4 transition-all duration-500 border-b-8 border-orange-200">
                                <span className="text-7xl mb-6 transform group-hover:scale-125 transition-transform duration-500 drop-shadow-lg">{f.i}</span>
                                <div>
                                    <h3 className="text-3xl font-black mb-3 text-red-600 uppercase">{f.t}</h3>
                                    <p className="text-gray-700 text-xl font-medium leading-relaxed">{f.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product List */}
            <section className="py-24 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 p-20 opacity-20 text-9xl pointer-events-none animate-spin-slow">🌸</div>
                <div className="absolute bottom-0 left-0 p-20 opacity-20 text-9xl pointer-events-none animate-wiggle">🧧</div>

                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 text-white drop-shadow-xl">Sản phẩm <span className="text-yellow-300 underline decoration-white decoration-wavy">Đón Tết</span></h2>
                        </div>
                        <Link href="/san-pham" className="group px-8 py-4 bg-red-600 hover:bg-white hover:text-red-700 text-white font-black text-xl rounded-2xl transition-all flex items-center gap-3 shadow-xl border-4 border-yellow-400">
                            Xem tất cả <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {products.map(p => (
                            <div key={p.id} className="group bg-white rounded-[4rem] overflow-hidden border-4 border-yellow-400/30 hover:border-yellow-400 transition-all duration-500 hover:-translate-y-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                                <div className="aspect-[4/3] bg-orange-100 relative overflow-hidden">
                                    {p.image ? (
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-9xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">🤖</div>
                                    )}
                                    {/* Discount Overlay */}
                                    <div className="absolute top-6 left-6 px-6 py-3 bg-red-600 text-white font-black rounded-full text-lg shadow-2xl animate-pulse border-2 border-yellow-400">
                                        LÌ XÌ -50%
                                    </div>
                                    <div className="absolute bottom-6 right-6 text-4xl group-hover:animate-bounce-soft transition-all grayscale-0">🏮</div>
                                </div>
                                <div className="p-10">
                                    <h3 className="text-3xl font-black mb-4 text-red-700 uppercase leading-none group-hover:text-red-600 transition-colors">{p.name}</h3>
                                    <div className="flex items-center gap-4 mb-10">
                                        <span className="text-4xl font-black text-red-600">{formatCurrency(p.price)}</span>
                                        <span className="text-xl text-gray-400 line-through font-bold">{formatCurrency(p.price * 2)}</span>
                                    </div>
                                    <Link
                                        href={`/san-pham/${p.slug}`}
                                        className="w-full py-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-yellow-400 hover:to-yellow-500 hover:text-red-900 text-white flex items-center justify-center gap-3 font-black rounded-[2rem] transition-all duration-300 uppercase shadow-xl shadow-red-900/30 text-xl border-b-4 border-red-950"
                                    >
                                        MUA NGAY <Sparkles className="w-8 h-8 animate-twinkle" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Urgency Section */}
            <section className="py-32 relative text-center overflow-hidden border-t-8 border-yellow-400 bg-red-600">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <Sparkles className="w-24 h-24 text-yellow-300 mx-auto mb-10 animate-spin-slow drop-shadow-xl" />
                    <h2 className="text-6xl md:text-9xl font-black mb-10 uppercase leading-tight tracking-tighter drop-shadow-2xl text-white">
                        KHAI XUÂN <span className="underline decoration-yellow-400 decoration-wavy">NHƯ Ý</span><br />
                        <span className="text-yellow-300">PHÁT TÀI PHÁT LỘC</span>
                    </h2>
                    <p className="text-3xl text-white font-bold max-w-4xl mx-auto mb-20 leading-relaxed drop-shadow-md">
                        Hàng ngàn doanh nghiệp đã ứng dụng Trợ lý AI và bứt phá doanh số.
                        Năm Bính Ngọ 2026 sẽ là năm rực rỡ nhất của bạn!
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                        <Link
                            href="/dat-hang"
                            className="px-20 py-8 bg-yellow-400 text-red-800 font-black text-4xl rounded-[2.5rem] hover:bg-white hover:text-red-600 transition-all shadow-[0_30px_60px_-10px_rgba(0,0,0,0.4)] scale-110 active:scale-100 border-b-8 border-yellow-600 active:border-b-0 uppercase"
                        >
                            MUA NGAY 🧨
                        </Link>
                        <a
                            href="tel:0363189699"
                            className="px-20 py-8 border-4 border-white text-white font-black text-4xl rounded-[2.5rem] hover:bg-white hover:text-red-600 transition-all flex items-center gap-4 shadow-xl uppercase"
                        >
                            Tư Vấn <Sparkles className="w-10 h-10" />
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
                  0%, 100% { transform: rotate(-8deg); }
                  50% { transform: rotate(8deg); }
                }
                @keyframes twinkle {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.5; transform: scale(1.2); }
                }
                @keyframes spin-slow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes bounce-soft {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-20px); }
                }
                
                .animate-float { animation: float 6s infinite ease-in-out; }
                .animate-float-slow { animation: float-slow 10s infinite ease-in-out; }
                .animate-float-delayed { animation: float-delayed 8s infinite ease-in-out; }
                .animate-wiggle { animation: wiggle 1.5s infinite ease-in-out; }
                .animate-twinkle { animation: twinkle 1s infinite ease-in-out; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-bounce-soft { animation: bounce-soft 2.5s infinite ease-in-out; }
            `}</style>
        </div>
    );
}
