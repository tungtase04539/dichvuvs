"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Quote, Play, Image, MessageSquare, ThumbsUp, CheckCircle } from "lucide-react";

export default function DanhGiaPage() {
  const reviews = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      role: "CEO, TechStore",
      avatar: "A",
      rating: 5,
      content: "ChatBot giúp shop tôi tiết kiệm 80% thời gian trả lời tin nhắn. Doanh số tăng 40% sau 2 tháng sử dụng! Rất đáng tiền, mình đã giới thiệu cho nhiều bạn bè.",
      date: "10/12/2024",
      verified: true,
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      role: "Founder, BeautyShop",
      avatar: "B",
      rating: 5,
      content: "Rất hài lòng với dịch vụ. ChatBot thông minh, hiểu khách hàng và tư vấn chính xác. Đội ngũ support rất nhiệt tình, hỗ trợ 24/7!",
      date: "09/12/2024",
      verified: true,
    },
    {
      id: 3,
      name: "Lê Minh Châu",
      role: "Marketing Manager",
      avatar: "C",
      rating: 5,
      content: "Giá cả phải chăng, hiệu quả cao. ChatBot giúp team tôi focus vào những việc quan trọng hơn. Đầu tư 29K mà tiết kiệm được cả triệu đồng/tháng.",
      date: "08/12/2024",
      verified: true,
    },
    {
      id: 4,
      name: "Phạm Hoàng Duy",
      role: "Shop online Thời trang",
      avatar: "D",
      rating: 5,
      content: "Ban đầu còn nghi ngờ, nhưng sau khi dùng thử 3 ngày thì quyết định mua luôn. ChatBot trả lời nhanh, chính xác, khách hàng rất hài lòng.",
      date: "07/12/2024",
      verified: true,
    },
    {
      id: 5,
      name: "Võ Thị Em",
      role: "Spa & Làm đẹp",
      avatar: "E",
      rating: 5,
      content: "Mình dùng ChatBot đặt lịch cho spa, khách hàng có thể tự đặt lịch 24/7 mà không cần gọi điện. Tiện lợi vô cùng, không còn bỏ lỡ khách nữa!",
      date: "06/12/2024",
      verified: true,
    },
    {
      id: 6,
      name: "Nguyễn Minh Phúc",
      role: "Nhà hàng ABC",
      avatar: "P",
      rating: 5,
      content: "ChatBot giúp nhận đơn đặt bàn và tư vấn menu tự động. Nhân viên giờ có thể tập trung phục vụ khách thay vì trả lời tin nhắn.",
      date: "05/12/2024",
      verified: true,
    },
  ];

  const stats = [
    { value: "10,000+", label: "Khách hàng tin dùng" },
    { value: "4.9/5", label: "Đánh giá trung bình" },
    { value: "98%", label: "Khách hàng hài lòng" },
    { value: "500+", label: "Đánh giá 5 sao" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-400/20 mb-6 border border-primary-400/30">
            <MessageSquare className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase">
            Ý KIẾN <span className="text-primary-400">KHÁCH HÀNG</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Hơn 10,000 khách hàng đã tin tưởng sử dụng ChatBotVN. Xem họ nói gì về chúng tôi!
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-800 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary-400 mb-1">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-primary-400/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 font-bold text-lg">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{review.name}</p>
                        {review.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{review.role}</p>
                    </div>
                  </div>
                  <Quote className="w-8 h-8 text-primary-400/30" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? "text-primary-400 fill-primary-400" : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-300 mb-4 leading-relaxed">"{review.content}"</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{review.date}</span>
                  <button className="flex items-center gap-1 text-slate-400 hover:text-primary-400 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Hữu ích
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Reviews */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">
              VIDEO ĐÁNH GIÁ
            </h2>
            <p className="text-slate-400">Xem khách hàng chia sẻ trải nghiệm thực tế</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="aspect-video bg-slate-700 rounded-2xl flex items-center justify-center cursor-pointer group hover:bg-slate-600 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-primary-400/20 flex items-center justify-center group-hover:bg-primary-400/30 transition-colors">
                  <Play className="w-8 h-8 text-primary-400 fill-primary-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase">
            Bạn cũng muốn trải nghiệm?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Đăng ký dùng thử 3 ngày miễn phí hoặc mua ngay với giá chỉ 29K/tháng
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dung-thu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 uppercase"
            >
              DÙNG THỬ MIỄN PHÍ
            </a>
            <a
              href="/dat-hang"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-primary-400 border-2 border-primary-400/50 font-bold rounded-xl hover:bg-primary-400/10 uppercase"
            >
              MUA NGAY 29K
            </a>
          </div>
        </div>
      </section>

      <Footer settings={{}} />
    </div>
  );
}

