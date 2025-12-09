import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@vesinhhcm.vn" },
    update: {},
    create: {
      email: "admin@vesinhhcm.vn",
      password: adminPassword,
      name: "Admin",
      role: "admin",
      phone: "0901234567",
    },
  });

  // Create staff users
  const staffPassword = await bcrypt.hash("staff123", 10);
  const staff1 = await prisma.user.upsert({
    where: { email: "nhanvien1@vesinhhcm.vn" },
    update: {},
    create: {
      email: "nhanvien1@vesinhhcm.vn",
      password: staffPassword,
      name: "Nguyễn Văn An",
      role: "staff",
      phone: "0912345678",
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "nhanvien2@vesinhhcm.vn" },
    update: {},
    create: {
      email: "nhanvien2@vesinhhcm.vn",
      password: staffPassword,
      name: "Trần Thị Bình",
      role: "staff",
      phone: "0923456789",
    },
  });

  // Create services
  const services = [
    {
      name: "Vệ sinh nhà ở",
      slug: "ve-sinh-nha-o",
      description: "Dịch vụ vệ sinh toàn bộ nhà ở, căn hộ. Bao gồm lau chùi sàn nhà, cửa kính, vệ sinh phòng tắm, nhà bếp.",
      price: 50000,
      unit: "m2",
      icon: "🏠",
      featured: true,
    },
    {
      name: "Vệ sinh văn phòng",
      slug: "ve-sinh-van-phong",
      description: "Dịch vụ vệ sinh văn phòng, công ty chuyên nghiệp. Đảm bảo môi trường làm việc sạch sẽ, thoáng mát.",
      price: 45000,
      unit: "m2",
      icon: "🏢",
      featured: true,
    },
    {
      name: "Giặt ghế sofa",
      slug: "giat-ghe-sofa",
      description: "Giặt ghế sofa da, nỉ tại nhà. Loại bỏ vết bẩn, mùi hôi, vi khuẩn. Bảo vệ ghế sofa bền đẹp.",
      price: 150000,
      unit: "ghế",
      icon: "🛋️",
      featured: true,
    },
    {
      name: "Giặt nệm",
      slug: "giat-nem",
      description: "Giặt nệm, đệm tại nhà. Loại bỏ bụi bẩn, ve, vi khuẩn. Giúp giấc ngủ ngon hơn.",
      price: 200000,
      unit: "nệm",
      icon: "🛏️",
      featured: false,
    },
    {
      name: "Vệ sinh điều hòa",
      slug: "ve-sinh-dieu-hoa",
      description: "Vệ sinh máy điều hòa, máy lạnh. Tăng hiệu suất làm mát, tiết kiệm điện, kéo dài tuổi thọ thiết bị.",
      price: 120000,
      unit: "máy",
      icon: "❄️",
      featured: true,
    },
    {
      name: "Vệ sinh kính",
      slug: "ve-sinh-kinh",
      description: "Vệ sinh cửa kính, vách kính, mặt tiền tòa nhà. Chuyên nghiệp, an toàn, sạch bóng.",
      price: 35000,
      unit: "m2",
      icon: "🪟",
      featured: false,
    },
    {
      name: "Vệ sinh sau xây dựng",
      slug: "ve-sinh-sau-xay-dung",
      description: "Dọn dẹp, vệ sinh nhà sau khi xây dựng, sửa chữa. Loại bỏ bụi bẩn, xi măng, sơn.",
      price: 70000,
      unit: "m2",
      icon: "🏗️",
      featured: true,
    },
    {
      name: "Đánh bóng sàn",
      slug: "danh-bong-san",
      description: "Đánh bóng sàn gạch, sàn đá granite, sàn gỗ. Phục hồi độ sáng bóng như mới.",
      price: 80000,
      unit: "m2",
      icon: "✨",
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
    { key: "site_name", value: "VệSinhHCM" },
    { key: "site_phone", value: "1900 1234" },
    { key: "site_email", value: "contact@vesinhhcm.vn" },
    { key: "site_address", value: "123 Nguyễn Văn Linh, Quận 7, TP.HCM" },
    { key: "working_hours", value: "7:00 - 21:00" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Admin login:");
  console.log("   Email: admin@vesinhhcm.vn");
  console.log("   Password: admin123");
  console.log("\n📧 Staff login:");
  console.log("   Email: nhanvien1@vesinhhcm.vn");
  console.log("   Password: staff123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

