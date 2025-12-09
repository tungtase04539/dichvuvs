import Link from "next/link";
import { CheckCircle, Home, Search, Phone, Sparkles } from "lucide-react";

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { orderCode?: string };
}) {
  const orderCode = searchParams.orderCode;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card p-8 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary-600" />
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-4">
            Đặt lịch thành công!
          </h1>

          <p className="text-slate-600 mb-6">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>

          {orderCode && (
            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 mb-1">Mã đơn hàng của bạn</p>
              <p className="text-2xl font-bold text-primary-600 font-mono">
                {orderCode}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Lưu lại mã này để tra cứu đơn hàng
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/tra-cuu" className="btn btn-primary w-full">
              <Search className="w-5 h-5" />
              Tra cứu đơn hàng
            </Link>
            <Link href="/" className="btn btn-secondary w-full">
              <Home className="w-5 h-5" />
              Về trang chủ
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-2">Cần hỗ trợ?</p>
            <a
              href="tel:19001234"
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline"
            >
              <Phone className="w-4 h-4" />
              1900 1234
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm">VệSinhHCM - Dịch vụ vệ sinh chuyên nghiệp</span>
        </div>
      </div>
    </div>
  );
}

