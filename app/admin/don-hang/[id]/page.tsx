"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Bot,
    MessageSquare,
    FileText,
    UserPlus,
    Star,
} from "lucide-react";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    address: string;
    district: string;
    status: string;
    orderPackageType?: string | null;
    chatbotLink?: string | null;
    scheduledDate: string;
    scheduledTime: string;
    totalPrice: number;
    quantity: number;
    notes?: string | null;
    createdAt: string;
    service: {
        id: string;
        name: string;
        description: string;
        image: string | null;
    };
    assignedTo?: {
        id: string;
        name: string;
        email: string;
    } | null;
    chatSession?: {
        id: string;
        messages: any[];
    } | null;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [chatbotLink, setChatbotLink] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${params.id}`);
            if (!res.ok) {
                if (res.status === 404) {
                    router.push("/admin/don-hang");
                }
                throw new Error("Failed to fetch order");
            }
            const data = await res.json();
            setOrder(data.order);
            setChatbotLink(data.order.chatbotLink || "");
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchOrder();
            }
        } catch (error) {
            console.error("Error updating order:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateLink = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatbotLink: chatbotLink }),
            });

            if (res.ok) {
                alert("Đã cập nhật link Bot thành công!");
                fetchOrder();
            }
        } catch (error) {
            console.error("Error updating chatbot link:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Không tìm thấy đơn hàng</p>
                <Link href="/admin/don-hang" className="text-primary-600 hover:underline mt-4 inline-block">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/don-hang"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
                <div className="flex items-center gap-3">
                    <span className={cn("badge text-base py-1.5 px-4", getStatusColor(order.status))}>
                        {getStatusLabel(order.status)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Header */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Chi tiết đơn hàng #{order.orderCode}</h1>
                                <p className="text-slate-500 mt-1">
                                    Được tạo lúc {formatDateTime(order.createdAt)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">Tổng cộng</p>
                                <p className="text-3xl font-black text-primary-600">
                                    {formatCurrency(order.totalPrice)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Hình thức gói</p>
                                <div className="flex items-center gap-2">
                                    <Star className={cn("w-4 h-4",
                                        (order.orderPackageType || "standard") === "gold" ? "text-amber-500 fill-amber-500" :
                                            (order.orderPackageType || "standard") === "platinum" ? "text-cyan-500 fill-cyan-500" :
                                                "text-slate-400"
                                    )} />
                                    <span className={cn("font-bold text-sm uppercase",
                                        (order.orderPackageType || "standard") === "gold" ? "text-amber-600" :
                                            (order.orderPackageType || "standard") === "platinum" ? "text-cyan-600" :
                                                "text-slate-600"
                                    )}>
                                        {order.orderPackageType || "Standard"}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Sản phẩm</p>
                                <div className="flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-primary-500" />
                                    <span className="font-bold text-sm text-slate-900">{order.service.name}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Số lượng</p>
                                <p className="font-bold text-sm text-slate-900">{order.quantity} ChatBot</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Lịch hẹn</p>
                                <p className="font-bold text-sm text-slate-900">
                                    {order.scheduledTime} - {new Date(order.scheduledDate).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <User className="w-5 h-5 text-primary-500" />
                            Thông tin khách hàng
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Họ và tên</p>
                                        <p className="font-bold text-slate-900">{order.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Số điện thoại</p>
                                        <p className="font-bold text-slate-900">{order.customerPhone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Địa chỉ Email</p>
                                        <p className="font-bold text-slate-900">{order.customerEmail || "(Không cung cấp)"}</p>
                                    </div>
                                </div>
                                {order.address && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold">Địa chỉ / Ghi chú đơn</p>
                                            <p className="text-sm text-slate-700">{order.address} {order.district}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {order.notes && (
                            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-[10px] text-amber-600 uppercase font-bold mb-1">Ghi chú từ khách hàng:</p>
                                <p className="text-slate-700 whitespace-pre-wrap text-sm">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            Thao tác đơn hàng
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {order.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange("confirmed")}
                                        disabled={isUpdating}
                                        className="btn bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Xác nhận đơn hàng
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange("cancelled")}
                                        disabled={isUpdating}
                                        className="btn bg-red-600 text-white hover:bg-red-700"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Hủy đơn hàng
                                    </button>
                                </>
                            )}
                            {order.status === "confirmed" && (
                                <button
                                    onClick={() => handleStatusChange("in_progress")}
                                    disabled={isUpdating}
                                    className="btn bg-primary-600 text-white hover:bg-primary-700"
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Bắt đầu thực hiện setup
                                </button>
                            )}
                            {order.status === "in_progress" && (
                                <button
                                    onClick={() => handleStatusChange("completed")}
                                    disabled={isUpdating}
                                    className="btn bg-green-600 text-white hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Hoàn thành và bàn giao
                                </button>
                            )}
                            {["completed", "cancelled"].includes(order.status) && (
                                <p className="text-slate-400 italic text-sm">
                                    Đơn hàng đã ở trạng thái cuối cùng, không thể thao tác thêm.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Assignment Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-primary-500" />
                            Phụ trách thực hiện
                        </h3>
                        {order.assignedTo ? (
                            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="font-bold text-slate-900">{order.assignedTo.name}</p>
                                <p className="text-sm text-slate-500">{order.assignedTo.email}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100 text-center">
                                <p className="text-slate-400 text-sm italic">Chưa có ai phụ trách</p>
                                <button className="text-primary-600 text-xs font-bold mt-2 hover:underline">
                                    Gán nhân viên ngay
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Provisioning Section for Premium Packages */}
                    {order.orderPackageType !== "standard" && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 ring-1 ring-primary-50">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Bot className="w-4 h-4 text-primary-500" />
                                Setup & Bàn giao Link Bot
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 uppercase font-bold">Link Bot dành riêng cho khách:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatbotLink}
                                            onChange={(e) => setChatbotLink(e.target.value)}
                                            placeholder="https://t.me/your_bot_link..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        />
                                        <button
                                            onClick={handleUpdateLink}
                                            disabled={isUpdating}
                                            className="btn btn-primary px-6"
                                        >
                                            {isUpdating ? "..." : "Lưu Link"}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic px-1">
                                        * Link này sẽ được hiển thị trong trang chi tiết đơn hàng của khách hàng sau khi bạn lưu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Help Card */}
                    <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                        <h3 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-10 h-10 p-2 bg-primary-500 text-white rounded-xl" />
                            Hỗ trợ Admin
                        </h3>
                        <p className="text-primary-800 text-sm leading-relaxed">
                            Đơn hàng gói <strong>{order.orderPackageType?.toUpperCase() || "STANDARD"}</strong> cần được setup bộ link và mã kích hoạt cho khách hàng trong 24h.
                            Kiểm tra phần ghi chú để biết yêu cầu riêng của khách.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
