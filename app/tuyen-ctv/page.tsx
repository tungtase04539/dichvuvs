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
        <div className="min-h-screen bg-slate-900 text-white">
            <Header settings={{ site_phone: "0345 501 969" }} />

            <main className="pt-28 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-4 mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/10 text-primary-400 rounded-full text-sm font-bold border border-primary-400/20 mb-6 uppercase tracking-widest">
                        <Users className="w-4 h-4" />
                        Tuyển Cộng Tác Viên AI
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        GIA NHẬP ĐỘI NGŨ <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-200 to-white">
                            SÀN TRỢ LÝ AI
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Sở hữu nguồn thu nhập thụ động bền vững bằng cách mang giải pháp Trợ lý AI chuyên biệt đến cho doanh nghiệp và hộ kinh doanh.
                    </p>
                </section>

                <section className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
                    {/* Benefits */}
                    <div className="space-y-8">
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-primary-400" />
                            Tại sao nên trở thành CTV?
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {benefits.map((b, i) => (
                                <div key={i} className="p-6 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-primary-400/30 transition-all hover:translate-y-[-4px]">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 shadow-inner">
                                        {b.icon}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{b.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registration Form Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                        <div className="relative bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
                            {!isSuccess ? (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold mb-2">Đăng ký ngay</h2>
                                        <p className="text-slate-400">Điền thông tin bên dưới, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Họ và tên</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="VD: Nguyễn Văn An"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 outline-none transition-all placeholder:text-slate-600"
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
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="Số điện thoại Zalo"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 outline-none transition-all placeholder:text-slate-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="Email liên hệ"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 outline-none transition-all placeholder:text-slate-600"
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
                                        href="https://zalo.me/g/nfcsbd681"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-4 px-10 py-5 bg-[#0068ff] hover:bg-[#0056d2] text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest"
                                    >
                                        Tham gia nhóm Zalo
                                        <MessageCircle className="w-6 h-6" />
                                    </a>

                                    <p className="text-xs text-slate-500 italic mt-6">
                                        Mã số nhóm hỗ trợ: NFCSBD681
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
