"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, Zap, Crown, Award, ArrowRight, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`group relative p-10 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col ${pkg.popular
                                    ? "bg-[#250000] border-amber-400 shadow-[0_20px_80px_rgba(251,191,36,0.15)]"
                                    : "bg-[#100000] border-white/5 hover:border-amber-400/30"
                                    }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-red-950 px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl whitespace-nowrap z-20 border-2 border-white/20">
                                        Phổ biến nhất
                                    </div>
                                )}

                                <div className="mb-10 flex items-center justify-between">
                                    <div className={`p-5 rounded-2xl ${pkg.popular ? "bg-amber-400/10" : "bg-white/5"}`}>
                                        {pkg.icon}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-amber-500/40 uppercase tracking-widest mb-1">{pkg.name}</div>
                                        <div className="text-4xl font-black text-white">
                                            {formatCurrency(pkg.price)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <p className="text-red-50/80 font-bold mb-8 leading-tight min-h-[3rem]">{pkg.description}</p>
                                    <div className="space-y-5">
                                        {pkg.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-4 text-sm text-red-50/60 leading-tight">
                                                <CheckCircle className={`w-6 h-6 shrink-0 mt-[-2px] ${pkg.popular ? "text-amber-400" : "text-amber-400/30"}`} />
                                                <span className="font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePurchase(pkg.id)}
                                    className={`mt-auto block w-full py-6 rounded-2xl text-center font-black uppercase tracking-widest transition-all text-sm relative overflow-hidden group/btn ${pkg.popular
                                        ? "bg-amber-400 text-red-950 hover:bg-yellow-400 shadow-xl shadow-amber-400/20"
                                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                        }`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {pkg.cta}
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                    {pkg.popular && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform" />}
                                </button>
                            </div>
                        ))}
                    </div>
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
                .animate-shimmer {
                  animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
