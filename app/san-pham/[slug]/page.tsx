import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import AddToCartButton from "./AddToCartButton";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  MessageSquare,
  Bot,
  Users,
  TrendingUp,
} from "lucide-react";

async function getProduct(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
  });
}

async function getRelatedProducts(currentSlug: string) {
  return prisma.service.findMany({
    where: { 
      active: true,
      slug: { not: currentSlug },
    },
    take: 4,
  });
}

async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, relatedProducts, settings] = await Promise.all([
    getProduct(params.slug),
    getRelatedProducts(params.slug),
    getSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const features = [
    { icon: Zap, text: "Cài đặt trong 5 phút" },
    { icon: MessageSquare, text: "AI hiểu ngữ cảnh thông minh" },
    { icon: Clock, text: "Hoạt động 24/7 không nghỉ" },
    { icon: Shield, text: "Bảo mật dữ liệu cao" },
    { icon: Users, text: "Hỗ trợ đa kênh" },
    { icon: TrendingUp, text: "Báo cáo chi tiết" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header settings={settings} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image/Icon */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-12 flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="text-9xl mb-6">{product.icon}</div>
                <div className="flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-slate-400 ml-2">(128 đánh giá)</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 text-sm font-bold rounded-full mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  Bán chạy nhất
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>

              <p className="text-xl text-slate-400 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-4xl font-bold text-purple-400">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-slate-400 line-through text-xl">
                    {formatCurrency(product.price * 2)}
                  </span>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    -50%
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Giá trên là giá cho 1 ChatBot. Bạn có thể mua nhiều bot cùng lúc.
                </p>
              </div>

              {/* Add to cart */}
              <AddToCartButton product={product} />

              {/* Features */}
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Tính năng nổi bật:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <feature.icon className="w-5 h-5 text-purple-400" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  "✓ Cài đặt miễn phí",
                  "✓ Hỗ trợ 24/7",
                  "✓ Hoàn tiền 7 ngày",
                ].map((item, i) => (
                  <span key={i} className="px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-16 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Mô tả chi tiết</h2>
              
              <div className="space-y-6 text-slate-300">
                <p>
                  <strong className="text-white">{product.name}</strong> là giải pháp ChatBot AI tiên tiến, 
                  được thiết kế đặc biệt để tự động hóa quy trình kinh doanh và tăng hiệu quả tương tác với khách hàng.
                </p>

                <h3 className="text-xl font-bold text-white">🚀 Lợi ích khi sử dụng:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tự động trả lời khách hàng 24/7, không bỏ lỡ bất kỳ cơ hội nào</li>
                  <li>Giảm 80% thời gian xử lý các câu hỏi thường gặp</li>
                  <li>Tăng tỷ lệ chuyển đổi lên đến 300%</li>
                  <li>Tiết kiệm chi phí nhân sự, không cần thuê thêm nhân viên</li>
                  <li>Tích hợp dễ dàng với Facebook, Zalo, Website</li>
                </ul>

                <h3 className="text-xl font-bold text-white">📦 Bạn sẽ nhận được:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>1 ChatBot AI đã được cấu hình sẵn</li>
                  <li>Hướng dẫn cài đặt chi tiết</li>
                  <li>Hỗ trợ kỹ thuật 24/7</li>
                  <li>Update tính năng mới miễn phí trọn đời</li>
                  <li>Bảo hành và hoàn tiền trong 7 ngày</li>
                </ul>

                <h3 className="text-xl font-bold text-white">⚙️ Yêu cầu kỹ thuật:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fanpage Facebook hoặc Zalo OA (nếu dùng trên các nền tảng này)</li>
                  <li>Website có thể nhúng code (nếu dùng trên web)</li>
                  <li>Không yêu cầu kiến thức lập trình</li>
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">Thông số sản phẩm</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loại sản phẩm</span>
                    <span className="font-medium">ChatBot AI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nền tảng</span>
                    <span className="font-medium">Facebook, Zalo, Web</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngôn ngữ</span>
                    <span className="font-medium">Tiếng Việt</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hỗ trợ</span>
                    <span className="font-medium">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bảo hành</span>
                    <span className="font-medium">Trọn đời</span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6">
                <h3 className="font-bold mb-2">Cần tư vấn?</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Liên hệ ngay để được hỗ trợ chọn ChatBot phù hợp
                </p>
                <a
                  href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                >
                  <Bot className="w-5 h-5" />
                  {settings.site_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">ChatBot liên quan</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/san-pham/${item.slug}`}
                    className="group bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-purple-400 font-bold">
                      {formatCurrency(item.price)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}

