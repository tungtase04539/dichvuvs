"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminHeader from "@/app/admin/components/AdminHeader";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

interface CTVApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  facebook: string | null;
  zalo: string | null;
  experience: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function CTVApprovalPage() {
  const [applications, setApplications] = useState<CTVApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [filter, currentUser]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/admin/ctv?status=${filter}`);
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/ctv/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Action error:", error);
    }
    setProcessing(null);
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar user={currentUser} />

      <div className="lg:pl-64">
        <AdminHeader user={currentUser} />

        <main className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Chờ duyệt
                </button>
                <button
                  onClick={() => setFilter("approved")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Đã duyệt
                </button>
                <button
                  onClick={() => setFilter("rejected")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Không có đơn đăng ký nào</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{app.fullName}</h3>
                          <p className="text-sm text-slate-500">
                            Đăng ký: {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {app.phone}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {app.email}
                        </div>
                        {app.facebook && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-blue-500">FB:</span>
                            {app.facebook}
                          </div>
                        )}
                        {app.zalo && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-blue-500">Zalo:</span>
                            {app.zalo}
                          </div>
                        )}
                      </div>

                      {app.experience && (
                        <div className="text-sm">
                          <span className="font-medium text-slate-700">Kinh nghiệm:</span>
                          <p className="text-slate-600 mt-1">{app.experience}</p>
                        </div>
                      )}

                      {app.reason && (
                        <div className="text-sm">
                          <span className="font-medium text-slate-700">Lý do đăng ký:</span>
                          <p className="text-slate-600 mt-1">{app.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {app.status === "pending" && (
                      <div className="flex gap-2 lg:flex-col">
                        <button
                          onClick={() => handleAction(app.id, "approve")}
                          disabled={processing === app.id}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {processing === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleAction(app.id, "reject")}
                          disabled={processing === app.id}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {processing === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

