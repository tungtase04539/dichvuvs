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
  Users,
  Award,
  Zap,
  Heart,
  ThumbsUp,
  Play,
} from "lucide-react";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";

export const revalidate = 300; // Cache 5 minutes

async function getServices() {
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
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header settings={settings} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.04%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-60" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-300 to-emerald-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg shadow-emerald-500/10 mb-8 animate-fade-in border border-emerald-100">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-700">Dịch vụ vệ sinh #1 TP.HCM</span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 leading-tight animate-slide-up">
              Không gian sạch,
              <span className="block mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Cuộc sống xanh
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
              Đội ngũ <span className="text-emerald-600 font-semibold">500+ nhân viên</span> chuyên nghiệp, 
              tận tâm mang đến không gian sống trong lành cho <span className="text-emerald-600 font-semibold">10,000+ gia đình</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Link
                href="/dat-lich"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                Đặt lịch miễn phí
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-2xl border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-emerald-500" />
                {settings.site_phone || "1900 1234"}
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
              {[
                { icon: Users, text: "10,000+ khách hàng", color: "text-emerald-500" },
                { icon: Star, text: "4.9/5 đánh giá", color: "text-yellow-500" },
                { icon: Shield, text: "Bảo hành 100%", color: "text-blue-500" },
                { icon: Zap, text: "Phản hồi 30 phút", color: "text-orange-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-slate-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Tại sao chọn chúng tôi?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Dịch vụ <span className="text-emerald-500">5 sao</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "An toàn tuyệt đối", desc: "Nhân viên được đào tạo bài bản, kiểm tra lý lịch kỹ càng", color: "from-blue-500 to-cyan-500" },
              { icon: Award, title: "Chất lượng hàng đầu", desc: "Sử dụng hóa chất nhập khẩu, thiết bị hiện đại nhất", color: "from-emerald-500 to-teal-500" },
              { icon: Clock, title: "Đúng giờ 100%", desc: "Cam kết đến đúng hẹn, hoàn thành đúng thời gian", color: "from-orange-500 to-yellow-500" },
              { icon: Heart, title: "Tận tâm phục vụ", desc: "Hỗ trợ 24/7, luôn lắng nghe và đáp ứng mọi yêu cầu", color: "from-pink-500 to-rose-500" },
            ].map((item, i) => (
              <div key={i} className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-transparent hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white" id="dich-vu">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Dịch vụ của chúng tôi
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Giải pháp vệ sinh <span className="text-emerald-500">toàn diện</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Đa dạng dịch vụ đáp ứng mọi nhu cầu vệ sinh của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <Link
                key={service.id}
                href={`/dat-lich?service=${service.id}`}
                className="group relative bg-white p-6 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {service.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      HOT
                    </span>
                  </div>
                )}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(service.price)}
                    </span>
                    <span className="text-slate-400">/{service.unit}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/bang-gia"
              className="inline-flex items-center gap-2 px-6 py-3 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Xem tất cả bảng giá
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">
              Quy trình đơn giản
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Chỉ <span className="text-emerald-500">3 bước</span> đơn giản
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-full" />
            
            {[
              { step: "01", title: "Chọn dịch vụ", desc: "Chọn dịch vụ phù hợp với nhu cầu của bạn từ danh sách", icon: "🎯" },
              { step: "02", title: "Đặt lịch hẹn", desc: "Chọn ngày giờ thuận tiện và nhập thông tin liên hệ", icon: "📅" },
              { step: "03", title: "Nhận dịch vụ", desc: "Nhân viên đến đúng hẹn và hoàn thành công việc", icon: "✨" },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-4xl mb-6 shadow-xl shadow-emerald-500/30 relative z-10">
                  {item.icon}
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-emerald-600 border-2 border-emerald-200">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "10,000+", label: "Khách hàng hài lòng" },
              { number: "500+", label: "Nhân viên chuyên nghiệp" },
              { number: "50,000+", label: "Dự án hoàn thành" },
              { number: "99%", label: "Tỷ lệ hài lòng" },
            ].map((stat, i) => (
              <div key={i} className="p-6">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.number}</div>
                <div className="text-emerald-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4 inline mr-1 fill-current" />
              Khách hàng nói gì
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              <span className="text-emerald-500">4.9/5</span> từ 10,000+ đánh giá
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Chị Lan", location: "Quận 7", text: "Dịch vụ xuất sắc! Nhân viên rất chuyên nghiệp, nhà tôi sạch bóng sau khi họ làm xong. Chắc chắn sẽ tiếp tục sử dụng!", avatar: "🌸" },
              { name: "Anh Minh", location: "Quận 2", text: "Đã sử dụng nhiều lần, lần nào cũng hài lòng. Giá cả hợp lý, nhân viên đúng giờ và làm việc rất cẩn thận.", avatar: "👨" },
              { name: "Chị Hương", location: "Bình Thạnh", text: "Rất ấn tượng với chất lượng giặt sofa. Ghế như mới luôn, mùi thơm dễ chịu. Highly recommend!", avatar: "💐" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center text-2xl">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Ưu đãi đặc biệt
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Giảm ngay 20% cho lần đầu!
              </h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Đặt lịch ngay hôm nay và trải nghiệm dịch vụ vệ sinh chuyên nghiệp hàng đầu TP.HCM
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dat-lich"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-600 text-lg font-bold rounded-2xl hover:bg-emerald-50 transition-colors shadow-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  Đặt lịch ngay
                </Link>
                <a
                  href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Gọi ngay: {settings.site_phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-slate-50" id="lien-he">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Liên hệ với chúng tôi
              </h2>
              <p className="text-xl text-slate-600">
                Sẵn sàng hỗ trợ bạn 24/7
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <a href={`tel:${settings.site_phone?.replace(/\s/g, "")}`} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Hotline 24/7</h3>
                <p className="text-2xl font-bold text-emerald-600">{settings.site_phone}</p>
              </a>

              <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Địa chỉ</h3>
                <p className="text-slate-600">{settings.site_address}</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Giờ làm việc</h3>
                <p className="text-slate-600">{settings.working_hours}</p>
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
