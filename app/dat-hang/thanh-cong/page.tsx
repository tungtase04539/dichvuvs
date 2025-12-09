import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Home, Phone, Sparkles, CreditCard, RefreshCw, ShoppingBag } from "lucide-react";
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

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const orderCode = searchParams.code || "";
  const [order, bankInfo] = await Promise.all([
    getOrder(orderCode),
    getBankInfo(),
  ]);

  // Generate SePay QR URL
  const bankAccount = bankInfo.bank_account || process.env.SEPAY_BANK_ACCOUNT || "";
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-slate-400 text-sm">
              Quét mã QR hoặc chuyển khoản để nhận ChatBot
            </p>
          </div>

          {orderCode && (
            <div className="bg-purple-500/10 rounded-xl p-3 mb-4 text-center border border-purple-500/20">
              <p className="text-xs text-slate-400 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-purple-400 font-mono">
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
          <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
              <CreditCard className="w-4 h-4 text-purple-400" />
              Hoặc chuyển khoản thủ công
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-medium text-white">{bankInfo.bank_name || "MB Bank"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số TK:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-medium text-white">{bankInfo.bank_account || "---"}</span>
                  {bankInfo.bank_account && <CopyButton text={bankInfo.bank_account} />}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Chủ TK:</span>
                <span className="font-medium text-white text-xs">{bankInfo.bank_owner || "---"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-bold text-purple-400">{order ? formatCurrency(order.totalPrice) : "---"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nội dung:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-medium text-purple-400">{orderCode}</span>
                  <CopyButton text={orderCode} />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {order && (
            <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{order.service.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{order.service.name}</p>
                  <p className="text-xs text-slate-400">
                    {order.quantity} {order.unit}
                  </p>
                </div>
                <p className="font-bold text-purple-400">{formatCurrency(order.totalPrice)}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Link
              href={`/tra-cuu?code=${orderCode}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Kiểm tra trạng thái thanh toán
            </Link>
            <Link
              href="/san-pham"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/10"
            >
              <ShoppingBag className="w-4 h-4" />
              Mua thêm ChatBot
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-slate-400 font-medium rounded-xl hover:text-white transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500 mb-1">Cần hỗ trợ?</p>
            <a
              href={`tel:${bankInfo.site_phone?.replace(/\s/g, "") || "19008686"}`}
              className="inline-flex items-center gap-1 text-purple-400 font-medium text-sm hover:underline"
            >
              <Phone className="w-3 h-3" />
              {bankInfo.site_phone || "1900 8686"}
            </a>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-xs">Thanh toán tự động qua SePay</span>
        </div>
      </div>
    </div>
  );
}

