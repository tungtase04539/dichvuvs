import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Star, 
  ArrowRight,
  Sparkles,
  Building2,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Heart,
  DollarSign,
  Home,
  Utensils,
  Plane,
} from "lucide-react";

// Industry icons mapping
const industryIcons: Record<string, any> = {
  marketing: TrendingUp,
  education: GraduationCap,
  ecommerce: ShoppingCart,
  healthcare: Heart,
  finance: DollarSign,
  realestate: Home,
  food: Utensils,
  travel: Plane,
  other: Briefcase,
};

const industryLabels: Record<string, string> = {
  marketing: "Marketing",
  education: "Giáo dục",
  ecommerce: "Thương mại điện tử",
  healthcare: "Y tế",
  finance: "Tài chính",
  realestate: "Bất động sản",
  food: "Ẩm thực",
  travel: "Du lịch",
  other: "Khác",
};

async function getBundles() {
  try {
    const bundles = await prisma.assistantBundle.findMany({
      where: { active: true },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" }
      ]
    });
    return bundles;
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return [];
  }
}

export default async function BundlesPage() {
  const bundles = await getBundles();

  return (
    <>
      <Header settings={{}} />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full text-primary-600 text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                Bộ sưu tập AI theo ngành nghề
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Bộ Trợ Lý AI
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
                  {" "}Chuyên Ngành
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Các bộ công cụ AI được thiết kế riêng cho từng lĩnh vực, 
                giúp bạn tiết kiệm thời gian và tối ưu hiệu quả công việc
              </p>
            </div>
          </div>
        </section>

        {/* Bundles Grid */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            {bundles.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Sắp ra mắt
                </h2>
                <p className="text-slate-500">
                  Các bộ trợ lý AI đang được chuẩn bị. Quay lại sau nhé!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bundles.map((bundle) => {
                  const IndustryIcon = industryIcons[bundle.industry || "other"] || Briefcase;
                  
                  return (
                    <Link
                      key={bundle.id}
                      href={`/bo-tro-ly/${bundle.slug}`}
                      className="group relative bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500 hover:-translate-y-1"
                    >
                      {/* Featured Badge */}
                      {bundle.featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                            <Star className="w-3 h-3 fill-white" />
                            HOT
                          </span>
                        </div>
                      )}

                      {/* Image */}
                      <div className="aspect-[16/10] bg-gradient-to-br from-primary-100 to-purple-100 relative overflow-hidden">
                        {bundle.image ? (
                          <img
                            src={bundle.image}
                            alt={bundle.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-20 h-20 text-primary-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Industry Tag */}
                        {bundle.industry && (
                          <div className="flex items-center gap-2 mb-3">
                            <IndustryIcon className="w-4 h-4 text-primary-500" />
                            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                              {industryLabels[bundle.industry] || bundle.industry}
                            </span>
                          </div>
                        )}

                        <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {bundle.name}
                        </h2>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {bundle.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Chỉ từ</p>
                            <p className="text-2xl font-black text-primary-600">
                              {formatCurrency(bundle.price)}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-500 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Không tìm thấy bộ phù hợp?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Xem thêm các trợ lý AI đơn lẻ hoặc liên hệ để được tư vấn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/san-pham"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <Package className="w-5 h-5" />
                Xem Trợ Lý Đơn Lẻ
              </Link>
              <Link
                href="/lien-he"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors border border-white/20"
              >
                <Users className="w-5 h-5" />
                Liên Hệ Tư Vấn
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={{}} />
    </>
  );
}
