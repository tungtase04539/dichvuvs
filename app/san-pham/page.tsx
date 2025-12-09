import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ArrowRight, Star, Bot, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header settings={settings} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-4 border border-purple-500/20">
              <Bot className="w-4 h-4" />
              {products.length} sản phẩm
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Tất cả <span className="text-purple-400">ChatBot</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Chọn ChatBot AI phù hợp với nhu cầu kinh doanh của bạn. 
              Mỗi bot chỉ <span className="text-purple-400 font-bold">30.000đ</span>!
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="group relative bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                {product.featured && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 text-xs font-bold rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      HOT
                    </span>
                  </div>
                )}
                
                <div className="text-5xl mb-4">{product.icon}</div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-2xl font-bold text-purple-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-slate-500 line-through ml-2">
                      {formatCurrency(product.price * 2)}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold mb-4">
              Không biết chọn ChatBot nào?
            </h2>
            <p className="text-slate-400 mb-6 max-w-xl mx-auto">
              Liên hệ với chúng tôi để được tư vấn miễn phí. Đội ngũ chuyên gia sẽ giúp bạn chọn ChatBot phù hợp nhất!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dat-hang"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Mua nhiều ChatBot
              </Link>
              <a
                href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                Tư vấn: {settings.site_phone}
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}

