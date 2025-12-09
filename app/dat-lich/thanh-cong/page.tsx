import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Home, Search, Phone, Sparkles, Copy, CreditCard, Building2 } from "lucide-react";
import CopyButton from "./CopyButton";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Đặt lịch thành công!
            </h1>
            <p className="text-slate-600">
              Vui lòng chuyển khoản để xác nhận đơn hàng
            </p>
          </div>

          {orderCode && (
            <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm text-slate-600 mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-bold text-emerald-600 font-mono">
                {orderCode}
              </p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">Thông tin chuyển khoản</span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Ngân hàng:</span>
                <span className="font-semibold">{bankInfo.bank_name || "MB Bank"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{bankInfo.bank_account || "0123456789"}</span>
                  <CopyButton text={bankInfo.bank_account || "0123456789"} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Chủ tài khoản:</span>
                <span className="font-semibold">{bankInfo.bank_owner || "CONG TY VE SINH HCM"}</span>
              </div>
              <hr className="border-white/20" />
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Số tiền:</span>
                <span className="text-xl font-bold">{order ? formatCurrency(order.totalPrice) : "---"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Nội dung CK:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{orderCode}</span>
                  <CopyButton text={orderCode} />
                </div>
              </div>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-slate-600 mb-3">Quét mã QR để thanh toán nhanh</p>
            <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Building2 className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs">QR Code</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Sau khi chuyển khoản, đơn hàng sẽ tự động được xác nhận
            </p>
          </div>

          {/* Order Summary */}
          {order && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="font-semibold text-slate-900 mb-3">Chi tiết đơn hàng</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{order.service.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{order.service.name}</p>
                  <p className="text-sm text-slate-500">
                    {order.quantity} {order.unit} × {formatCurrency(order.basePrice)}
                  </p>
                </div>
                <p className="font-bold text-emerald-600">{formatCurrency(order.totalPrice)}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/tra-cuu" className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors">
              <Search className="w-5 h-5" />
              Kiểm tra trạng thái đơn hàng
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
              <Home className="w-5 h-5" />
              Về trang chủ
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-2">Cần hỗ trợ?</p>
            <a
              href={`tel:${bankInfo.site_phone?.replace(/\s/g, "") || "19001234"}`}
              className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:underline"
            >
              <Phone className="w-4 h-4" />
              {bankInfo.site_phone || "1900 1234"}
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-sm">VệSinhHCM - Dịch vụ vệ sinh chuyên nghiệp</span>
        </div>
      </div>
    </div>
  );
}

