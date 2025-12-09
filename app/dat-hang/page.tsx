import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import OrderForm from "./OrderForm";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "Đặt hàng ChatBot | ChatBot VN Store",
  description: "Mua ChatBot AI với giá chỉ 30.000đ/bot",
};

async function getProducts() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}

async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

export default async function OrderPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

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

            {/* Order Form */}
            <OrderForm products={products} />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}

