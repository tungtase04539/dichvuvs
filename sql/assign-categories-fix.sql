-- Script phân loại các bot vào các lĩnh vực (FIXED VERSION)
-- Chạy script này trong Supabase SQL Editor
-- Đảm bảo đã chạy sql/add-category.sql trước để tạo các Category

-- Bước 1: Kiểm tra các Category có tồn tại
SELECT 'Checking Categories...' as step;
SELECT id, name, slug FROM "Category" ORDER BY "order";

-- Bước 2: Kiểm tra các Service hiện có
SELECT 'Checking Services...' as step;
SELECT id, name, slug, "categoryId" FROM "Service" ORDER BY name;

-- Bước 3: Phân loại các bot

-- 3.1. Giáo dục
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'giao-duc' LIMIT 1)
WHERE slug = 'chatbot-giao-duc';

-- 3.2. Kinh doanh
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'kinh-doanh' LIMIT 1)
WHERE slug IN (
  'chatbot-ban-hang',
  'chatbot-cham-soc-khach-hang',
  'chatbot-tuyen-dung'
);

-- 3.3. Y tế - Sức khỏe
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'y-te-suc-khoe' LIMIT 1)
WHERE slug IN (
  'chatbot-y-te',
  'chatbot-dat-lich-hen'
);

-- 3.4. Du lịch - Nhà hàng
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'du-lich-nha-hang' LIMIT 1)
WHERE slug IN (
  'chatbot-nha-hang',
  'chatbot-du-lich'
);

-- 3.5. Bất động sản
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'bat-dong-san' LIMIT 1)
WHERE slug = 'chatbot-bat-dong-san';

-- 3.6. Tài chính - Bảo hiểm
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'tai-chinh-bao-hiem' LIMIT 1)
WHERE slug = 'chatbot-tai-chinh';

-- Bước 4: Kiểm tra kết quả phân loại
SELECT 'Results after assignment:' as step;
SELECT 
  s.name as "Tên Bot",
  s.slug as "Slug Bot",
  c.name as "Lĩnh vực",
  c.slug as "Category Slug"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
ORDER BY c."order" NULLS LAST, s.name;

-- Bước 5: Đếm số bot theo từng lĩnh vực
SELECT 'Count by category:' as step;
SELECT 
  COALESCE(c.name, 'Chưa phân loại') as "Lĩnh vực",
  COUNT(s.id) as "Số bot"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
GROUP BY c.id, c.name, c."order"
ORDER BY c."order" NULLS LAST;

-- Bước 6: Danh sách bot chưa được phân loại
SELECT 'Unassigned bots:' as step;
SELECT 
  id,
  name as "Bot chưa phân loại",
  slug
FROM "Service"
WHERE "categoryId" IS NULL;

