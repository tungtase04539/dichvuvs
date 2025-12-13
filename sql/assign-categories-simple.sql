-- Script phân loại bot - VERSION ĐƠN GIẢN
-- Copy và chạy từng phần một trong Supabase SQL Editor

-- 1. KINH DOANH (3 bot)
UPDATE "Service" 
SET "categoryId" = 'd2576bdf-4a00-43ad-b434-bfbb646fa732'
WHERE slug IN ('chatbot-ban-hang-pro', 'chatbot-cskh', 'chatbot-hr');

-- 2. Y TẾ - SỨC KHỎE (1 bot)
UPDATE "Service" 
SET "categoryId" = 'a99efbb3-1c1f-441d-b64f-22f7f4e30fe8'
WHERE slug = 'chatbot-dat-lich';

-- 3. DU LỊCH - NHÀ HÀNG (1 bot)
UPDATE "Service" 
SET "categoryId" = '0d2fd0d7-76ed-4b30-8165-20ed38b17cc6'
WHERE slug = 'chatbot-fnb';

-- 4. BẤT ĐỘNG SẢN (1 bot)
UPDATE "Service" 
SET "categoryId" = 'c28a155c-46a6-4628-8098-9d9fcea1093a'
WHERE slug = 'chatbot-bds';

-- 5. KHÁC (2 bot test)
UPDATE "Service" 
SET "categoryId" = 'eaece93b-d9fc-4e58-a0fc-5b11997e67b2'
WHERE slug IN ('test', 'test-test');

-- KIỂM TRA KẾT QUẢ
SELECT 
  s.name as "Tên Bot",
  s.slug as "Slug",
  c.name as "Lĩnh vực"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
ORDER BY c."order" NULLS LAST, s.name;

-- ĐẾM SỐ BOT THEO LĨNH VỰC
SELECT 
  COALESCE(c.name, 'Chưa phân loại') as "Lĩnh vực",
  COUNT(s.id) as "Số bot"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
GROUP BY c.id, c.name, c."order"
ORDER BY c."order" NULLS LAST;

