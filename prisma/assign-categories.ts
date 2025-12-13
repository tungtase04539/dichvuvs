import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignCategories() {
  try {
    console.log("Đang phân loại các bot vào lĩnh vực...");

    // Lấy các category
    const categories = await prisma.category.findMany();
    const categoryMap: Record<string, string> = {};
    
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat.id;
    });

    // Phân loại các bot
    const assignments: Record<string, string> = {
      // Giáo dục
      "chatbot-giao-duc": categoryMap["giao-duc"] || "",

      // Kinh doanh
      "chatbot-ban-hang": categoryMap["kinh-doanh"] || "",
      "chatbot-cham-soc-khach-hang": categoryMap["kinh-doanh"] || "",
      "chatbot-tuyen-dung": categoryMap["kinh-doanh"] || "",

      // Y tế - Sức khỏe
      "chatbot-y-te": categoryMap["y-te-suc-khoe"] || "",
      "chatbot-dat-lich-hen": categoryMap["y-te-suc-khoe"] || "",

      // Du lịch - Nhà hàng
      "chatbot-nha-hang": categoryMap["du-lich-nha-hang"] || "",
      "chatbot-du-lich": categoryMap["du-lich-nha-hang"] || "",

      // Bất động sản
      "chatbot-bat-dong-san": categoryMap["bat-dong-san"] || "",

      // Tài chính - Bảo hiểm
      "chatbot-tai-chinh": categoryMap["tai-chinh-bao-hiem"] || "",
    };

    // Update từng service
    let updated = 0;
    for (const [slug, categoryId] of Object.entries(assignments)) {
      if (!categoryId) {
        console.warn(`⚠️  Không tìm thấy category cho slug: ${slug}`);
        continue;
      }

      const result = await prisma.service.updateMany({
        where: { slug },
        data: { categoryId },
      });

      if (result.count > 0) {
        updated += result.count;
        console.log(`✅ Đã phân loại: ${slug}`);
      } else {
        console.warn(`⚠️  Không tìm thấy service: ${slug}`);
      }
    }

    console.log(`\n✨ Hoàn thành! Đã cập nhật ${updated} bot.`);

    // Hiển thị kết quả
    const services = await prisma.service.findMany({
      include: { category: true },
      orderBy: [
        { category: { order: "asc" } },
        { name: "asc" },
      ],
    });

    console.log("\n📊 Kết quả phân loại:");
    console.log("=" .repeat(60));
    
    let currentCategory = "";
    services.forEach((service) => {
      const categoryName = service.category?.name || "Chưa phân loại";
      if (categoryName !== currentCategory) {
        currentCategory = categoryName;
        console.log(`\n📁 ${categoryName}:`);
      }
      console.log(`  • ${service.name} (${service.slug})`);
    });

    // Kiểm tra bot chưa được phân loại
    const unassigned = services.filter((s) => !s.categoryId);
    if (unassigned.length > 0) {
      console.log("\n⚠️  Các bot chưa được phân loại:");
      unassigned.forEach((s) => {
        console.log(`  • ${s.name} (${s.slug})`);
      });
    }
  } catch (error) {
    console.error("❌ Lỗi:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignCategories();

