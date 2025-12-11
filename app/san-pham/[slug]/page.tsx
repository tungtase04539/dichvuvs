"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import AddToCartButton from "./AddToCartButton";
import {
  ArrowLeft,
  Star,
  Zap,
  Shield,
  Clock,
  MessageSquare,
  Bot,
  Users,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string | null;
  price: number;
  icon: string | null;
  featured: boolean;
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data: productData } = await supabase
        .from("Service")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (!productData) {
        router.push("/san-pham");
        return;
      }

      setProduct(productData);

      const { data: relatedData } = await supabase
        .from("Service")
        .select("id, name, slug, price, icon")
        .eq("active", true)
        .neq("slug", params.slug)
        .limit(4);

      if (relatedData) setRelatedProducts(relatedData as Product[]);
      setIsLoading(false);
    };

    loadData();
  }, [params.slug, router]);

  const features = [
    { icon: Zap, text: "Cài đặt trong 5 phút" },
    { icon: MessageSquare, text: "AI hiểu ngữ cảnh thông minh" },
    { icon: Clock, text: "Hoạt động 24/7 không nghỉ" },
    { icon: Shield, text: "Bảo mật dữ liệu cao" },
    { icon: Users, text: "Hỗ trợ đa kênh" },
    { icon: TrendingUp, text: "Báo cáo chi tiết" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Header settings={{}} />

      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-16">
        <div className="container mx-auto px-4">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            QUAY LẠI DANH SÁCH
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{product.icon}</span>
            <div>
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-400 text-slate-900 text-xs font-bold rounded-full mb-2">
                  <Star className="w-3 h-3 fill-current" />
                  BÁN CHẠY NHẤT
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {product.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 uppercase">Mô tả sản phẩm</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div className="bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6 uppercase">Tính năng nổi bật</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-primary-400/20 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <span className="font-medium text-slate-200">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long Description */}
              <div className="bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6 uppercase">Chi tiết sản phẩm</h2>
                <div className="prose prose-slate max-w-none">
                  {product.longDescription ? (
                    <div className="whitespace-pre-wrap text-slate-300">{product.longDescription}</div>
                  ) : (
                    <div className="space-y-6 text-slate-300">
                      <p>
                        <strong className="text-white">{product.name}</strong> là giải pháp ChatBot AI tiên tiến, 
                        được thiết kế đặc biệt để tự động hóa quy trình kinh doanh và tăng hiệu quả tương tác với khách hàng.
                      </p>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">🚀 Lợi ích khi sử dụng:</h3>
                        <ul className="space-y-2">
                          {[
                            "Tự động trả lời khách hàng 24/7, không bỏ lỡ bất kỳ cơ hội nào",
                            "Giảm 80% thời gian xử lý các câu hỏi thường gặp",
                            "Tăng tỷ lệ chuyển đổi lên đến 300%",
                            "Tiết kiệm chi phí nhân sự",
                            "Tích hợp dễ dàng với Facebook, Zalo, Website",
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">📦 Bạn sẽ nhận được:</h3>
                        <ul className="space-y-2">
                          {[
                            "1 ChatBot AI đã được cấu hình sẵn",
                            "Hướng dẫn cài đặt chi tiết",
                            "Hỗ trợ kỹ thuật 24/7",
                            "Update tính năng mới miễn phí trọn đời",
                            "Bảo hành và hoàn tiền trong 7 ngày",
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary-400 fill-primary-400" />
                  ))}
                  <span className="text-sm text-slate-500 ml-2">(128 đánh giá)</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xl text-slate-500 line-through">
                      {formatCurrency(product.price * 2)}
                    </span>
                  </div>
                  <span className="inline-flex px-3 py-1 bg-red-900/50 text-red-400 text-sm font-bold rounded-full">
                    Giảm 50%
                  </span>
                </div>

                <AddToCartButton product={product} />

                {/* Guarantees */}
                <div className="mt-6 space-y-3">
                  {[
                    "✓ Cài đặt miễn phí",
                    "✓ Hỗ trợ 24/7",
                    "✓ Hoàn tiền 7 ngày",
                  ].map((item, i) => (
                    <p key={i} className="text-sm text-green-400 font-medium">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-cta rounded-2xl p-6 text-white border border-primary-400/20">
                <h3 className="font-bold text-lg mb-2 text-primary-400 uppercase">CẦN TƯ VẤN?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Liên hệ ngay để được hỗ trợ chọn ChatBot phù hợp
                </p>
                <a
                  href="tel:0363189699"
                  className="btn bg-primary-400 text-slate-900 hover:bg-primary-300 w-full font-bold uppercase shadow-lg shadow-primary-400/30"
                >
                  <Bot className="w-5 h-5" />
                  0363 189 699
                </a>
              </div>

              {/* Specs */}
              <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700">
                <h3 className="font-bold text-white mb-4 uppercase">Thông số sản phẩm</h3>
                <div className="space-y-3">
                  {[
                    { label: "Loại sản phẩm", value: "ChatBot AI" },
                    { label: "Nền tảng", value: "Facebook, Zalo, Web" },
                    { label: "Ngôn ngữ", value: "Tiếng Việt" },
                    { label: "Hỗ trợ", value: "24/7" },
                    { label: "Bảo hành", value: "Trọn đời" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8 uppercase">ChatBot liên quan</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/san-pham/${item.slug}`}
                    className="group bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-primary-400/50 transition-all hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-primary-400 font-bold">
                      {formatCurrency(item.price)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer settings={{}} />
      <ChatWidget />
    </div>
  );
}
