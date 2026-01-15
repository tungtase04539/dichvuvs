"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CopyButton from "./CopyButton";
import { Loader2, QrCode } from "lucide-react";

interface QRPaymentProps {
  orderCode: string;
  amount: number;
}

export default function QRPayment({ orderCode, amount }: QRPaymentProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await fetch(
          `/api/payment/qr?amount=${amount}&content=${encodeURIComponent(orderCode)}`
        );
        const data = await res.json();

        if (data.qrUrl) {
          setQrUrl(data.qrUrl);
          setBankInfo({
            bankName: data.bankName || "MB Bank",
            accountNumber: data.accountNumber || "0123456789",
            accountName: data.accountName || "CHATBOT VN",
            content: data.content || orderCode, // Use content from API (with SEVQR prefix)
          });
        }
      } catch (error) {
        console.error("QR fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQR();
  }, [orderCode, amount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* QR Code - Centered */}
      <div className="flex flex-col items-center">
        <div className="bg-white p-3 rounded-xl border-2 border-primary-200 shadow-md">
          {qrUrl ? (
            <Image
              src={qrUrl}
              alt="QR Payment"
              width={180}
              height={180}
              className="rounded-lg"
            />
          ) : (
            <div className="w-[180px] h-[180px] bg-slate-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-2 text-center">
          Quét mã QR bằng app ngân hàng
        </p>
      </div>

      {/* Bank Info - Compact */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <span className="text-sm text-slate-500">Ngân hàng</span>
          <span className="font-semibold text-slate-900">{bankInfo?.bankName}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <span className="text-sm text-slate-500">Số TK</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-900">{bankInfo?.accountNumber}</span>
            <CopyButton text={bankInfo?.accountNumber || ""} />
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <span className="text-sm text-slate-500">Chủ TK</span>
          <span className="font-semibold text-slate-900 text-right">{bankInfo?.accountName}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <span className="text-sm text-slate-500">Số tiền</span>
          <span className="font-bold text-primary-600">{amount.toLocaleString("vi-VN")}đ</span>
        </div>

        <div className="flex items-center justify-between py-2 bg-primary-50 -mx-4 px-4 rounded-b-xl">
          <span className="text-sm text-primary-700 font-medium">Nội dung CK</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary-700">{bankInfo?.content || orderCode}</span>
            <CopyButton text={bankInfo?.content || orderCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
