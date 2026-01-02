"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    Users,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    MessageCircle,
    DollarSign,
    Zap,
    Loader2,
    ShieldCheck
} from "lucide-react";

export default function CTVRecruitmentPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        website: "", // Honeypot field
    });
    const [pageLoadTime] = useState(Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Anti-spam: check if submission is too fast (less than 3 seconds)
        const timeElapsed = Date.now() - pageLoadTime;
        if (timeElapsed < 3000) {
            setError("Vui lòng điền thông tin cẩn thận.");
            return;
        }

        // Basic phone validation (VN format)
        const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/ctv/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Có lỗi xảy ra");
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        {
            icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
            title: "Hoa hồng hấp dẫn",
            description: "Nhận hoa hồng lên đến 30% cho mỗi dịch vụ trợ lý AI được kích hoạt thành công."
        },
        {
            icon: <Zap className="w-6 h-6 text-primary-400" />,
            title: "Sản phẩm xu hướng",
            description: "AI đang là xu hướng bùng nổ, nhu cầu doanh nghiệp cực lớn, rất dễ để tư vấn và chốt sales."
        },
        {
            icon: <MessageCircle className="w-6 h-6 text-blue-400" />,
            title: "Hỗ trợ 24/7",
            description: "Được tham gia nhóm Zalo hỗ trợ riêng, đào tạo kiến thức sản phẩm và kỹ năng bán hàng."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
            title: "Hệ thống chuyên nghiệp",
            description: "Quản lý đơn hàng, hoa hồng và khách hàng minh bạch qua dashboard riêng."
        }
    ];

    return (
        <div className="min-h-screen bg-[#1a0101] text-white">
            <Header settings={{ site_phone: "0345 501 969" }} />

            <main className="pt-28 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-4 mb-20 text-center relative overflow-hidden">
                    {/* Decorations */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 right-[10%] text-6xl animate-bounce">🏮</div>
                        <div className="absolute bottom-0 left-[10%] text-5xl animate-pulse">🌸</div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-400 text-red-950 rounded-full text-sm font-black mb-10 uppercase tracking-[0.2em] shadow-lg shadow-yellow-400/20 relative z-10">
                        <Users className="w-4 h-4" />
                        Lộc Xuân Tuyển Dụng 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase relative z-10">
                        GIA NHẬP ĐỘI NGŨ <br className="hidden md:block" />
                        <span className="text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                            SÀN TRỢ LÝ AI
                        </span>
                    </h1>
                    <p className="text-red-100/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium relative z-10">
                        Sở hữu nguồn thu nhập thụ động bền vững bằng cách lan tỏa giải pháp Trợ lý AI chuyên biệt trong dịp khai xuân rạng rỡ.
                    </p>
                </section>

                <section className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
                    {/* Benefits Section */}
                    <div className="space-y-12">
                        <h2 className="text-3xl md:text-4xl font-black flex items-center gap-4 uppercase tracking-tight">
                            <Sparkles className="w-10 h-10 text-yellow-400" />
                            Đặc quyền CTV
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-8">
                            {benefits.map((b, i) => (
                                <div key={i} className="group p-8 bg-[#2a0101]/40 rounded-[2.5rem] border border-yellow-400/5 hover:border-yellow-400/30 transition-all hover:-translate-y-2 duration-500">
                                    <div className="w-16 h-16 bg-[#1a0101] rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-yellow-400/10 group-hover:bg-yellow-400 group-hover:text-red-950 transition-colors">
                                        {b.icon}
                                    </div>
                                    <h3 className="font-black text-xl mb-3 text-white uppercase tracking-tight">{b.title}</h3>
                                    <p className="text-red-100/50 text-sm leading-relaxed font-medium">{b.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registration Form Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-yellow-400 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative bg-[#2a0101]/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-yellow-400/10 shadow-2xl">
                            {!isSuccess ? (
                                <>
                                    <div className="mb-10 text-center">
                                        <h2 className="text-3xl font-black mb-3 uppercase tracking-tight">Đăng ký tham gia</h2>
                                        <p className="text-red-100/50 font-medium">Bắt đầu hành trình chinh phục AI ngay hôm nay.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-yellow-500/60 uppercase tracking-widest ml-1">Họ và tên</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="VD: Nguyễn Văn An"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#1a0101]/60 border border-yellow-400/10 rounded-2xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none transition-all placeholder:text-white/10 font-medium text-white"
                                            />
                                        </div>

                                        {/* Honeypot field (hidden from users) */}
                                        <div className="hidden overflow-hidden w-0 h-0 opacity-0 bg-transparent border-none outline-none -z-50 pointer-events-none">
                                            <input
                                                type="text"
                                                name="website"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-yellow-500/60 uppercase tracking-widest ml-1">Số điện thoại</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="Số điện thoại Zalo"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#1a0101]/60 border border-yellow-400/10 rounded-2xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none transition-all placeholder:text-white/10 font-medium text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-yellow-500/60 uppercase tracking-widest ml-1">Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="Email liên hệ"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#1a0101]/60 border border-yellow-400/10 rounded-2xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none transition-all placeholder:text-white/10 font-medium text-white"
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="w-full py-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-primary-500/20 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    Gửi đăng ký
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-10 space-y-8">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black mb-4">GỬI THÀNH CÔNG!</h2>
                                        <p className="text-slate-300 mb-8 leading-relaxed">
                                            Cảm ơn bạn đã quan tâm đến hệ thống của chúng tôi. <br />
                                            Mời bạn tham gia nhóm Zalo để nhận tài liệu và bắt đầu ngay.
                                        </p>
                                    </div>

                                    <a
                                        href="https://zalo.me/0345501969"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 px-10 py-4 bg-[#0068ff] text-white font-bold rounded-2xl hover:bg-[#0058e0] transition-all uppercase shadow-lg shadow-[#0068ff]/20 hover:scale-105"
                                    >
                                        Liên hệ Zalo hỗ trợ
                                        <MessageCircle className="w-6 h-6" />
                                    </a>

                                    <p className="text-xs text-slate-500 italic mt-6 uppercase tracking-wider font-bold">
                                        Hỗ trợ đối tác 24/7 qua Zalo
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer settings={{ site_phone: "0345 501 969" }} />
        </div>
    );
}
