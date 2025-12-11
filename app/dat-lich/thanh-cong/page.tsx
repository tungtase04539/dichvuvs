import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Home, Search, Phone, Sparkles, CreditCard, RefreshCw } from "lucide-react";
import CopyButton from "./CopyButton";
import QRPayment from "./QRPayment";

async function getOrder(orderCode: string) {
  if (!orderCode) return null;
  return prisma.order.findUnique({
    where: { orderCode },
    include: { service: true },
  });
}

async function getBankInfo() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ["bank_name", "bank_account", "bank_owner", "site_phone"],
      },
    },
  });
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { orderCode?: string };
}) {
  const orderCode = searchParams.orderCode || "";
  const [order, bankInfo] = await Promise.all([
    getOrder(orderCode),
    getBankInfo(),
  ]);

  // Generate SePay QR URL
  const bankAccount = bankInfo.bank_account || process.env.SEPAY_BANK_ACCOUNT || "";
  // Map bank name to SePay bank code
  const bankNameMap: Record<string, string> = {
    "MB Bank": "MBBank",
    "MB": "MBBank", 
    "Vietcombank": "Vietcombank",
    "VCB": "Vietcombank",
    "Techcombank": "Techcombank",
    "TCB": "Techcombank",
    "ACB": "ACB",
    "VPBank": "VPBank",
    "TPBank": "TPBank",
    "Sacombank": "Sacombank",
  };
  const rawBankName = bankInfo.bank_name || process.env.SEPAY_BANK_NAME || "MB Bank";
  const bankCode = bankNameMap[rawBankName] || "MBBank";
  const amount = order ? Math.round(order.totalPrice) : 0;
  const qrUrl = bankAccount 
    ? `https://qr.sepay.vn/img?bank=${bankCode}&acc=${bankAccount}&template=compact&amount=${amount}&des=${encodeURIComponent(orderCode)}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Đặt lịch thành công!
            </h1>
            <p className="text-slate-600 text-sm">
              Quét mã QR hoặc chuyển khoản để xác nhận đơn hàng
            </p>
          </div>

          {orderCode && (
            <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-emerald-600 font-mono">
                {orderCode}
              </p>
            </div>
          )}

          {/* QR Code từ SePay */}
          {qrUrl && order && (
            <QRPayment 
              qrUrl={qrUrl} 
              orderCode={orderCode}
              amount={order.totalPrice}
            />
          )}

          {/* Payment Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
              <CreditCard className="w-4 h-4" />
              Hoặc chuyển khoản thủ công
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-medium">{bankInfo.bank_name || "MB Bank"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số TK:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-medium">{bankInfo.bank_account || "---"}</span>
                  {bankInfo.bank_account && <CopyButton text={bankInfo.bank_account} />}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chủ TK:</span>
                <span className="font-medium text-xs">{bankInfo.bank_owner || "---"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-emerald-600">{order ? formatCurrency(order.totalPrice) : "---"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nội dung:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-medium text-emerald-600">{orderCode}</span>
                  <CopyButton text={orderCode} />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {order && (
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{order.service.name}</p>
                  <p className="text-xs text-slate-500">
                    {order.quantity} {order.unit}
                  </p>
                </div>
                <p className="font-bold text-emerald-600">{formatCurrency(order.totalPrice)}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Link href={`/tra-cuu?code=${orderCode}`} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-sm">
              <RefreshCw className="w-4 h-4" />
              Kiểm tra trạng thái thanh toán
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm">
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-1">Cần hỗ trợ?</p>
            <a
              href={`tel:${bankInfo.site_phone?.replace(/\s/g, "") || "19001234"}`}
              className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm hover:underline"
            >
              <Phone className="w-3 h-3" />
              {bankInfo.site_phone || "1900 1234"}
            </a>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span className="text-xs">Thanh toán tự động qua SePay</span>
        </div>
      </div>
    </div>
  );
}
