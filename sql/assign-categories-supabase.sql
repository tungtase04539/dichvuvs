-- Script phân loại các bot vào các lĩnh vực
-- Chạy script này trong Supabase SQL Editor
-- Đảm bảo đã chạy sql/add-category.sql trước để tạo các Category

-- 1. Giáo dục
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'giao-duc')
WHERE slug = 'chatbot-giao-duc';

-- 2. Kinh doanh
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'kinh-doanh')
WHERE slug IN (
  'chatbot-ban-hang',
  'chatbot-cham-soc-khach-hang',
  'chatbot-tuyen-dung'
);

-- 3. Y tế - Sức khỏe
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'y-te-suc-khoe')
WHERE slug IN (
  'chatbot-y-te',
  'chatbot-dat-lich-hen'
);

-- 4. Du lịch - Nhà hàng
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'du-lich-nha-hang')
WHERE slug IN (
  'chatbot-nha-hang',
  'chatbot-du-lich'
);

-- 5. Bất động sản
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'bat-dong-san')
WHERE slug = 'chatbot-bat-dong-san';

-- 6. Tài chính - Bảo hiểm
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'tai-chinh-bao-hiem')
WHERE slug = 'chatbot-tai-chinh';

-- Kiểm tra kết quả
SELECT 
  s.name as "Tên Bot",
  s.slug as "Slug",
  c.name as "Lĩnh vực",
  c.slug as "Category Slug"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
ORDER BY c."order" NULLS LAST, s.name;

-- Kiểm tra bot chưa được phân loại
SELECT 
  name as "Bot chưa phân loại",
  slug
FROM "Service"
WHERE "categoryId" IS NULL;

