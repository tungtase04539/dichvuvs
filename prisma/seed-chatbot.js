const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@chatbotvn.store" },
    update: {},
    create: {
      email: "admin@chatbotvn.store",
      password: adminPassword,
      name: "Admin",
      role: "admin",
      phone: "0901234567",
    },
  });

  // Create staff users
  const staffPassword = await bcrypt.hash("staff123", 10);
  await prisma.user.upsert({
    where: { email: "staff@chatbotvn.store" },
    update: {},
    create: {
      email: "staff@chatbotvn.store",
      password: staffPassword,
      name: "Nhân viên Support",
      role: "staff",
      phone: "0912345678",
    },
  });

  // Delete old orders and services
  await prisma.order.deleteMany({});
  await prisma.service.deleteMany({});

  // Create 10 Chatbot products
  const chatbots = [
    {
      name: "ChatBot Bán Hàng Pro",
      slug: "chatbot-ban-hang-pro",
      description: "Chatbot AI tự động tư vấn sản phẩm, xử lý đơn hàng, chốt sales 24/7. Tích hợp Facebook, Zalo, Website. Tăng doanh số lên 300%.",
      price: 30000,
      unit: "bot",
      icon: "🛒",
      featured: true,
    },
    {
      name: "ChatBot CSKH Thông Minh",
      slug: "chatbot-cskh-thong-minh", 
      description: "Chatbot chăm sóc khách hàng tự động, trả lời FAQ, xử lý khiếu nại, hỗ trợ 24/7. Giảm 80% thời gian support.",
      price: 30000,
      unit: "bot",
      icon: "🎧",
      featured: true,
    },
    {
      name: "ChatBot Đặt Lịch Hẹn",
      slug: "chatbot-dat-lich-hen",
      description: "Chatbot tự động đặt lịch hẹn cho spa, phòng khám, salon. Nhắc lịch tự động, sync Google Calendar.",
      price: 30000,
      unit: "bot",
      icon: "📅",
      featured: true,
    },
    {
      name: "ChatBot Tư Vấn Bất Động Sản",
      slug: "chatbot-tu-van-bds",
      description: "Chatbot AI tư vấn mua bán nhà đất, lọc khách hàng tiềm năng, gửi thông tin dự án tự động.",
      price: 30000,
      unit: "bot",
      icon: "🏠",
      featured: false,
    },
    {
      name: "ChatBot Giáo Dục Online",
      slug: "chatbot-giao-duc-online",
      description: "Chatbot hỗ trợ học tập, trả lời câu hỏi, giao bài tập, theo dõi tiến độ học viên.",
      price: 30000,
      unit: "bot",
      icon: "📚",
      featured: true,
    },
    {
      name: "ChatBot Nhà Hàng & F&B",
      slug: "chatbot-nha-hang-fnb",
      description: "Chatbot đặt bàn, order món, gợi ý menu, tích điểm khách hàng. Tích hợp POS system.",
      price: 30000,
      unit: "bot",
      icon: "🍽️",
      featured: false,
    },
    {
      name: "ChatBot Du Lịch & Tour",
      slug: "chatbot-du-lich-tour",
      description: "Chatbot tư vấn tour, đặt vé máy bay, khách sạn. Hỗ trợ đa ngôn ngữ cho khách quốc tế.",
      price: 30000,
      unit: "bot",
      icon: "✈️",
      featured: false,
    },
    {
      name: "ChatBot Y Tế & Sức Khỏe",
      slug: "chatbot-y-te-suc-khoe",
      description: "Chatbot tư vấn sức khỏe ban đầu, đặt lịch khám, nhắc uống thuốc, theo dõi sức khỏe.",
      price: 30000,
      unit: "bot",
      icon: "🏥",
      featured: false,
    },
    {
      name: "ChatBot Tuyển Dụng HR",
      slug: "chatbot-tuyen-dung-hr",
      description: "Chatbot tự động sàng lọc CV, phỏng vấn sơ bộ, đặt lịch interview. Tiết kiệm 70% thời gian HR.",
      price: 30000,
      unit: "bot",
      icon: "👔",
      featured: true,
    },
    {
      name: "ChatBot Tài Chính & Ngân Hàng",
      slug: "chatbot-tai-chinh-ngan-hang",
      description: "Chatbot tư vấn khoản vay, bảo hiểm, đầu tư. Kiểm tra số dư, lịch sử giao dịch tự động.",
      price: 30000,
      unit: "bot",
      icon: "💰",
      featured: false,
    },
  ];

  for (const chatbot of chatbots) {
    await prisma.service.upsert({
      where: { slug: chatbot.slug },
      update: chatbot,
      create: chatbot,
    });
  }

  // Update settings
  const settings = [
    { key: "site_name", value: "ChatBot VN Store" },
    { key: "site_phone", value: "1900 8686" },
    { key: "site_email", value: "contact@chatbotvn.store" },
    { key: "site_address", value: "Tầng 5, Tòa nhà ABC, Quận 1, TP.HCM" },
    { key: "working_hours", value: "8:00 - 22:00" },
    { key: "bank_name", value: "MB Bank" },
    { key: "bank_account", value: "0388950297" },
    { key: "bank_owner", value: "TIEU ANH TUNG" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("✅ Database seeded with ChatBot products!");
  console.log("\n📧 Admin login:");
  console.log("   Email: admin@chatbotvn.store");
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

