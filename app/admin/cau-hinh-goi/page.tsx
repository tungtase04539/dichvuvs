"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Star, Link, List } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PackageSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        price_gold: "",
        price_platinum: "",
        features_gold: "",
        features_platinum: "",
        chatbot_link_gold: "",
        chatbot_link_platinum: "",
        description_gold: "",
        description_platinum: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.settings) {
                setSettings({
                    price_gold: data.settings.price_gold || "",
                    price_platinum: data.settings.price_platinum || "",
                    features_gold: data.settings.features_gold || "",
                    features_platinum: data.settings.features_platinum || "",
                    chatbot_link_gold: data.settings.chatbot_link_gold || "",
                    chatbot_link_platinum: data.settings.chatbot_link_platinum || "",
                    description_gold: data.settings.description_gold || "",
                    description_platinum: data.settings.description_platinum || ""
                });
            }
        } catch (error) {
            toast.error("Không thể tải cấu hình");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Đã cập nhật cấu hình chung cho tất cả sản phẩm!");
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi cập nhật");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Cấu hình Gói Nâng Cao</h1>
                <p className="text-slate-600">
                    Cài đặt chung cho gói VÀNG và BẠCH KIM áp dụng cho tất cả sản phẩm
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gold Package Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Star className="w-12 h-12 text-amber-500 fill-amber-500" />
                        </div>

                        <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                            Gói VÀNG (Gold)
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Giá mặc định (VNĐ)</label>
                            <input
                                type="number"
                                value={settings.price_gold}
                                onChange={(e) => setSettings({ ...settings, price_gold: e.target.value })}
                                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-amber-900"
                                placeholder="VD: 49000"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Mô tả ngắn (Hiển thị mặt trước)</label>
                            <input
                                type="text"
                                value={settings.description_gold}
                                onChange={(e) => setSettings({ ...settings, description_gold: e.target.value })}
                                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm text-amber-900"
                                placeholder="VD: Combo: Trợ lý AI + Thương hiệu & Quà tặng"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Ưu đãi (Mỗi dòng 1 ưu đãi)</label>
                            <textarea
                                value={settings.features_gold}
                                onChange={(e) => setSettings({ ...settings, features_gold: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm text-amber-900"
                                placeholder="Hỗ trợ ưu tiên 24/7&#10;Update liên tục..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Link bàn giao chung</label>
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                <input
                                    type="url"
                                    value={settings.chatbot_link_gold}
                                    onChange={(e) => setSettings({ ...settings, chatbot_link_gold: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm text-amber-900"
                                    placeholder="https://t.me/gold_bot_link..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Platinum Package Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cyan-100 flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Star className="w-12 h-12 text-cyan-500 fill-cyan-500" />
                        </div>

                        <h3 className="text-lg font-bold text-cyan-800 flex items-center gap-2">
                            <Star className="w-5 h-5 fill-cyan-500 text-cyan-500" />
                            Gói BẠCH KIM (Platinum)
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-cyan-700 uppercase mb-2">Giá mặc định (VNĐ)</label>
                            <input
                                type="number"
                                value={settings.price_platinum}
                                onChange={(e) => setSettings({ ...settings, price_platinum: e.target.value })}
                                className="w-full px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-semibold text-cyan-900"
                                placeholder="VD: 99000"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cyan-700 uppercase mb-2">Mô tả ngắn (Hiển thị mặt trước)</label>
                            <input
                                type="text"
                                value={settings.description_platinum}
                                onChange={(e) => setSettings({ ...settings, description_platinum: e.target.value })}
                                className="w-full px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm text-cyan-900"
                                placeholder="VD: Full Option: Trợ lý AI + Hệ sinh thái đặc quyền"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cyan-700 uppercase mb-2">Ưu đãi (Mỗi dòng 1 ưu đãi)</label>
                            <textarea
                                value={settings.features_platinum}
                                onChange={(e) => setSettings({ ...settings, features_platinum: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-sm text-cyan-900"
                                placeholder="Toàn bộ tính năng cao cấp&#10;Hỗ trợ 1-1..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cyan-700 uppercase mb-2">Link bàn giao chung</label>
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                                <input
                                    type="url"
                                    value={settings.chatbot_link_platinum}
                                    onChange={(e) => setSettings({ ...settings, chatbot_link_platinum: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-cyan-50 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm text-cyan-900"
                                    placeholder="https://t.me/platinum_bot_link..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Lưu cấu hình hệ thống
                    </button>
                </div>
            </form>
        </div>
    );
}
