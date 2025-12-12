-- Tạo bảng Category
CREATE TABLE IF NOT EXISTS "Category" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT,
  "icon" VARCHAR(50),
  "image" TEXT,
  "color" VARCHAR(20),
  "order" INTEGER DEFAULT 0,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Thêm cột categoryId vào bảng Service
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "categoryId" UUID REFERENCES "Category"("id");

-- Seed dữ liệu mẫu cho Category
INSERT INTO "Category" ("id", "name", "slug", "description", "icon", "color", "order", "active") VALUES
  (gen_random_uuid(), 'Giáo dục', 'giao-duc', 'Chatbot hỗ trợ giáo dục, đào tạo, học trực tuyến', '📚', '#3B82F6', 1, true),
  (gen_random_uuid(), 'Kinh doanh', 'kinh-doanh', 'Chatbot bán hàng, chăm sóc khách hàng, marketing', '💼', '#10B981', 2, true),
  (gen_random_uuid(), 'Y tế - Sức khỏe', 'y-te-suc-khoe', 'Chatbot tư vấn sức khỏe, đặt lịch khám', '🏥', '#EF4444', 3, true),
  (gen_random_uuid(), 'Du lịch - Nhà hàng', 'du-lich-nha-hang', 'Chatbot đặt tour, đặt bàn, F&B', '✈️', '#F59E0B', 4, true),
  (gen_random_uuid(), 'Bất động sản', 'bat-dong-san', 'Chatbot tư vấn mua bán, cho thuê BĐS', '🏠', '#8B5CF6', 5, true),
  (gen_random_uuid(), 'Tài chính - Bảo hiểm', 'tai-chinh-bao-hiem', 'Chatbot tư vấn tài chính, bảo hiểm', '💰', '#06B6D4', 6, true),
  (gen_random_uuid(), 'Tôn giáo - Tâm linh', 'ton-giao-tam-linh', 'Chatbot hỗ trợ tâm linh, thiền định', '🙏', '#EC4899', 7, true),
  (gen_random_uuid(), 'Khác', 'khac', 'Các lĩnh vực khác', '🤖', '#6B7280', 99, true)
ON CONFLICT (slug) DO NOTHING;

