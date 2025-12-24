"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Newspaper, Calendar, ArrowRight, Gift, Zap, TrendingUp, Star } from "lucide-react";

export default function TinTucPage() {
  const news = [
    {
      id: 1,
      title: "🎁 TẶNG CHATBOT MIỄN PHÍ - Chỉ cần tham gia nhóm Zalo",
      excerpt: "Cơ hội nhận ChatBot AI hoàn toàn miễn phí khi tham gia cộng đồng ChatBotVN trên Zalo. Số lượng có hạn!",
      date: "11/12/2025",
      category: "Khuyến mãi",
      image: "🎁",
      hot: true,
      link: "/qua-tang",
    },
    {
      id: 2,
      title: "⚡ FLASH SALE - Giảm đến 50% tất cả ChatBot",
      excerpt: "Đợt sale lớn nhất năm! Mua ChatBot với giá chỉ 29K, kèm theo hàng loạt quà tặng hấp dẫn.",
      date: "11/12/2025",
      category: "Flash Sale",
      image: "⚡",
      hot: true,
      link: "/flash-sale",
    },
    {
      id: 3,
      title: "🚀 Ra mắt ChatBot Bán Hàng Pro phiên bản mới",
      excerpt: "Phiên bản mới với AI thông minh hơn, tự động chốt đơn hiệu quả hơn, tăng tỷ lệ chuyển đổi lên 300%.",
      date: "10/12/2025",
      category: "Sản phẩm mới",
      image: "🚀",
      link: "/san-pham",
    },
    {
      id: 4,
      title: "💰 Kiếm tiền không giới hạn với chương trình CTV",
      excerpt: "Đăng ký trở thành Cộng tác viên/Đại lý để nhận hoa hồng hấp dẫn từ mỗi đơn hàng thành công.",
      date: "09/12/2025",
      category: "Cơ hội việc làm",
      image: "💰",
      link: "/dang-ky-ctv",
    },
    {
      id: 5,
      title: "📊 Khách hàng ABC tăng doanh số 500% sau 1 tháng",
      excerpt: "Câu chuyện thành công của shop online ABC khi sử dụng ChatBot AI tự động chăm sóc khách hàng.",
      date: "08/12/2025",
      category: "Câu chuyện thành công",
      image: "📊",
      link: "/danh-gia",
    },
    {
      id: 6,
      title: "🎓 Hướng dẫn cài đặt ChatBot trong 5 phút",
      excerpt: "Video hướng dẫn chi tiết cách cài đặt và cấu hình ChatBot AI cho người mới bắt đầu.",
      date: "07/12/2025",
      category: "Hướng dẫn",
      image: "🎓",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-400/20 mb-6 border border-primary-400/30">
            <Newspaper className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase">
            TIN TỨC <span className="text-primary-400">HOT</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Cập nhật những tin tức mới nhất, khuyến mãi hấp dẫn và cơ hội kiếm tiền từ ChatBotVN
          </p>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {news.filter(n => n.hot).map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="group relative bg-gradient-to-br from-primary-400/20 to-primary-600/10 rounded-2xl p-8 border border-primary-400/30 hover:border-primary-400/50 transition-all hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    <Zap className="w-3 h-3" />
                    HOT
                  </span>
                </div>
                <span className="text-6xl mb-4 block">{item.image}</span>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-primary-400/20 text-primary-400 text-xs font-bold rounded-full">
                    {item.category}
                  </span>
                  <span className="text-slate-500 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400">{item.excerpt}</p>
                <div className="mt-4 flex items-center gap-2 text-primary-400 font-medium">
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Other News */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.filter(n => !n.hot).map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="group bg-slate-700/50 rounded-2xl p-6 border border-slate-700 hover:border-primary-400/50 transition-all hover:-translate-y-1"
              >
                <span className="text-4xl mb-4 block">{item.image}</span>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs font-bold rounded-full">
                    {item.category}
                  </span>
                  <span className="text-slate-500 text-xs">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase">
            Đừng bỏ lỡ tin tức và ưu đãi mới nhất!
          </h2>
          <p className="text-slate-300 mb-6">
            Tham gia nhóm Zalo để cập nhật ngay khi có khuyến mãi
          </p>
          <a
            href="https://zalo.me/g/ubarcp690"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 uppercase"
          >
            <Gift className="w-5 h-5" />
            THAM GIA NHÓM ZALO
          </a>
        </div>
      </section>

      <Footer settings={{}} />
    </div>
  );
}

