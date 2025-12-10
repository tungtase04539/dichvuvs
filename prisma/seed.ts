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

  // =====================================
  // TẠO 5 TỔNG ĐẠI LÝ (Master Agents)
  // =====================================
  const masterAgents = [];
  for (let i = 1; i <= 5; i++) {
    const masterAgent = await prisma.user.upsert({
      where: { email: `tongdaily${i}@chatbotvn.com` },
      update: {},
      create: {
        email: `tongdaily${i}@chatbotvn.com`,
        password: password,
        name: randomName(),
        role: "master_agent",
        phone: randomPhone(),
      },
    });
    masterAgents.push(masterAgent);

    // Tạo referral link cho Tổng đại lý
    await prisma.referralLink.upsert({
      where: { code: randomCode("TDL", i) },
      update: {},
      create: {
        code: randomCode("TDL", i),
        userId: masterAgent.id,
        clickCount: Math.floor(Math.random() * 500) + 100,
        orderCount: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000000) + 500000,
      },
    });
  }

  // =====================================
  // TẠO 15 ĐẠI LÝ (Agents) - Mỗi Tổng đại lý có 3 Đại lý
  // =====================================
  const agents = [];
  let agentIndex = 1;
  for (const masterAgent of masterAgents) {
    for (let j = 1; j <= 3; j++) {
      const agent = await prisma.user.upsert({
        where: { email: `daily${agentIndex}@chatbotvn.com` },
        update: {},
        create: {
          email: `daily${agentIndex}@chatbotvn.com`,
          password: password,
          name: randomName(),
          role: "agent",
          phone: randomPhone(),
          parentId: masterAgent.id,
        },
      });
      agents.push(agent);

      // Tạo referral link cho Đại lý
      await prisma.referralLink.upsert({
        where: { code: randomCode("DL", agentIndex) },
        update: {},
        create: {
          code: randomCode("DL", agentIndex),
          userId: agent.id,
          clickCount: Math.floor(Math.random() * 200) + 50,
          orderCount: Math.floor(Math.random() * 30) + 5,
          revenue: Math.floor(Math.random() * 2000000) + 200000,
        },
      });

      agentIndex++;
    }
  }

  // =====================================
  // TẠO 30 CỘNG TÁC VIÊN (Collaborators) - Mỗi Đại lý có 2 CTV
  // =====================================
  let ctvIndex = 1;
  for (const agent of agents) {
    for (let k = 1; k <= 2; k++) {
      const collab = await prisma.user.upsert({
        where: { email: `ctv${ctvIndex}@chatbotvn.com` },
        update: {},
        create: {
          email: `ctv${ctvIndex}@chatbotvn.com`,
          password: password,
          name: randomName(),
          role: "collaborator",
          phone: randomPhone(),
          parentId: agent.id,
        },
      });

      // Tạo referral link cho CTV
      await prisma.referralLink.upsert({
        where: { code: randomCode("CTV", ctvIndex) },
        update: {},
        create: {
          code: randomCode("CTV", ctvIndex),
          userId: collab.id,
          clickCount: Math.floor(Math.random() * 100) + 10,
          orderCount: Math.floor(Math.random() * 15) + 1,
          revenue: Math.floor(Math.random() * 500000) + 50000,
        },
      });

      ctvIndex++;
    }
  }

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
      price: 30000,
      unit: "bot",
      icon: "🛒",
      featured: true,
    },
    {
      name: "ChatBot Chăm Sóc Khách Hàng",
      slug: "chatbot-cham-soc-khach-hang",
      description: "Chatbot hỗ trợ CSKH tự động, trả lời FAQ, xử lý khiếu nại 24/7.",
      price: 30000,
      unit: "bot",
      icon: "🎧",
      featured: true,
    },
    {
      name: "ChatBot Đặt Lịch Hẹn",
      slug: "chatbot-dat-lich-hen",
      description: "Chatbot đặt lịch tự động cho spa, phòng khám, salon. Nhắc lịch, sync Calendar.",
      price: 30000,
      unit: "bot",
      icon: "📅",
      featured: true,
    },
    {
      name: "ChatBot Bất Động Sản",
      slug: "chatbot-bat-dong-san",
      description: "Tư vấn BĐS tự động. Lọc nhu cầu, giới thiệu dự án, đặt lịch xem nhà.",
      price: 30000,
      unit: "bot",
      icon: "🏠",
      featured: false,
    },
    {
      name: "ChatBot Giáo Dục",
      slug: "chatbot-giao-duc",
      description: "Chatbot tư vấn khóa học, nhắc lịch học, theo dõi tiến độ học viên.",
      price: 30000,
      unit: "bot",
      icon: "📚",
      featured: false,
    },
    {
      name: "ChatBot Nhà Hàng",
      slug: "chatbot-nha-hang",
      description: "Nhận order, đặt bàn, gửi menu, khuyến mãi tự động cho nhà hàng/quán café.",
      price: 30000,
      unit: "bot",
      icon: "🍽️",
      featured: true,
    },
    {
      name: "ChatBot Du Lịch Tour",
      slug: "chatbot-du-lich",
      description: "Chatbot tư vấn tour, đặt vé, khách sạn. Hỗ trợ đa ngôn ngữ.",
      price: 30000,
      unit: "bot",
      icon: "✈️",
      featured: false,
    },
    {
      name: "ChatBot Y Tế",
      slug: "chatbot-y-te",
      description: "Đặt lịch khám, tư vấn sức khỏe, nhắc uống thuốc, theo dõi bệnh nhân.",
      price: 30000,
      unit: "bot",
      icon: "🏥",
      featured: false,
    },
    {
      name: "ChatBot Tuyển Dụng HR",
      slug: "chatbot-tuyen-dung",
      description: "Chatbot sàng lọc CV, phỏng vấn sơ bộ, đặt lịch interview.",
      price: 30000,
      unit: "bot",
      icon: "👔",
      featured: true,
    },
    {
      name: "ChatBot Tài Chính",
      slug: "chatbot-tai-chinh",
      description: "Tư vấn tài chính, bảo hiểm, khoản vay. Tính toán lãi suất tự động.",
      price: 30000,
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
    { key: "site_phone", value: "1900 8686" },
    { key: "site_email", value: "contact@chatbotvn.com" },
    { key: "site_address", value: "123 Nguyễn Văn Linh, Quận 7, TP.HCM" },
    { key: "working_hours", value: "24/7" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n════════════════════════════════════════");
  console.log("📊 DỮ LIỆU ĐÃ TẠO:");
  console.log("════════════════════════════════════════");
  console.log("👑 1 Admin");
  console.log("🏢 5 Tổng Đại Lý (mỗi TĐL có 3 Đại lý)");
  console.log("👔 15 Đại Lý (mỗi ĐL có 2 CTV)");
  console.log("👤 30 Cộng Tác Viên");
  console.log("👷 1 Nhân Viên");
  console.log("📦 10 Sản Phẩm ChatBot");
  console.log("\n════════════════════════════════════════");
  console.log("🔑 THÔNG TIN ĐĂNG NHẬP:");
  console.log("════════════════════════════════════════");
  console.log("\n🔴 ADMIN:");
  console.log("   Email: admin@chatbotvn.com");
  console.log("   Password: admin123");
  console.log("\n🟠 TỔNG ĐẠI LÝ (5 tài khoản):");
  console.log("   Email: tongdaily1@chatbotvn.com → tongdaily5@chatbotvn.com");
  console.log("   Password: 123456");
  console.log("   Mã giới thiệu: TDL001 → TDL005");
  console.log("\n🟡 ĐẠI LÝ (15 tài khoản):");
  console.log("   Email: daily1@chatbotvn.com → daily15@chatbotvn.com");
  console.log("   Password: 123456");
  console.log("   Mã giới thiệu: DL001 → DL015");
  console.log("\n🟢 CỘNG TÁC VIÊN (30 tài khoản):");
  console.log("   Email: ctv1@chatbotvn.com → ctv30@chatbotvn.com");
  console.log("   Password: 123456");
  console.log("   Mã giới thiệu: CTV001 → CTV030");
  console.log("\n🔵 NHÂN VIÊN:");
  console.log("   Email: nhanvien1@chatbotvn.com");
  console.log("   Password: staff123");
  console.log("\n════════════════════════════════════════");
  console.log("📊 PHÂN CẤP: Admin > Tổng đại lý > Đại lý > CTV");
  console.log("════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
