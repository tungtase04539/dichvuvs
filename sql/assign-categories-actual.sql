-- Script phân loại các bot vào các lĩnh vực (Dựa trên slug thực tế trong database)
-- Chạy script này trong Supabase SQL Editor

-- Bước 1: Kiểm tra các Category có tồn tại
SELECT 'Checking Categories...' as step;
SELECT id, name, slug FROM "Category" ORDER BY "order";

-- Bước 2: Kiểm tra các Service hiện có
SELECT 'Checking Services...' as step;
SELECT id, name, slug, "categoryId" FROM "Service" ORDER BY name;

-- Bước 3: Phân loại các bot (dựa trên slug thực tế trong database)

-- 3.1. Giáo dục
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'giao-duc' LIMIT 1)
WHERE slug = 'chatbot-giao-duc';

-- 3.2. Kinh doanh
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'kinh-doanh' LIMIT 1)
WHERE slug IN (
  'chatbot-ban-hang-pro',  -- ChatBot Bán Hàng Pro
  'chatbot-cskh',          -- ChatBot Chăm Sóc Khách Hàng
  'chatbot-hr'             -- ChatBot Tuyển Dụng HR
);

-- 3.3. Y tế - Sức khỏe
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'y-te-suc-khoe' LIMIT 1)
WHERE slug IN (
  'chatbot-y-te',          -- ChatBot Y Tế Sức Khỏe (đã có categoryId)
  'chatbot-dat-lich'       -- ChatBot Đặt Lịch Hẹn
);

-- 3.4. Du lịch - Nhà hàng
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'du-lich-nha-hang' LIMIT 1)
WHERE slug IN (
  'chatbot-du-lich',       -- ChatBot Du Lịch Tour (đã có categoryId)
  'chatbot-fnb'            -- ChatBot Nhà Hàng F&B
);

-- 3.5. Bất động sản
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'bat-dong-san' LIMIT 1)
WHERE slug = 'chatbot-bds';  -- ChatBot Bất Động Sản

-- 3.6. Tài chính - Bảo hiểm
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'tai-chinh-bao-hiem' LIMIT 1)
WHERE slug = 'chatbot-tai-chinh';  -- ChatBot Tài Chính Bảo Hiểm (đã có categoryId)

-- 3.7. Khác (cho các bot test)
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'khac' LIMIT 1)
WHERE slug IN (
  'test',
  'test-test',
  'test-test-test'
);

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
WHERE s."active" = true OR s."active" IS NULL
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

