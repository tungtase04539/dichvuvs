"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Filter,
    Loader2,
    DollarSign,
    TrendingUp,
    Package
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface Commission {
    id: string;
    amount: number;
    percent: number;
    level: number;
    status: string;
    createdAt: string;
    order: {
        orderCode: string;
        customerName: string;
        totalPrice: number;
        service: { name: string };
    };
    user: {
        name: string;
        role: string;
    };
}

export default function WalletPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        directSales: 0,
        teamSales: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user info for balance
                const profRes = await fetch("/api/admin/profile");
                if (profRes.ok) {
                    const profData = await profRes.json();
                    setBalance(profData.user.balance || 0);
                }

                // Fetch commissions
                const commRes = await fetch("/api/admin/commissions");
                if (commRes.ok) {
                    const commData = await commRes.json();
                    setCommissions(commData.commissions || []);

                    // Calculate stats
                    const total = commData.commissions.reduce((acc: number, c: Commission) => acc + c.amount, 0);
                    const direct = commData.commissions.filter((c: Commission) => c.level === 1).length;
                    const team = commData.commissions.filter((c: Commission) => c.level > 1).length;
                    setStats({
                        totalEarned: total,
                        directSales: direct,
                        teamSales: team
                    });
                }
            } catch (error) {
                console.error("Fetch wallet error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-primary-500" />
                    Ví tiền & Hoa hồng
                </h1>
            </div>

            {/* Main Balance Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-slate-400 font-medium mb-1">Số dư khả dụng</p>
                    <h2 className="text-5xl font-black mb-6 tracking-tight">
                        {formatCurrency(balance)}
                    </h2>
                    <div className="flex gap-4">
                        <button className="bg-primary-500 hover:bg-primary-600 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5" />
                            Rút tiền
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl font-bold transition-all">
                            Cài đặt thanh toán
                        </button>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute right-10 top-10 opacity-10">
                    <DollarSign className="w-32 h-32" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tổng thu nhập</p>
                            <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalEarned)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Đơn cá nhân</p>
                            <p className="text-xl font-bold text-slate-900">{stats.directSales}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <History className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Hoa hồng đội nhóm</p>
                            <p className="text-xl font-bold text-slate-900">{stats.teamSales} <span className="text-sm font-normal text-slate-400">đơn</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        Lịch sử nhận hoa hồng
                    </h3>
                    <button className="text-sm text-slate-500 flex items-center gap-1 hover:text-primary-500 transition-colors">
                        <Filter className="w-4 h-4" />
                        Lọc
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-600 text-sm">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold">Ngày</th>
                                <th className="text-left px-6 py-4 font-semibold">Nguồn thu</th>
                                <th className="text-right px-6 py-4 font-semibold">Giá trị đơn</th>
                                <th className="text-center px-6 py-4 font-semibold">%</th>
                                <th className="text-right px-6 py-4 font-semibold">Số tiền nhận</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {commissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Chưa có lịch sử giao dịch
                                    </td>
                                </tr>
                            ) : (
                                commissions.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDateTime(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.level === 1 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                                    }`}>
                                                    {item.level === 1 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4 rotate-180" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.order.service.name}</p>
                                                    <p className="text-xs text-slate-400">Mã: {item.order.orderCode} • Từ: {item.order.customerName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-600">
                                            {formatCurrency(item.order.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                {item.percent}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-bold text-primary-600">+{formatCurrency(item.amount)}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                                                {item.level === 1 ? "Hoa hồng trực tiếp" : "Hoa hồng đội nhóm"}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
