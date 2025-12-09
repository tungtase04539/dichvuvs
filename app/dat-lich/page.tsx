import prisma from "@/lib/prisma";
import BookingForm from "./BookingForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

async function getServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

export default async function BookingPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header settings={settings} />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Đặt lịch dịch vụ
              </h1>
              <p className="text-xl text-slate-600">
                Điền thông tin bên dưới để đặt lịch. Không cần đăng ký tài khoản!
              </p>
            </div>

            <BookingForm services={services} />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}

