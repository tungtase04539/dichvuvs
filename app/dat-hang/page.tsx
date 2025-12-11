import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import OrderForm from "./OrderForm";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "Đặt hàng ChatBot | ChatBot VN Store",
  description: "Mua ChatBot AI với giá chỉ 29K/tháng",
};

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-400/20 backdrop-blur-sm mb-4 border border-primary-400/30">
            <ShoppingCart className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase">ĐẶT HÀNG CHATBOT</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
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
