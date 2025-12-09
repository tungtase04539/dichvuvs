import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  Heart,
  Bot,
  MessageSquare,
  TrendingUp,
  Users,
  ShoppingCart,
} from "lucide-react";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";

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

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Header settings={settings} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%238b5cf6%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500 rounded-full blur-[200px] opacity-10" />

        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-8 animate-fade-in">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">ChatBot AI #1 Việt Nam</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold">NEW</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-slide-up">
              <span className="text-white">ChatBot AI</span>
              <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Cho Mọi Doanh Nghiệp
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
              Tự động hóa kinh doanh với ChatBot AI thông minh. 
              Chỉ <span className="text-purple-400 font-bold">30.000đ/bot</span> - Sở hữu ngay hôm nay!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Link
                href="/san-pham"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                Mua ChatBot Ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white text-lg font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-purple-400" />
                {settings.site_phone || "1900 8686"}
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
              {[
                { icon: Users, value: "5,000+", label: "Khách hàng" },
                { icon: Bot, value: "10,000+", label: "Bot đã bán" },
                { icon: Star, value: "4.9/5", label: "Đánh giá" },
                { icon: Zap, value: "24/7", label: "Hoạt động" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <stat.icon className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className="font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900/50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-4 border border-purple-500/20">
              Tại sao chọn chúng tôi?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              ChatBot <span className="text-purple-400">Thế Hệ Mới</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Cài đặt 5 phút", desc: "Không cần code, chỉ cần kết nối và sử dụng ngay", color: "from-yellow-500 to-orange-500" },
              { icon: MessageSquare, title: "AI Thông Minh", desc: "Hiểu ngữ cảnh, trả lời tự nhiên như người thật", color: "from-purple-500 to-pink-500" },
              { icon: TrendingUp, title: "Tăng 300% Sales", desc: "Chốt đơn tự động 24/7, không bỏ lỡ khách hàng", color: "from-green-500 to-emerald-500" },
              { icon: Shield, title: "Bảo mật cao", desc: "Dữ liệu được mã hóa, bảo vệ thông tin khách hàng", color: "from-blue-500 to-cyan-500" },
            ].map((item, i) => (
              <div key={i} className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-slate-950" id="san-pham">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-semibold mb-4 border border-cyan-500/20">
              <Bot className="w-4 h-4 inline mr-1" />
              Sản phẩm ChatBot
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Chọn <span className="text-cyan-400">ChatBot</span> Phù Hợp
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              10+ loại ChatBot chuyên biệt cho từng ngành nghề
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="group relative bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                {product.featured && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 text-xs font-bold rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      HOT
                    </span>
                  </div>
                )}
                <div className="text-4xl mb-3">{product.icon}</div>
                <h3 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-400">
                    {formatCurrency(product.price)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 px-6 py-3 text-purple-400 font-semibold hover:text-purple-300 transition-colors"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing highlight */}
      <section className="py-24 bg-gradient-to-r from-purple-900/50 via-slate-900 to-pink-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Chỉ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">30.000đ</span> / ChatBot
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Mua càng nhiều, tiết kiệm càng lớn. Sở hữu trọn bộ ChatBot cho doanh nghiệp của bạn!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                "✓ Cài đặt miễn phí",
                "✓ Hỗ trợ 24/7",
                "✓ Update trọn đời",
                "✓ Hoàn tiền 7 ngày",
              ].map((item, i) => (
                <span key={i} className="px-4 py-2 bg-white/10 rounded-full text-sm text-slate-300">
                  {item}
                </span>
              ))}
            </div>

            <Link
              href="/dat-hang"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <ShoppingCart className="w-6 h-6" />
              Mua Ngay - Giảm 20%
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-semibold mb-4 border border-yellow-500/20">
              <Star className="w-4 h-4 inline mr-1 fill-current" />
              Đánh giá từ khách hàng
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-yellow-400">5,000+</span> Doanh Nghiệp Tin Dùng
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Anh Minh", company: "Shop Thời Trang", text: "ChatBot bán hàng giúp tôi tăng 200% đơn hàng. Chốt sales 24/7 mà không cần thuê thêm nhân viên!", avatar: "👨‍💼" },
              { name: "Chị Lan", company: "Spa Beauty", text: "Đặt lịch tự động rất tiện, khách hàng không phải chờ đợi. Tỷ lệ book lịch tăng gấp 3 lần.", avatar: "👩‍💼" },
              { name: "Anh Hùng", company: "BĐS Phú Gia", text: "Chatbot lọc khách tiềm năng cực kỳ hiệu quả. Tiết kiệm được 70% thời gian tư vấn.", avatar: "🧑‍💼" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Bắt đầu với ChatBot AI ngay hôm nay!
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Đừng để đối thủ đi trước. Tự động hóa kinh doanh với ChatBot AI thông minh.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dat-hang"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Mua ChatBot Ngay
                </Link>
                <a
                  href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white text-lg font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Tư vấn miễn phí
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-slate-950" id="lien-he">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Liên hệ với chúng tôi
              </h2>
              <p className="text-xl text-slate-400">
                Hỗ trợ 24/7 - Sẵn sàng tư vấn miễn phí
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <a href={`tel:${settings.site_phone?.replace(/\s/g, "")}`} className="group bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Hotline 24/7</h3>
                <p className="text-xl font-bold text-purple-400">{settings.site_phone}</p>
              </a>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Địa chỉ</h3>
                <p className="text-slate-400">{settings.site_address}</p>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Giờ làm việc</h3>
                <p className="text-slate-400">{settings.working_hours}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}
