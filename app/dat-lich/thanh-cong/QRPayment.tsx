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
        const res = await fetch(`/api/orders?orderCode=${orderCode}&phone=check`);
        if (res.ok) {
          const data = await res.json();
          if (data.order && data.order.status !== "pending") {
            setStatus("confirmed");
            // Redirect to order tracking after 2 seconds
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

    // Check immediately, then every 5 seconds
    const interval = setInterval(checkPayment, 5000);
    if (checkCount === 0) checkPayment();

    // Stop after 10 minutes (120 checks)
    if (checkCount >= 120) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [orderCode, status, checkCount, router]);

  if (status === "confirmed") {
    return (
      <div className="bg-emerald-50 rounded-xl p-6 mb-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <p className="text-lg font-bold text-emerald-600 mb-1">Thanh toán thành công!</p>
        <p className="text-sm text-slate-600">Đơn hàng của bạn đã được xác nhận</p>
        <p className="text-xs text-slate-400 mt-2">Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-4 mb-4">
      {/* QR Code */}
      <div className="bg-white rounded-xl p-3 mb-3 flex justify-center">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="QR Code thanh toán"
            className="w-48 h-48 object-contain"
            onError={(e) => {
              // Fallback nếu QR không load được
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-16 h-16 text-slate-300" />
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="text-center mb-3">
        <p className="text-sm text-slate-500 mb-1">Số tiền thanh toán</p>
        <p className="text-2xl font-bold text-blue-600">{formatCurrency(amount)}</p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang chờ thanh toán...</span>
      </div>

      <p className="text-xs text-center text-slate-400 mt-2">
        Quét mã QR bằng app ngân hàng để thanh toán tự động
      </p>
    </div>
  );
}

