import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import OrderForm from "./OrderForm";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "Đặt hàng ChatBot | ChatBot VN Store",
  description: "Mua ChatBot AI với giá chỉ 30.000đ/bot",
};

// Use static settings to avoid DB call
const defaultSettings = {
  site_name: "ChatBot VN Store",
  site_phone: "1900 8686",
};

export default function OrderPage() {
  const settings = defaultSettings;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header settings={settings} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Đặt hàng ChatBot</h1>
              <p className="text-slate-400 text-lg">
                Chọn ChatBot bạn muốn mua và điền thông tin để đặt hàng
              </p>
            </div>

            {/* Order Form - loads products client-side */}
            <OrderForm />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}

