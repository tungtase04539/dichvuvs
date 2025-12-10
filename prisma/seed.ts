import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  // Create master agent (Tổng đại lý)
  const masterAgentPassword = await bcrypt.hash("master123", 10);
  const masterAgent = await prisma.user.upsert({
    where: { email: "tongdaily@chatbotvn.com" },
    update: {},
    create: {
      email: "tongdaily@chatbotvn.com",
      password: masterAgentPassword,
      name: "Nguyễn Văn Tổng",
      role: "master_agent",
      phone: "0909111222",
    },
  });

  // Create agents (Đại lý) - thuộc Tổng đại lý
  const agentPassword = await bcrypt.hash("agent123", 10);
  
  const agent1 = await prisma.user.upsert({
    where: { email: "daily1@chatbotvn.com" },
    update: {},
    create: {
      email: "daily1@chatbotvn.com",
      password: agentPassword,
      name: "Trần Văn Đại Lý",
      role: "agent",
      phone: "0909222333",
      parentId: masterAgent.id,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "daily2@chatbotvn.com" },
    update: {},
    create: {
      email: "daily2@chatbotvn.com",
      password: agentPassword,
      name: "Lê Thị Đại Lý",
      role: "agent",
      phone: "0909333444",
      parentId: masterAgent.id,
    },
  });

  // Agent độc lập (không thuộc tổng đại lý)
  const agent3 = await prisma.user.upsert({
    where: { email: "daily3@chatbotvn.com" },
    update: {},
    create: {
      email: "daily3@chatbotvn.com",
      password: agentPassword,
      name: "Phạm Văn Độc Lập",
      role: "agent",
      phone: "0909444555",
    },
  });

  // Create collaborators (Cộng tác viên) - thuộc Đại lý
  const collabPassword = await bcrypt.hash("collab123", 10);
  
  const collab1 = await prisma.user.upsert({
    where: { email: "ctv1@chatbotvn.com" },
    update: {},
    create: {
      email: "ctv1@chatbotvn.com",
      password: collabPassword,
      name: "Hoàng Văn CTV",
      role: "collaborator",
      phone: "0909555666",
      parentId: agent1.id, // Thuộc Đại lý 1
    },
  });

  const collab2 = await prisma.user.upsert({
    where: { email: "ctv2@chatbotvn.com" },
    update: {},
    create: {
      email: "ctv2@chatbotvn.com",
      password: collabPassword,
      name: "Mai Thị CTV",
      role: "collaborator",
      phone: "0909666777",
      parentId: agent1.id, // Thuộc Đại lý 1
    },
  });

  const collab3 = await prisma.user.upsert({
    where: { email: "ctv3@chatbotvn.com" },
    update: {},
    create: {
      email: "ctv3@chatbotvn.com",
      password: collabPassword,
      name: "Đỗ Văn CTV",
      role: "collaborator",
      phone: "0909777888",
      parentId: agent2.id, // Thuộc Đại lý 2
    },
  });

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

  // Create referral links for all levels
  const referralCodes = [
    { userId: masterAgent.id, code: "REF-MASTER" },
    { userId: agent1.id, code: "REF-DL001" },
    { userId: agent2.id, code: "REF-DL002" },
    { userId: agent3.id, code: "REF-DL003" },
    { userId: collab1.id, code: "REF-CTV01" },
    { userId: collab2.id, code: "REF-CTV02" },
    { userId: collab3.id, code: "REF-CTV03" },
  ];

  for (const ref of referralCodes) {
    await prisma.referralLink.upsert({
      where: { code: ref.code },
      update: {},
      create: {
        code: ref.code,
        userId: ref.userId,
        clickCount: Math.floor(Math.random() * 100),
        orderCount: Math.floor(Math.random() * 20),
        revenue: Math.floor(Math.random() * 1000000),
      },
    });
  }

  // Create services
  const services = [
    {
      name: "ChatBot Bán Hàng",
      slug: "chatbot-ban-hang",
      description: "ChatBot tự động trả lời khách hàng, tư vấn sản phẩm 24/7. Tăng tỷ lệ chuyển đổi lên 300%.",
      price: 30000,
      unit: "bot",
      icon: "🛒",
      featured: true,
    },
    {
      name: "ChatBot Chăm Sóc Khách Hàng",
      slug: "chatbot-cham-soc-khach-hang",
      description: "Tự động trả lời FAQ, hỗ trợ khách hàng giải quyết vấn đề nhanh chóng.",
      price: 30000,
      unit: "bot",
      icon: "🎧",
      featured: true,
    },
    {
      name: "ChatBot Đặt Lịch Hẹn",
      slug: "chatbot-dat-lich-hen",
      description: "Tự động đặt lịch hẹn, nhắc lịch cho khách hàng. Phù hợp spa, phòng khám, salon.",
      price: 30000,
      unit: "bot",
      icon: "📅",
      featured: true,
    },
    {
      name: "ChatBot Bất Động Sản",
      slug: "chatbot-bat-dong-san",
      description: "Tư vấn bất động sản tự động. Lọc nhu cầu, giới thiệu dự án phù hợp.",
      price: 30000,
      unit: "bot",
      icon: "🏠",
      featured: false,
    },
    {
      name: "ChatBot Giáo Dục",
      slug: "chatbot-giao-duc",
      description: "ChatBot tư vấn khóa học, giải đáp thắc mắc học viên 24/7.",
      price: 30000,
      unit: "bot",
      icon: "📚",
      featured: false,
    },
    {
      name: "ChatBot Nhà Hàng",
      slug: "chatbot-nha-hang",
      description: "Nhận order, đặt bàn tự động. Gửi menu, khuyến mãi cho khách.",
      price: 30000,
      unit: "bot",
      icon: "🍽️",
      featured: true,
    },
    {
      name: "ChatBot Du Lịch",
      slug: "chatbot-du-lich",
      description: "Tư vấn tour, đặt vé, booking khách sạn tự động.",
      price: 30000,
      unit: "bot",
      icon: "✈️",
      featured: false,
    },
    {
      name: "ChatBot Y Tế",
      slug: "chatbot-y-te",
      description: "Đặt lịch khám, tư vấn sức khỏe cơ bản, nhắc uống thuốc.",
      price: 30000,
      unit: "bot",
      icon: "🏥",
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
  console.log("\n📧 THÔNG TIN ĐĂNG NHẬP:");
  console.log("════════════════════════════════════════");
  console.log("\n🔑 ADMIN:");
  console.log("   Email: admin@chatbotvn.com");
  console.log("   Password: admin123");
  console.log("\n🏢 TỔNG ĐẠI LÝ:");
  console.log("   Email: tongdaily@chatbotvn.com");
  console.log("   Password: master123");
  console.log("   Mã giới thiệu: REF-MASTER");
  console.log("\n👔 ĐẠI LÝ 1 (thuộc Tổng đại lý):");
  console.log("   Email: daily1@chatbotvn.com");
  console.log("   Password: agent123");
  console.log("   Mã giới thiệu: REF-DL001");
  console.log("\n👔 ĐẠI LÝ 2 (thuộc Tổng đại lý):");
  console.log("   Email: daily2@chatbotvn.com");
  console.log("   Password: agent123");
  console.log("   Mã giới thiệu: REF-DL002");
  console.log("\n👔 ĐẠI LÝ 3 (độc lập):");
  console.log("   Email: daily3@chatbotvn.com");
  console.log("   Password: agent123");
  console.log("   Mã giới thiệu: REF-DL003");
  console.log("\n👤 CTV 1 (thuộc Đại lý 1):");
  console.log("   Email: ctv1@chatbotvn.com");
  console.log("   Password: collab123");
  console.log("   Mã giới thiệu: REF-CTV01");
  console.log("\n👤 CTV 2 (thuộc Đại lý 1):");
  console.log("   Email: ctv2@chatbotvn.com");
  console.log("   Password: collab123");
  console.log("   Mã giới thiệu: REF-CTV02");
  console.log("\n👤 CTV 3 (thuộc Đại lý 2):");
  console.log("   Email: ctv3@chatbotvn.com");
  console.log("   Password: collab123");
  console.log("   Mã giới thiệu: REF-CTV03");
  console.log("\n👷 NHÂN VIÊN:");
  console.log("   Email: nhanvien1@chatbotvn.com");
  console.log("   Password: staff123");
  console.log("\n════════════════════════════════════════");
  console.log("📊 PHÂN CẤP: Admin > Tổng đại lý > Đại lý > Cộng tác viên");
  console.log("🔗 Khách hàng KHÔNG CẦN đăng nhập để mua hàng");
  console.log("   Chỉ cần truy cập link có mã ref: /?ref=REF-XXXXX");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
