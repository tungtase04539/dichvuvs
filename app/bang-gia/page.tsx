import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";

async function getServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { price: "asc" }],
  });
}

async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

export default async function PricingPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header settings={settings} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Bảng giá dịch vụ
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Giá dịch vụ minh bạch
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Cam kết giá cạnh tranh nhất thị trường. Không phát sinh chi phí ngoài.
            </p>
          </div>

          {/* Price table */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Dịch vụ</th>
                    <th className="px-6 py-4 text-center font-semibold">Đơn vị</th>
                    <th className="px-6 py-4 text-right font-semibold">Đơn giá</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr
                      key={service.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{service.icon}</span>
                          <div>
                            <p className="font-semibold text-slate-900">{service.name}</p>
                            <p className="text-sm text-slate-500 max-w-xs">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-slate-600">
                        {service.unit}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-xl font-bold text-primary-600">
                          {formatCurrency(service.price)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/dat-lich?service=${service.id}`}
                          className="btn btn-primary text-sm"
                        >
                          Đặt ngay
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <div className="mt-8 bg-primary-50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Lưu ý:</h3>
              <ul className="space-y-2">
                {[
                  "Giá trên là giá tham khảo, có thể thay đổi tùy theo tình trạng thực tế.",
                  "Giảm 10% cho khách hàng mới sử dụng dịch vụ lần đầu.",
                  "Giảm 15% cho đơn hàng trên 2.000.000đ.",
                  "Miễn phí khảo sát và báo giá tại nhà.",
                  "Bảo hành dịch vụ 7 ngày sau khi hoàn thành.",
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4">
                Có thắc mắc về giá dịch vụ? Liên hệ ngay để được tư vấn miễn phí!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dat-lich" className="btn btn-primary">
                  <Sparkles className="w-5 h-5" />
                  Đặt lịch ngay
                </Link>
                <a
                  href={`tel:${settings.site_phone?.replace(/\s/g, "")}`}
                  className="btn btn-outline"
                >
                  Gọi hotline: {settings.site_phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}

