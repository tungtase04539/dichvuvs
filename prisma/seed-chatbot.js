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
      description: "Chatbot AI tự động tư vấn sản phẩm, xử lý đơn hàng, chốt sales 24/7. Tích hợp Facebook, Zalo, Website.",
      longDescription: `🛒 CHATBOT BÁN HÀNG PRO - TRỢ LÝ BÁN HÀNG AI 24/7

Chatbot thông minh giúp bạn tự động hóa quy trình bán hàng, từ tư vấn sản phẩm đến chốt đơn.

🚀 TÍNH NĂNG NỔI BẬT:
• Tự động trả lời tin nhắn khách hàng 24/7
• Tư vấn sản phẩm dựa trên nhu cầu khách
• Gửi báo giá, hình ảnh sản phẩm tự động
• Nhắc khách hàng chưa hoàn tất đơn hàng
• Gửi thông báo khuyến mãi hàng loạt
• Thống kê doanh số, tỷ lệ chuyển đổi

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 300% tỷ lệ phản hồi khách hàng
• Giảm 80% thời gian tư vấn
• Tăng 50% doanh số bán hàng

💼 PHÙ HỢP VỚI:
• Shop online Facebook, Zalo
• Website bán hàng
• Cửa hàng thời trang, mỹ phẩm
• Kinh doanh dropshipping`,
      price: 30000,
      unit: "bot",
      icon: "🛒",
      featured: true,
    },
    {
      name: "ChatBot Chăm Sóc Khách Hàng",
      slug: "chatbot-cham-soc-khach-hang", 
      description: "Chatbot hỗ trợ khách hàng tự động, trả lời FAQ, xử lý khiếu nại, theo dõi đơn hàng 24/7.",
      longDescription: `🎧 CHATBOT CHĂM SÓC KHÁCH HÀNG - SUPPORT 24/7

Giải pháp CSKH tự động, giúp khách hàng luôn được hỗ trợ mọi lúc mọi nơi.

🚀 TÍNH NĂNG NỔI BẬT:
• Trả lời câu hỏi thường gặp (FAQ) tự động
• Hướng dẫn sử dụng sản phẩm/dịch vụ
• Xử lý yêu cầu đổi trả, bảo hành
• Tra cứu trạng thái đơn hàng
• Chuyển tiếp sang nhân viên khi cần
• Khảo sát mức độ hài lòng

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Giảm 70% cuộc gọi đến tổng đài
• Tăng 90% tỷ lệ hài lòng khách hàng
• Tiết kiệm 60% chi phí nhân sự

💼 PHÙ HỢP VỚI:
• Doanh nghiệp có lượng khách hàng lớn
• Công ty cung cấp dịch vụ
• Sàn thương mại điện tử
• Startup cần tối ưu chi phí`,
      price: 30000,
      unit: "bot",
      icon: "🎧",
      featured: true,
    },
    {
      name: "ChatBot Đặt Lịch Hẹn",
      slug: "chatbot-dat-lich-hen",
      description: "Chatbot tự động đặt lịch hẹn cho spa, phòng khám, salon. Nhắc lịch tự động, sync Google Calendar.",
      longDescription: `📅 CHATBOT ĐẶT LỊCH HẸN - QUẢN LÝ LỊCH THÔNG MINH

Tự động hóa quy trình đặt lịch, giúp khách hàng book lịch dễ dàng và bạn không bỏ lỡ cuộc hẹn nào.

🚀 TÍNH NĂNG NỔI BẬT:
• Đặt lịch hẹn tự động qua chat
• Hiển thị khung giờ còn trống
• Xác nhận lịch qua tin nhắn/email
• Nhắc lịch trước 24h, 1h
• Hỗ trợ hủy/đổi lịch dễ dàng
• Đồng bộ Google Calendar

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 200% lượng đặt lịch
• Giảm 80% tỷ lệ quên lịch
• Tiết kiệm 5h/ngày nhận lịch điện thoại

💼 PHÙ HỢP VỚI:
• Spa, salon làm đẹp
• Phòng khám, nha khoa
• Gym, yoga studio
• Dịch vụ tư vấn, coaching`,
      price: 30000,
      unit: "bot",
      icon: "📅",
      featured: true,
    },
    {
      name: "ChatBot Bất Động Sản",
      slug: "chatbot-bat-dong-san",
      description: "Chatbot AI tư vấn mua bán nhà đất, lọc khách hàng tiềm năng, gửi thông tin dự án tự động.",
      longDescription: `🏠 CHATBOT BẤT ĐỘNG SẢN - TRỢ LÝ SALES BĐS

Chatbot chuyên biệt cho ngành BĐS, giúp lọc lead và tư vấn khách hàng tự động.

🚀 TÍNH NĂNG NỔI BẬT:
• Thu thập thông tin khách hàng tiềm năng
• Tư vấn dự án theo ngân sách, vị trí
• Gửi thông tin, hình ảnh dự án
• Đặt lịch tham quan nhà mẫu
• Phân loại khách hàng hot/warm/cold
• Báo cáo lead hàng ngày

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 150% lượng lead chất lượng
• Giảm 60% thời gian tư vấn ban đầu
• Tăng 40% tỷ lệ chốt deal

💼 PHÙ HỢP VỚI:
• Sàn giao dịch BĐS
• Chủ đầu tư dự án
• Môi giới BĐS cá nhân
• Agency marketing BĐS`,
      price: 30000,
      unit: "bot",
      icon: "🏠",
      featured: false,
    },
    {
      name: "ChatBot Giáo Dục",
      slug: "chatbot-giao-duc",
      description: "Chatbot hỗ trợ học tập, tư vấn khóa học, nhắc lịch học, theo dõi tiến độ học viên.",
      longDescription: `📚 CHATBOT GIÁO DỤC - TRỢ LÝ HỌC TẬP AI

Chatbot thông minh hỗ trợ trung tâm đào tạo và học viên trong suốt quá trình học.

🚀 TÍNH NĂNG NỔI BẬT:
• Tư vấn khóa học phù hợp
• Đăng ký lớp học tự động
• Nhắc lịch học, deadline bài tập
• Gửi tài liệu, bài giảng
• Trả lời câu hỏi về chương trình học
• Khảo sát đánh giá sau khóa học

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 120% lượng đăng ký khóa học
• Giảm 50% tỷ lệ bỏ học
• Tăng 80% sự hài lòng học viên

💼 PHÙ HỢP VỚI:
• Trung tâm ngoại ngữ
• Trung tâm đào tạo kỹ năng
• Khóa học online
• Trường đại học, cao đẳng`,
      price: 30000,
      unit: "bot",
      icon: "📚",
      featured: true,
    },
    {
      name: "ChatBot Nhà Hàng & F&B",
      slug: "chatbot-nha-hang-fnb",
      description: "Chatbot đặt bàn, order món, gợi ý menu, tích điểm khách hàng. Tích hợp POS system.",
      longDescription: `🍽️ CHATBOT NHÀ HÀNG F&B - ĐẶT BÀN & ORDER THÔNG MINH

Chatbot chuyên biệt cho ngành F&B, từ đặt bàn đến order và chăm sóc khách hàng.

🚀 TÍNH NĂNG NỔI BẬT:
• Đặt bàn online tự động
• Xem menu, gợi ý món ăn
• Order trước khi đến
• Tích điểm thành viên
• Gửi voucher sinh nhật, khuyến mãi
• Khảo sát sau bữa ăn

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 80% lượng đặt bàn online
• Tăng 30% giá trị đơn hàng trung bình
• Tăng 60% khách hàng quay lại

💼 PHÙ HỢP VỚI:
• Nhà hàng, quán ăn
• Quán cà phê, trà sữa
• Chuỗi F&B
• Dịch vụ catering`,
      price: 30000,
      unit: "bot",
      icon: "🍽️",
      featured: false,
    },
    {
      name: "ChatBot Du Lịch & Tour",
      slug: "chatbot-du-lich-tour",
      description: "Chatbot tư vấn tour, đặt vé máy bay, khách sạn. Hỗ trợ đa ngôn ngữ cho khách quốc tế.",
      longDescription: `✈️ CHATBOT DU LỊCH & TOUR - TƯ VẤN VIÊN DU LỊCH 24/7

Chatbot chuyên biệt cho ngành du lịch, hỗ trợ khách hàng lên kế hoạch và đặt tour.

🚀 TÍNH NĂNG NỔI BẬT:
• Tư vấn điểm đến, lịch trình
• Báo giá tour tự động
• Đặt tour, vé máy bay, khách sạn
• Hỗ trợ đa ngôn ngữ (Việt, Anh, Trung)
• Gửi thông tin visa, chuẩn bị hành lý
• Hỗ trợ trong suốt chuyến đi

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 100% lượng booking online
• Giảm 70% thời gian tư vấn
• Tăng 50% khách hàng quốc tế

💼 PHÙ HỢP VỚI:
• Công ty du lịch, lữ hành
• Đại lý vé máy bay
• Khách sạn, resort
• Dịch vụ thuê xe du lịch`,
      price: 30000,
      unit: "bot",
      icon: "✈️",
      featured: false,
    },
    {
      name: "ChatBot Y Tế & Sức Khỏe",
      slug: "chatbot-y-te-suc-khoe",
      description: "Chatbot tư vấn sức khỏe, đặt lịch khám, nhắc uống thuốc, theo dõi sức khỏe định kỳ.",
      longDescription: `🏥 CHATBOT Y TẾ & SỨC KHỎE - TRỢ LÝ SỨC KHỎE CÁ NHÂN

Chatbot hỗ trợ phòng khám và bệnh nhân trong việc chăm sóc sức khỏe.

🚀 TÍNH NĂNG NỔI BẬT:
• Đặt lịch khám bệnh online
• Tư vấn triệu chứng ban đầu
• Nhắc lịch tái khám
• Nhắc uống thuốc đúng giờ
• Gửi kết quả xét nghiệm
• Tư vấn dinh dưỡng, lifestyle

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 150% lượng đặt lịch online
• Giảm 60% cuộc gọi đến lễ tân
• Tăng 80% tuân thủ điều trị

💼 PHÙ HỢP VỚI:
• Phòng khám tư nhân
• Bệnh viện
• Nha khoa, mắt
• Trung tâm dinh dưỡng`,
      price: 30000,
      unit: "bot",
      icon: "🏥",
      featured: false,
    },
    {
      name: "ChatBot Tuyển Dụng HR",
      slug: "chatbot-tuyen-dung-hr",
      description: "Chatbot sàng lọc CV, phỏng vấn sơ bộ, đặt lịch interview. Tiết kiệm 70% thời gian HR.",
      longDescription: `👔 CHATBOT TUYỂN DỤNG HR - TRỢ LÝ TUYỂN DỤNG AI

Chatbot tự động hóa quy trình tuyển dụng, từ tiếp nhận CV đến sắp xếp phỏng vấn.

🚀 TÍNH NĂNG NỔI BẬT:
• Tiếp nhận CV tự động
• Sàng lọc ứng viên theo tiêu chí
• Phỏng vấn sơ bộ qua chat
• Đặt lịch phỏng vấn
• Gửi thông báo kết quả
• Onboarding nhân viên mới

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Giảm 70% thời gian sàng lọc CV
• Tăng 50% chất lượng ứng viên
• Giảm 40% chi phí tuyển dụng

💼 PHÙ HỢP VỚI:
• Phòng nhân sự doanh nghiệp
• Công ty headhunter
• Startup đang scale team
• Agency tuyển dụng`,
      price: 30000,
      unit: "bot",
      icon: "👔",
      featured: true,
    },
    {
      name: "ChatBot Tài Chính & Bảo Hiểm",
      slug: "chatbot-tai-chinh-bao-hiem",
      description: "Chatbot tư vấn khoản vay, bảo hiểm, đầu tư. Tính toán lãi suất, so sánh gói sản phẩm.",
      longDescription: `💰 CHATBOT TÀI CHÍNH & BẢO HIỂM - TƯ VẤN TÀI CHÍNH 24/7

Chatbot chuyên biệt cho ngành tài chính, hỗ trợ tư vấn và bán sản phẩm tài chính.

🚀 TÍNH NĂNG NỔI BẬT:
• Tư vấn khoản vay phù hợp
• So sánh gói bảo hiểm
• Tính toán lãi suất, phí bảo hiểm
• Thu thập thông tin khách hàng
• Đặt lịch gặp tư vấn viên
• Giải đáp thắc mắc về sản phẩm

📈 KẾT QUẢ ĐẠT ĐƯỢC:
• Tăng 100% lượng lead tiềm năng
• Giảm 60% thời gian tư vấn ban đầu
• Tăng 35% tỷ lệ chốt hợp đồng

💼 PHÙ HỢP VỚI:
• Ngân hàng
• Công ty bảo hiểm
• Công ty chứng khoán
• Tư vấn tài chính cá nhân`,
      price: 30000,
      unit: "bot",
      icon: "💰",
      featured: false,
    },
  ];

  for (const chatbot of chatbots) {
    await prisma.service.upsert({
      where: { slug: chatbot.slug },
      update: {
        name: chatbot.name,
        description: chatbot.description,
        longDescription: chatbot.longDescription,
        price: chatbot.price,
        icon: chatbot.icon,
        featured: chatbot.featured,
      },
      create: {
        name: chatbot.name,
        slug: chatbot.slug,
        description: chatbot.description,
        longDescription: chatbot.longDescription,
        price: chatbot.price,
        unit: chatbot.unit,
        icon: chatbot.icon,
        featured: chatbot.featured,
      },
    });
  }

  // Update settings
  const settings = [
    { key: "site_name", value: "ChatBot VN Store" },
    { key: "site_phone", value: "0363 189 699 – 0345 501 969" },
    { key: "site_email", value: "contact@chatbotvn.store" },
    { key: "site_address", value: "RUBY CT1-2-3 PHÚC LỢI – HÀ NỘI" },
    { key: "site_zalo_group", value: "https://zalo.me/g/ubarcp690" },
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
