import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Danh sách tên Việt Nam ngẫu nhiên
const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Võ", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"];
const middleNames = ["Văn", "Thị", "Hữu", "Đức", "Minh", "Thanh", "Quốc", "Anh", "Hoài", "Bảo", "Kim", "Ngọc", "Như", "Gia", "Thiên"];
const lastNames = ["An", "Bình", "Cường", "Dũng", "Em", "Phúc", "Giang", "Hải", "Hùng", "Khoa", "Linh", "Long", "Mai", "Nam", "Phong", "Quân", "Sơn", "Tâm", "Thắng", "Tú", "Vy", "Xuân", "Yến", "Hoa", "Lan", "Hương", "Thảo", "Trang", "Ngân", "Hạnh"];

function randomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${middle} ${last}`;
}

function randomPhone() {
  const prefixes = ["090", "091", "093", "094", "096", "097", "098", "086", "083", "084", "085", "088", "089"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return prefix + number;
}

function randomCode(prefix: string, index: number) {
  return `${prefix}${index.toString().padStart(3, "0")}`;
}

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@chatbotvn.com" },
    update: {},
    create: {
      email: "admin@chatbotvn.com",
      password: adminPassword,
      name: "Admin",
      role: "admin",
      phone: "0901234567",
    },
  });

  const password = await bcrypt.hash("123456", 10);

  // Create staff users
  const staffPassword = await bcrypt.hash("staff123", 10);
  await prisma.user.upsert({
    where: { email: "nhanvien1@chatbotvn.com" },
    update: {},
    create: {
      email: "nhanvien1@chatbotvn.com",
      password: staffPassword,
      name: "Nguyễn Văn An",
      role: "staff",
      phone: "0912345678",
    },
  });

  // Create services
  const services = [
    {
      name: "ChatBot Bán Hàng",
      slug: "chatbot-ban-hang",
      description: "ChatBot AI tự động tư vấn sản phẩm, xử lý đơn hàng, chốt sales 24/7.",
      price: 29000,
      unit: "bot",
      icon: "🛒",
      featured: true,
    },
    {
      name: "ChatBot Chăm Sóc Khách Hàng",
      slug: "chatbot-cham-soc-khach-hang",
      description: "Chatbot hỗ trợ CSKH tự động, trả lời FAQ, xử lý khiếu nại 24/7.",
      price: 29000,
      unit: "bot",
      icon: "🎧",
      featured: true,
    },
    {
      name: "ChatBot Đặt Lịch Hẹn",
      slug: "chatbot-dat-lich-hen",
      description: "Chatbot đặt lịch tự động cho spa, phòng khám, salon. Nhắc lịch, sync Calendar.",
      price: 29000,
      unit: "bot",
      icon: "📅",
      featured: true,
    },
    {
      name: "ChatBot Bất Động Sản",
      slug: "chatbot-bat-dong-san",
      description: "Tư vấn BĐS tự động. Lọc nhu cầu, giới thiệu dự án, đặt lịch xem nhà.",
      price: 29000,
      unit: "bot",
      icon: "🏠",
      featured: false,
    },
    {
      name: "ChatBot Giáo Dục",
      slug: "chatbot-giao-duc",
      description: "Chatbot tư vấn khóa học, nhắc lịch học, theo dõi tiến độ học viên.",
      price: 29000,
      unit: "bot",
      icon: "📚",
      featured: false,
    },
    {
      name: "ChatBot Nhà Hàng",
      slug: "chatbot-nha-hang",
      description: "Nhận order, đặt bàn, gửi menu, khuyến mãi tự động cho nhà hàng/quán café.",
      price: 29000,
      unit: "bot",
      icon: "🍽️",
      featured: true,
    },
    {
      name: "ChatBot Du Lịch Tour",
      slug: "chatbot-du-lich",
      description: "Chatbot tư vấn tour, đặt vé, khách sạn. Hỗ trợ đa ngôn ngữ.",
      price: 29000,
      unit: "bot",
      icon: "✈️",
      featured: false,
    },
    {
      name: "ChatBot Y Tế",
      slug: "chatbot-y-te",
      description: "Đặt lịch khám, tư vấn sức khỏe, nhắc uống thuốc, theo dõi bệnh nhân.",
      price: 29000,
      unit: "bot",
      icon: "🏥",
      featured: false,
    },
    {
      name: "ChatBot Tuyển Dụng HR",
      slug: "chatbot-tuyen-dung",
      description: "Chatbot sàng lọc CV, phỏng vấn sơ bộ, đặt lịch interview.",
      price: 29000,
      unit: "bot",
      icon: "👔",
      featured: true,
    },
    {
      name: "ChatBot Tài Chính",
      slug: "chatbot-tai-chinh",
      description: "Tư vấn tài chính, bảo hiểm, khoản vay. Tính toán lãi suất tự động.",
      price: 29000,
      unit: "bot",
      icon: "💰",
      featured: false,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  // Create settings
  const settings = [
    { key: "site_name", value: "ChatBotVN" },
    { key: "site_phone", value: "0363 189 699 – 0345 501 969" },
    { key: "site_email", value: "contact@chatbotvn.com" },
    { key: "site_address", value: "RUBY CT1-2-3 PHÚC LỢI – HÀ NỘI" },
    { key: "site_zalo_group", value: "https://zalo.me/g/ubarcp690" },
    { key: "working_hours", value: "24/7" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // --- DORMANT: MLM DATA SEEDING (GIỮ LẠI THEO YÊU CẦU) ---
  /*
  // Create Master Agent
  const masterAgent = await prisma.user.upsert({
    where: { email: "master@chatbotvn.com" },
    update: {},
    create: {
      email: "master@chatbotvn.com",
      password,
      name: "Tổng Đại Lý A",
      role: "master_agent",
      phone: "0988888888",
    },
  });

  // Create Agent under Master Agent
  const agent = await prisma.user.upsert({
    where: { email: "agent@chatbotvn.com" },
    update: {},
    create: {
      email: "agent@chatbotvn.com",
      password,
      name: "Đại Lý B",
      role: "agent",
      phone: "0977777777",
      parentId: masterAgent.id,
    },
  });

  // Create CTV under Agent
  await prisma.user.upsert({
    where: { email: "ctv@chatbotvn.com" },
    update: {},
    create: {
      email: "ctv@chatbotvn.com",
      password,
      name: "Cộng Tác Viên C",
      role: "ctv",
      phone: "0966666666",
      parentId: agent.id,
    },
  });
  */
  // ------------------------------------------------------

  console.log("✅ Database seeded successfully!");
  console.log("\n════════════════════════════════════════");
  console.log("📊 DỮ LIỆU ĐÃ TẠO:");
  console.log("════════════════════════════════════════");
  console.log("👑 1 Admin");
  console.log("👷 1 Nhân Viên");
  console.log("📦 10 Sản Phẩm ChatBot");
  console.log("\n════════════════════════════════════════");
  console.log("🔑 THÔNG TIN ĐĂNG NHẬP:");
  console.log("════════════════════════════════════════");
  console.log("\n🔴 ADMIN:");
  console.log("   Email: admin@chatbotvn.com");
  console.log("   Password: admin123");
  console.log("\n🔵 NHÂN VIÊN:");
  console.log("   Email: nhanvien1@chatbotvn.com");
  console.log("   Password: staff123");
  console.log("\n════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
