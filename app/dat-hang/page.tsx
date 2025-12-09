import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import OrderForm from "./OrderForm";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "Đặt hàng ChatBot | ChatBot VN Store",
  description: "Mua ChatBot AI với giá chỉ 30.000đ/bot",
};

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Đặt hàng ChatBot</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Chọn ChatBot bạn muốn mua và điền thông tin để đặt hàng
          </p>
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <OrderForm />
          </div>
        </div>
      </main>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}
