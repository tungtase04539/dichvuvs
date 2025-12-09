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
  Award
} from "lucide-react";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";

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
  const featuredServices = services.filter((s) => s.featured);

  return (
    <div className="min-h-screen bg-white">
      <Header settings={settings} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-32 pb-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: "1s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-slate-600">Dịch vụ vệ sinh #1 TP.HCM</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 mb-6 animate-slide-up">
              Ngôi nhà sạch sẽ,
              <span className="gradient-text block mt-2">Cuộc sống tươi mới</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
              Đội ngũ chuyên nghiệp, tận tâm mang đến không gian sống sạch sẽ, trong lành cho gia đình bạn. 
              Đặt lịch ngay - không cần đăng ký!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Link
                href="/dat-lich"
                className="btn btn-primary text-lg px-8 py-4"
              >
                <Sparkles className="w-5 h-5" />
                Đặt lịch ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                className="btn btn-outline text-lg px-8 py-4"
              >
                <Phone className="w-5 h-5" />
                {settings.site_phone || "1900 1234"}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                <span>10,000+ khách hàng</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                <span>4.9/5 đánh giá</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-5 h-5 text-primary-500" />
                <span>Bảo hành dịch vụ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 animate-stagger">
            {[
              { icon: Shield, title: "An toàn", desc: "Nhân viên được kiểm tra lý lịch" },
              { icon: Award, title: "Chuyên nghiệp", desc: "Đào tạo bài bản, kinh nghiệm" },
              { icon: Clock, title: "Đúng giờ", desc: "Cam kết thời gian hoàn thành" },
              { icon: Users, title: "Tận tâm", desc: "Hỗ trợ 24/7, lắng nghe khách hàng" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
                  <item.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50" id="dich-vu">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Dịch vụ của chúng tôi
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Giải pháp vệ sinh toàn diện
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Đa dạng dịch vụ đáp ứng mọi nhu cầu vệ sinh của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
            {services.map((service, i) => (
              <Link
                key={service.id}
                href={`/dich-vu/${service.slug}`}
                className="card card-hover p-6 group"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-semibold">
                    {formatCurrency(service.price)}/{service.unit}
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
                {service.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="badge bg-accent-100 text-accent-700">
                      <Star className="w-3 h-3 fill-current" />
                      Phổ biến
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Sẵn sàng có không gian sạch sẽ?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Đặt lịch ngay hôm nay và nhận ưu đãi giảm 10% cho lần đầu sử dụng dịch vụ!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dat-lich"
                className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-4 shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Đặt lịch ngay
              </Link>
              <Link
                href="/bang-gia"
                className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                Xem bảng giá
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-medium mb-4">
              Quy trình đơn giản
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Cách đặt dịch vụ
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Chỉ 3 bước đơn giản để có không gian sạch sẽ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Chọn dịch vụ", desc: "Chọn dịch vụ phù hợp với nhu cầu của bạn" },
              { step: "02", title: "Đặt lịch hẹn", desc: "Chọn ngày giờ thuận tiện, nhập thông tin liên hệ" },
              { step: "03", title: "Nhận dịch vụ", desc: "Nhân viên đến đúng hẹn, hoàn thành công việc" },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-display text-2xl font-bold mb-6 shadow-lg shadow-primary-500/30">
                  {item.step}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-current" />
              Khách hàng nói gì
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Đánh giá từ khách hàng
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Chị Lan - Q.7", text: "Dịch vụ rất chuyên nghiệp, nhân viên thân thiện. Nhà tôi sạch bóng sau khi họ làm xong!", rating: 5 },
              { name: "Anh Minh - Q.2", text: "Đã sử dụng nhiều lần, luôn hài lòng. Giá cả hợp lý, nhân viên đúng giờ.", rating: 5 },
              { name: "Chị Hương - Bình Thạnh", text: "Rất ấn tượng với chất lượng giặt sofa. Ghế như mới luôn. Sẽ tiếp tục ủng hộ!", rating: 5 },
            ].map((item, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-accent-500 fill-accent-500" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">&ldquo;{item.text}&rdquo;</p>
                <p className="font-semibold text-slate-900">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-white" id="lien-he">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Liên hệ với chúng tôi
              </h2>
              <p className="text-xl text-slate-600">
                Sẵn sàng hỗ trợ bạn mọi lúc
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <a href={`tel:${settings.site_phone?.replace(/\s/g, "")}`} className="card card-hover p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 mb-4">
                  <Phone className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Hotline</h3>
                <p className="text-primary-600 font-semibold text-lg">{settings.site_phone}</p>
              </a>

              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 mb-4">
                  <MapPin className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Địa chỉ</h3>
                <p className="text-slate-600">{settings.site_address}</p>
              </div>

              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 mb-4">
                  <Clock className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Giờ làm việc</h3>
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

