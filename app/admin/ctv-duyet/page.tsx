"use client";

import { useState, useEffect } from "react";
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Search,
    RefreshCw,
    Phone,
    Mail,
    Calendar,
    AlertCircle,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

interface CTVApplication {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    status: string;
    createdAt: string;
    userId: string;
}

export default function AdminCTVApprovalPage() {
    const [applications, setApplications] = useState<CTVApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/users?role=customer"); // Simplified for now, or we need a specific ctv-apps API
            // Actually, I should probably have a dedicated API to fetch applications, 
            // but I can use a raw fetch from Prisma if I make this a server component or a more specific API.
            // Let's assume we have an API for this or create one. 
            // For now, I'll fetch from a new API I'll create or just use the users API if it returns apps.
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Re-creating the fetch logic to use a dedicated API
    const loadApps = async () => {
        setIsLoading(true);
        try {
            // I'll create this API next or use a server action/direct prisma call if possible.
            // Since I'm in a client component, I need an API.
            const res = await fetch("/api/admin/ctv/applications");
            const data = await res.json();
            if (data.applications) {
                setApplications(data.applications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadApps();
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch("/api/admin/ctv/export");
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ctv_export_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Lỗi xuất dữ liệu");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối");
        } finally {
            setIsExporting(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setProcessingId(id);
        try {
            const res = await fetch("/api/admin/ctv/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: id, action }),
            });

            if (res.ok) {
                const data = await res.json();
                if (action === "approve") {
                    alert(data.message || "Duyệt thành công");
                }
                setApplications(prev => prev.filter(app => app.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Có lỗi xảy ra");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredApps = applications.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Duyệt Cộng tác viên</h1>
                    <p className="text-slate-500 mt-1 font-medium">Danh sách các cá nhân đăng ký làm CTV đang chờ phê duyệt</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Xuất Excel
                    </button>
                    <button
                        onClick={loadApps}
                        disabled={isLoading}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw className={cn("w-5 h-5 text-slate-600", isLoading && "animate-spin")} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, SĐT hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-slate-500 font-medium">Đang tải danh sách...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Không có đơn đăng ký nào</h3>
                        <p className="text-slate-500 max-w-sm">Hiện tại không có đơn đăng ký CTV nào cần duyệt hoặc không khớp với tìm kiếm của bạn.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest">
                                    <th className="px-6 py-4">Ứng viên</th>
                                    <th className="px-6 py-4">Liên hệ</th>
                                    <th className="px-6 py-4">Ngày đăng ký</th>
                                    <th className="px-6 py-4 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {filteredApps.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-black text-lg">
                                                    {app.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-slate-900 text-base">{app.fullName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5 font-medium">
                                                <p className="flex items-center gap-2 text-slate-700">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    {app.phone}
                                                </p>
                                                <p className="flex items-center gap-2 text-slate-500">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    {app.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {formatDateTime(app.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    disabled={!!processingId}
                                                    onClick={() => handleAction(app.id, "approve")}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                                >
                                                    {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    Duyệt
                                                </button>
                                                <button
                                                    disabled={!!processingId}
                                                    onClick={() => handleAction(app.id, "reject")}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Từ chối
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <AlertCircle className="w-6 h-6 text-primary-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-primary-900">Thông báo tự động</h4>
                    <p className="text-primary-700 text-sm leading-relaxed">
                        Khi bạn nhấn <strong>Duyệt</strong>, hệ thống sẽ tự động cập nhật quyền của người dùng này lên <span className="font-bold italic">Cộng tác viên</span>.
                        Họ sẽ có quyền truy cập vào các tính năng dành riêng cho đối tác. Hãy đảm bảo bạn đã liên hệ qua Zalo trước khi phê duyệt.
                    </p>
                </div>
            </div>
        </div>
    );
}
