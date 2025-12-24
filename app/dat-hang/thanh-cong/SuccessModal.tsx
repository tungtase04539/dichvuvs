"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Copy, Check, Download, ExternalLink, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        orderCode: string;
        totalPrice: number;
        customerName: string;
    };
    credential?: {
        chatbotLink?: string;
        activationCode?: string;
        accountInfo?: string;
        password?: string;
        notes: string | null;
    } | null;
}

export default function SuccessModal({ isOpen, onClose, order, credential }: SuccessModalProps) {
    const [copied, setCopied] = useState<string | null>(null);

    if (!isOpen) return null;

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Success Header */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 uppercase">Thanh toán thành công!</h2>
                    <p className="text-green-50/90 text-sm">
                        Cảm ơn {order.customerName}, đơn hàng của bạn đã được xác nhận.
                    </p>
                </div>

                <div className="p-6">
                    {/* Order Brief */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Mã đơn hàng</p>
                            <p className="text-lg font-bold font-mono text-slate-900">{order.orderCode}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Tổng thanh toán</p>
                            <p className="text-lg font-bold text-primary-600">{formatCurrency(order.totalPrice)}</p>
                        </div>
                    </div>

                    {/* Account Info */}
                    {credential ? (
                        <div className="space-y-4 mb-6">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                THÔNG TIN TÀI KHOẢN CHATBOT
                            </h3>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Link ChatBot</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-100 px-3 py-2.5 rounded-xl text-sm font-mono text-slate-700 truncate border border-slate-200">
                                            {credential.chatbotLink || credential.accountInfo || ""}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(credential.chatbotLink || credential.accountInfo || "", 'link')}
                                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                                        >
                                            {copied === 'link' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Mã kích hoạt</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-100 px-3 py-2.5 rounded-xl text-sm font-bold font-mono text-green-600 border border-slate-200">
                                            {credential.activationCode || credential.password || ""}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(credential.activationCode || credential.password || "", 'pwd')}
                                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                                        >
                                            {copied === 'pwd' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {credential.notes && (
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 mb-1 uppercase">Lưu ý:</p>
                                        <p className="text-xs text-amber-800 leading-relaxed">{credential.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 mb-6">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                            <p className="text-sm text-slate-600 px-8">
                                Hệ thống đang khởi tạo tài khoản riêng cho bạn. Vui lòng chờ trong vài giây...
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/tai-khoan"
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all uppercase text-sm"
                            onClick={onClose}
                        >
                            Vào quản lý tài khoản
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-white text-slate-500 font-bold rounded-2xl hover:bg-slate-50 border border-slate-200 transition-all uppercase text-sm"
                        >
                            Đóng thông báo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
