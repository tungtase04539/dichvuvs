"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, XCircle, Mail, Phone, Clock, UserCheck, AlertCircle } from "lucide-react";

interface CTVApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  facebook: string | null;
  zalo: string | null;
  experience: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectReason: string | null;
}

export default function DuyetCTVPage() {
  const [apps, setApps] = useState<CTVApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/ctv/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tải được danh sách");
      setApps(data.applications || []);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, action: "approved" | "rejected") => {
    setWorkingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/ctv/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectReason: action === "rejected" ? rejectReason[id] || null : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không cập nhật được");
      setApps((prev) => prev.map((a) => (a.id === id ? data.application : a)));
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setWorkingId(null);
    }
  };

  const pending = apps.filter((a) => a.status === "pending");
  const processed = apps.filter((a) => a.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duyệt Cộng tác viên</h1>
          <p className="text-slate-500">Xem và duyệt các CTV vừa đăng ký</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Chờ duyệt ({pending.length})</h2>
          <button
            onClick={load}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            Tải lại
          </button>
        </div>

        <div className="space-y-3">
          {pending.length === 0 && (
            <div className="p-4 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
              Không có yêu cầu nào cần duyệt.
            </div>
          )}

          {pending.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{app.fullName}</p>
                  <div className="text-sm text-slate-600 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{app.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{app.phone || "-"}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(app.createdAt).toLocaleString("vi-VN")}
                  </div>
                  {app.experience && (
                    <p className="text-sm text-slate-700"><strong>Kinh nghiệm:</strong> {app.experience}</p>
                  )}
                  {app.reason && (
                    <p className="text-sm text-slate-700"><strong>Lý do:</strong> {app.reason}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-64">
                  <textarea
                    className="input min-h-[60px]"
                    placeholder="Ghi chú (nếu từ chối)"
                    value={rejectReason[app.id] || ""}
                    onChange={(e) =>
                      setRejectReason((r) => ({ ...r, [app.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(app.id, "rejected")}
                      disabled={workingId === app.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {workingId === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Từ chối
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "approved")}
                      disabled={workingId === app.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {workingId === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Duyệt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Đã xử lý ({processed.length})</h2>
        {processed.length === 0 && (
          <div className="p-4 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
            Chưa có yêu cầu nào đã xử lý.
          </div>
        )}
        {processed.map((app) => (
          <div
            key={app.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-semibold text-slate-900">{app.fullName}</p>
              <p className="text-slate-600">{app.email} · {app.phone || "-"}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(app.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">
                {app.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
              </p>
              {app.status === "rejected" && app.rejectReason && (
                <p className="text-slate-500 text-xs mt-1">Lý do: {app.rejectReason}</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

