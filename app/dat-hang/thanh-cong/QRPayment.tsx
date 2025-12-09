"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CopyButton from "./CopyButton";
import { Loader2, QrCode, Building2 } from "lucide-react";

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-2xl border-2 border-primary-100 shadow-lg">
          {qrUrl ? (
            <Image
              src={qrUrl}
              alt="QR Payment"
              width={200}
              height={200}
              className="rounded-xl"
            />
          ) : (
            <div className="w-[200px] h-[200px] bg-slate-100 rounded-xl flex items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-3 text-center">
          Quét mã QR để thanh toán
        </p>
      </div>

      {/* Bank Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          Hoặc chuyển khoản thủ công
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Ngân hàng</p>
            <p className="font-semibold text-slate-900">{bankInfo?.bankName}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Số tài khoản</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-semibold text-slate-900">
                {bankInfo?.accountNumber}
              </p>
              <CopyButton text={bankInfo?.accountNumber || ""} />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Chủ tài khoản</p>
            <p className="font-semibold text-slate-900">{bankInfo?.accountName}</p>
          </div>

          <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs text-primary-600 mb-1">Nội dung chuyển khoản</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-bold text-primary-700">{orderCode}</p>
              <CopyButton text={orderCode} />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Số tiền</p>
            <p className="font-bold text-lg text-primary-600">
              {amount.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
