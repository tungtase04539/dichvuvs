"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  Loader2,
  Star,
  Check,
  Sparkles,
  ShoppingCart,
  Phone,
  Mail,
  User,
  ChevronRight,
} from "lucide-react";

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  price: number;
  priceGold?: number | null;
  pricePlatinum?: number | null;
  image?: string | null;
  videoUrl?: string | null;
  featured: boolean;
  industry?: string | null;
}

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const refCode = searchParams.get("ref");

  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchBundle();
  }, [slug]);

  const fetchBundle = async () => {
    try {
      const res = await fetch(`/api/bundles/${slug}`);
      const data = await res.json();
      if (data.bundle) {
        setBundle(data.bundle);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPrice = () => {
    if (!bundle) return 0;
    if (selectedPackage === "gold" && bundle.priceGold) return bundle.priceGold;
    if (selectedPackage === "platinum" && bundle.pricePlatinum) return bundle.pricePlatinum;
    return bundle.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundle) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bundle-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId: bundle.id,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          packageType: selectedPackage,
          referralCode: refCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        router.push(`/dat-bo-tro-ly/thanh-cong?code=${data.order.orderCode}`);
      } else {
        alert(data.error || "Lỗi đặt hàng");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Lỗi kết nối");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header settings={{}} />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      <Footer settings={{}} />
      </>
    );
  }

  if (!bundle) {
    return (
      <>
        <Header settings={{}} />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Package className="w-20 h-20 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy</h1>
          <p className="text-slate-500 mb-6">Bộ trợ lý không tồn tại</p>
          <Link href="/bo-tro-ly" className="btn btn-primary">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
        </div>
      <Footer settings={{}} />
      </>
    );
  }

  const packages = [
    {
      id: "standard",
      name: "Standard",
      price: bundle.price,
      color: "slate",
      features: ["Truy cập đầy đủ bộ trợ lý", "Hỗ trợ qua nhóm Zalo", "Cập nhật miễn phí"],
    },
    {
      id: "gold",
      name: "Gold",
      price: bundle.priceGold || bundle.price * 1.5,
      color: "amber",
      features: ["Tất cả tính năng Standard", "Hỗ trợ ưu tiên 1-1", "Tùy chỉnh theo yêu cầu", "Training 30 phút"],
      popular: true,
    },
    {
      id: "platinum",
      name: "Platinum",
      price: bundle.pricePlatinum || bundle.price * 2.5,
      color: "cyan",
      features: ["Tất cả tính năng Gold", "Hotline hỗ trợ 24/7", "Setup theo nghiệp vụ", "Training 1 buổi trực tiếp"],
    },
  ];

  return (
    <>
      <Header settings={{}} />
      <main className="min-h-screen bg-slate-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-primary-600">Trang chủ</Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <Link href="/bo-tro-ly" className="text-slate-500 hover:text-primary-600">Bộ Trợ Lý</Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-medium">{bundle.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Bundle Info */}
            <div>
              {/* Image */}
              <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-purple-100 rounded-3xl overflow-hidden mb-6">
                {bundle.image ? (
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-24 h-24 text-primary-300" />
                  </div>
                )}
                {bundle.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-bold rounded-full">
                      <Star className="w-4 h-4 fill-white" />
                      Nổi bật
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                {bundle.name}
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                {bundle.description}
              </p>

              {/* Long Description */}
              {bundle.longDescription && (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: bundle.longDescription }}
                />
              )}
            </div>

            {/* Right: Order Form */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Chọn gói phù hợp
                </div>

                {/* Package Selection */}
                <div className="space-y-3 mb-6">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative ${
                        selectedPackage === pkg.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-4 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                          Phổ biến
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{pkg.name}</span>
                        <span className="text-xl font-black text-primary-600">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                {/* Order Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Họ tên *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="0912345678"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email (khuyến nghị)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-600">Tổng thanh toán</span>
                      <span className="text-3xl font-black text-primary-600">
                        {formatCurrency(getPrice())}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn btn-primary py-4 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Đặt hàng ngay
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Trust Badge */}
                <p className="text-center text-xs text-slate-400 mt-4">
                  🔒 Thanh toán an toàn • Hỗ trợ 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={{}} />
    </>
  );
}
