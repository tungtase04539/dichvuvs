"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, Zap, Crown, Award, ArrowRight, Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export default function GoiDichVuPage() {
    const [globalSettings, setGlobalSettings] = useState<Record<string, string>>({});
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [settingsRes, productsRes] = await Promise.all([
                    fetch("/api/admin/settings"),
                    fetch("/api/products")
                ]);
                const settingsData = await settingsRes.json();
                const productsData = await productsRes.json();

                if (settingsData.settings) setGlobalSettings(settingsData.settings);
                if (productsData.products) setProducts(productsData.products);
            } catch (error) {
                console.error("Fetch data error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handlePurchase = (pkgId: string) => {
        if (pkgId === "standard") {
            router.push("/san-pham");
            return;
        }

        // For Gold/Platinum, we need to pick a product to add to cart
        const featuredProduct = products.find(p => p.featured) || products[0];

        if (featuredProduct) {
            const cart = [{ id: featuredProduct.id, quantity: 1, packageType: pkgId }];
            sessionStorage.setItem("cart", JSON.stringify(cart));
            router.push("/dat-hang");
        } else {
            // Fallback if no products exist
            router.push("/san-pham");
        }
    };

    const priceGold = globalSettings.price_gold ? parseFloat(globalSettings.price_gold) : 600000;
    const pricePlatinum = globalSettings.price_platinum ? parseFloat(globalSettings.price_platinum) : 1999999;
    const priceStandard = globalSettings.price_standard ? parseFloat(globalSettings.price_standard) : 29000;

    const featuresGoldStr = globalSettings.features_gold || "Hỗ trợ 24/7\nTặng ChatGPT Plus 1 tháng\nTặng Capcut Pro 28 ngày\nTặng AI VIP\nTặng Tài liệu Marketing";
    const featuresPlatinumStr = globalSettings.features_platinum || "Hỗ trợ 24/7\nTặng ChatGPT Plus 1 năm\nTặng Capcut Pro 60 ngày\nTặng Canva 1 năm\nTặng full hệ sinh thái AI";
    const featuresStandardStr = globalSettings.features_standard || "Hỗ trợ 24/7\nCộng đồng hỗ trợ lớn mạnh";

    const descriptionGold = globalSettings.description_gold || "Combo 30 Trợ lý + ChatGPT plus 1 tháng + Capcut Pro 28 ngày";
    const descriptionPlatinum = globalSettings.description_platinum || "Combo 30 Trợ lý + ChatGPT plus 1 năm + Capcut Pro 60 ngày + Canva 1 năm + ...";
    const descriptionStandard = globalSettings.description_standard || "Hỗ trợ 24/7 , cộng đồng hỗ trợ lớn mạnh";

    const packages = [
        {
            id: "standard",
            name: "TIÊU CHUẨN",
            price: priceStandard,
            description: descriptionStandard,
            features: featuresStandardStr.split("\n").filter((f: string) => f.trim()),
            cta: "CHỌN TRỢ LÝ AI",
            icon: <Zap className="w-8 h-8 text-slate-400" />
        },
        {
            id: "gold",
            name: "VÀNG (GOLD)",
            price: priceGold,
            description: descriptionGold,
            features: featuresGoldStr.split("\n").filter((f: string) => f.trim()),
            cta: "MUA NGAY",
            popular: true,
            icon: <Crown className="w-8 h-8 text-yellow-500" />
        },
        {
            id: "platinum",
            name: "BẠCH KIM (PLATINUM)",
            price: pricePlatinum,
            description: descriptionPlatinum,
            features: featuresPlatinumStr.split("\n").filter((f: string) => f.trim()),
            cta: "MUA NGAY",
            icon: <Award className="w-8 h-8 text-cyan-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0000] text-white selection:bg-amber-400 selection:text-red-950">
            <Header settings={{ site_phone: "0345 501 969" }} />

            <main className="pt-32 pb-24 overflow-hidden">
                {/* Hero Area */}
                <section className="container mx-auto px-4 text-center mb-20 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-none relative z-10">
                        CHỌN GÓI <span className="text-amber-400 drop-shadow-glow">KHAI XUÂN</span>
                    </h1>
                    <p className="text-xl text-red-100/60 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
                        Nâng tầm hiệu quả công việc với các đặc quyền VIP.
                        Giải pháp trợ lý AI toàn diện cho cá nhân và doanh nghiệp.
                    </p>
                </section>

                {/* Packages Grid */}
                <section className="container mx-auto px-4 relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-4" />
                            <p className="text-amber-400/60 font-black uppercase tracking-widest text-xs animate-pulse">Đang tải cấu hình...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    onClick={() => handlePurchase(pkg.id)}
                                    className={cn(
                                        "group relative isolate p-10 rounded-[3rem] border-4 transition-all duration-500 hover:-translate-y-2 flex flex-col cursor-pointer overflow-hidden",
                                        pkg.id === "platinum"
                                            ? "bg-gradient-to-br from-[#0c1622] via-[#000814] to-[#000000] border-slate-100/40 shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:shadow-[0_0_120px_rgba(255,255,255,0.25)]"
                                            : pkg.popular
                                                ? "bg-gradient-to-br from-[#1a0505] via-[#050000] to-[#000000] border-amber-400/60 shadow-[0_0_80px_rgba(251,191,36,0.15)] hover:shadow-[0_0_120px_rgba(251,191,36,0.25)]"
                                                : "bg-[#0a0000] border-white/10 hover:border-red-500/30 shadow-2xl shadow-black/60",
                                        (pkg.id === "platinum" || pkg.popular) && "before:absolute before:inset-[-3px] before:rounded-[3.2rem] before:pointer-events-none before:blur-[2px] before:z-[-1] before:content-['']",
                                        pkg.id === "platinum" && "before:bg-gradient-to-r before:from-slate-600 before:via-white before:to-slate-600 before:animate-border-sparkle-platinum before:opacity-100 group-hover:before:opacity-100",
                                        pkg.popular && "before:bg-gradient-to-r before:from-red-600 before:via-amber-400 before:to-red-600 before:animate-border-sparkle before:opacity-100 group-hover:before:opacity-100"
                                    )}
                                >
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    {pkg.popular && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-red-950 px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl whitespace-nowrap z-20 border-2 border-white/20">
                                            Phổ biến nhất
                                        </div>
                                    )}
                                    {pkg.id === "platinum" && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl whitespace-nowrap z-20 border-2 border-slate-200">
                                            VIP nhất
                                        </div>
                                    )}

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="mb-10 flex items-center justify-between">
                                            <div className={cn("p-5 rounded-2xl", pkg.id === "platinum" ? "bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" : pkg.popular ? "bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.05)]" : "bg-white/5")}>
                                                {pkg.icon}
                                            </div>
                                            <div className="text-right">
                                                <div className={cn("text-xs font-black uppercase tracking-[0.2em] mb-2", pkg.id === "platinum" ? "text-slate-200" : "text-amber-500/60")}>{pkg.name}</div>
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className="text-5xl font-black text-white tracking-tighter">
                                                        {pkg.price.toLocaleString("vi-VN")}
                                                    </span>
                                                    <span className="text-2xl font-black text-white">đ</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-10 text-slate-50">
                                            <p className="font-bold mb-8 leading-tight min-h-[3rem] text-lg">{pkg.description}</p>
                                            <div className="space-y-5">
                                                {pkg.features.map((feature, i) => (
                                                    <div key={i} className="flex items-start gap-4 text-sm leading-tight">
                                                        <CheckCircle className={cn("w-6 h-6 shrink-0 mt-[-2px]", pkg.id === "platinum" ? "text-white" : "text-amber-400", !pkg.popular && pkg.id !== "platinum" && "opacity-30")} />
                                                        <span className="font-semibold">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePurchase(pkg.id);
                                            }}
                                            className={cn(
                                                "mt-auto block w-full py-6 rounded-2xl text-center font-black uppercase tracking-widest transition-all text-sm relative overflow-hidden group/btn",
                                                pkg.id === "platinum"
                                                    ? "bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                                    : pkg.popular
                                                        ? "bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-xl shadow-amber-400/20"
                                                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                            )}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {pkg.cta}
                                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                            {(pkg.id === "platinum" || pkg.popular) && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Trust Indicators */}
                <section className="mt-32 border-t border-white/5 pt-20">
                    <div className="container mx-auto px-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                        <p className="text-2xl font-black text-white uppercase tracking-tight mb-4">Hơn 5,000 khách hàng đã tin dùng</p>
                        <p className="text-red-100/40 text-sm uppercase tracking-[0.3em] font-black italic">Uy tín - Chất lượng - Tận tâm</p>
                    </div>
                </section>
            </main>

            <Footer settings={{}} />

            <style jsx>{`
                .drop-shadow-glow {
                  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));
                }
                @keyframes shimmer {
                  from { transform: translateX(-100%); }
                  to { transform: translateX(200%); }
                }
                @keyframes border-sparkle {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 100%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes border-sparkle-platinum {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 100%; }
                  100% { background-position: 0% 50%; }
                }
                .animate-border-sparkle {
                  animation: border-sparkle 4s ease infinite;
                  background-size: 200% 200%;
                }
                .animate-border-sparkle-platinum {
                  animation: border-sparkle-platinum 3s linear infinite;
                  background-size: 200% 200%;
                }
                .animate-shimmer {
                  animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
