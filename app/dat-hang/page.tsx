import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderForm from "./OrderForm";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "Đặt hàng ChatBot | ChatBot VN Store",
  description: "Mua ChatBot AI với giá chỉ 29K/tháng",
};

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header settings={{}} />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Minimalist Title Area */}
          <div className="max-w-4xl mx-auto mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Hoàn tất đơn hàng</h1>
            <p className="text-slate-500">Vui lòng kiểm tra lại giỏ hàng và điền thông tin để nhận tài khoản ChatBot.</p>
          </div>

          <OrderForm />
        </div>
      </main>

      <Footer settings={{}} />
    </div>
  );
}
