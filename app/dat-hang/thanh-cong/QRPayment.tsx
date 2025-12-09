"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Loader2, QrCode } from "lucide-react";

interface QRPaymentProps {
  qrUrl: string;
  orderCode: string;
  amount: number;
}

export default function QRPayment({ qrUrl, orderCode, amount }: QRPaymentProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "checking" | "confirmed">("pending");
  const [checkCount, setCheckCount] = useState(0);

  // Auto-check payment status every 5 seconds
  useEffect(() => {
    if (status === "confirmed") return;

    const checkPayment = async () => {
      try {
        const res = await fetch(`/api/orders/status?orderCode=${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order && data.order.status !== "pending") {
            setStatus("confirmed");
            setTimeout(() => {
              router.push(`/tra-cuu?code=${orderCode}&confirmed=1`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Check payment error:", error);
      }
      setCheckCount((c) => c + 1);
    };

    const interval = setInterval(checkPayment, 5000);
    if (checkCount === 0) checkPayment();

    if (checkCount >= 120) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [orderCode, status, checkCount, router]);

  if (status === "confirmed") {
    return (
      <div className="bg-green-500/10 rounded-xl p-6 mb-4 text-center border border-green-500/20">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <p className="text-lg font-bold text-green-400 mb-1">Thanh toán thành công!</p>
        <p className="text-sm text-slate-400">Đơn hàng của bạn đã được xác nhận</p>
        <p className="text-xs text-slate-500 mt-2">Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-purple-900/30 to-slate-900/50 rounded-xl p-4 mb-4 border border-purple-500/20">
      {/* QR Code */}
      <div className="bg-white rounded-xl p-3 mb-3 flex flex-col items-center justify-center">
        {qrUrl ? (
          <>
            <img
              src={qrUrl}
              alt="QR Code thanh toán"
              className="w-52 h-52 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="w-52 h-52 bg-slate-100 rounded-lg items-center justify-center hidden flex-col">
              <QrCode className="w-12 h-12 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500">QR đang tải...</p>
            </div>
          </>
        ) : (
          <div className="w-52 h-52 bg-slate-100 rounded-lg flex items-center justify-center flex-col">
            <QrCode className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Chưa có QR</p>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="text-center mb-3">
        <p className="text-sm text-slate-400 mb-1">Số tiền thanh toán</p>
        <p className="text-2xl font-bold text-purple-400">{formatCurrency(amount)}</p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang chờ thanh toán...</span>
      </div>

      <p className="text-xs text-center text-slate-500 mt-2">
        Quét mã QR bằng app ngân hàng để thanh toán tự động
      </p>
    </div>
  );
}

