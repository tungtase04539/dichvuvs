"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Package, ExternalLink, ShieldCheck, Clock } from "lucide-react";

interface InventoryItem {
    id: string;
    activationCode: string;
    isUsed: boolean;
    createdAt: string;
    order?: {
        orderCode: string;
        customerName: string;
    };
}

interface Product {
    id: string;
    name: string;
    chatbotLink?: string;
}

export default function InventoryManagementPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingLink, setIsUpdatingLink] = useState(false);

    const [newChatbotLink, setNewChatbotLink] = useState("");
    const [activationCode, setActivationCode] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch inventory - it now returns service too
                const invRes = await fetch(`/api/admin/inventory?serviceId=${productId}`);
                const invData = await invRes.json();

                if (invData.service) {
                    setProduct(invData.service);
                    setNewChatbotLink(invData.service.chatbotLink || "");
                }

                if (invData.inventory) {
                    setInventory(invData.inventory);
                }
            } catch (error) {
                console.error("Fetch data error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    const handleUpdateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingLink(true);

        try {
            const res = await fetch("/api/admin/inventory", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: productId,
                    chatbotLink: newChatbotLink
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setProduct(prev => prev ? { ...prev, chatbotLink: newChatbotLink } : null);
                if (data.warning) {
                    alert("Lưu thành công nhưng có cảnh báo: " + data.warning);
                } else {
                    alert("Đã cập nhật Link ChatBot thành công!");
                }
            } else {
                alert("Lỗi: " + (data.error || "Không thể cập nhật link"));
            }
        } catch (error) {
            console.error("Update link error:", error);
            alert("Có lỗi xảy ra khi kết nối máy chủ");
        } finally {
            setIsUpdatingLink(false);
        }
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: productId,
                    activationCode
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setInventory([data.item, ...inventory]);
                setActivationCode("");
                alert("Đã thêm mã mới vào kho thành công!");
            } else {
                alert("Lỗi: " + (data.error || "Không thể thêm mã"));
            }
        } catch (error) {
            console.error("Add inventory error:", error);
            alert("Có lỗi xảy ra khi kết nối máy chủ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa mục này?")) return;

        try {
            const res = await fetch(`/api/admin/inventory?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setInventory(inventory.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error("Delete inventory error:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <Link
                    href="/admin/san-pham"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý kho: {product?.name}</h1>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">ChatBot Data</span>
                </div>
                <p className="text-slate-500 mt-1">Quản lý một Link ChatBot dùng chung và danh sách Mã kích hoat bàn giao</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    {/* Link Chatbot Editor (One for all) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-blue-500" />
                            Link ChatBot chung
                        </h2>
                        <form onSubmit={handleUpdateLink} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Link truy cập (Dùng chung cho tất cả mã)
                                </label>
                                <input
                                    type="url"
                                    value={newChatbotLink}
                                    onChange={(e) => setNewChatbotLink(e.target.value)}
                                    placeholder="https://t.me/your_bot..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-blue-600"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdatingLink}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                            >
                                {isUpdatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu Link ChatBot"}
                            </button>
                        </form>
                    </div>

                    {/* Add Form (Only activation code) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-500" />
                            Thêm mã kích hoạt mới
                        </h2>

                        <form onSubmit={handleAddInventory} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Mã kích hoạt
                                </label>
                                <input
                                    type="text"
                                    value={activationCode}
                                    onChange={(e) => setActivationCode(e.target.value)}
                                    required
                                    placeholder="VD: VS-CHAT-XXXX"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono transition-all uppercase"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                Thêm vào kho
                            </button>
                        </form>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-slate-400" />
                                Danh sách Mã ({inventory.length})
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Sẵn sàng
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                    Đã sử dụng
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {inventory.map((item) => (
                                <div key={item.id} className={`p-6 hover:bg-slate-50 transition-colors ${item.isUsed ? 'opacity-75' : ''}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${item.isUsed ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mã kích hoạt</p>
                                                    <p className="font-mono font-black text-lg text-slate-900 uppercase">{item.activationCode}</p>
                                                </div>
                                                {item.isUsed && (
                                                    <span className="ml-2 px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-md border border-slate-200">
                                                        Đã bán
                                                    </span>
                                                )}
                                            </div>

                                            {item.isUsed && item.order && (
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="flex items-center gap-1 text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-md">
                                                        Đơn: #{item.order.orderCode}
                                                    </span>
                                                    <span className="text-slate-400">|</span>
                                                    <span className="text-slate-500 italic">Khách: {item.order.customerName}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                <Clock className="w-3 h-3" />
                                                Đã thêm ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN')}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {!item.isUsed && (
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {inventory.length === 0 && (
                                <div className="py-20 text-center">
                                    <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">Chưa có mã trong kho</p>
                                    <p className="text-xs text-slate-400 mt-1">Hãy thêm mã kích hoạt ở bảng bên trái</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
