-- SCRIPT CUỐI CÙNG - PHÂN LOẠI TẤT CẢ BOT
-- Copy và chạy TOÀN BỘ script này trong Supabase SQL Editor

-- KINH DOANH (3 bot)
UPDATE "Service" SET "categoryId" = 'd2576bdf-4a00-43ad-b434-bfbb646fa732' WHERE slug = 'chatbot-ban-hang-pro';
UPDATE "Service" SET "categoryId" = 'd2576bdf-4a00-43ad-b434-bfbb646fa732' WHERE slug = 'chatbot-cskh';
UPDATE "Service" SET "categoryId" = 'd2576bdf-4a00-43ad-b434-bfbb646fa732' WHERE slug = 'chatbot-hr';

-- Y TẾ - SỨC KHỎE (1 bot)
UPDATE "Service" SET "categoryId" = 'a99efbb3-1c1f-441d-b64f-22f7f4e30fe8' WHERE slug = 'chatbot-dat-lich';

-- DU LỊCH - NHÀ HÀNG (1 bot)
UPDATE "Service" SET "categoryId" = '0d2fd0d7-76ed-4b30-8165-20ed38b17cc6' WHERE slug = 'chatbot-fnb';

-- BẤT ĐỘNG SẢN (1 bot)
UPDATE "Service" SET "categoryId" = 'c28a155c-46a6-4628-8098-9d9fcea1093a' WHERE slug = 'chatbot-bds';

-- KHÁC (2 bot test)
UPDATE "Service" SET "categoryId" = 'eaece93b-d9fc-4e58-a0fc-5b11997e67b2' WHERE slug = 'test';
UPDATE "Service" SET "categoryId" = 'eaece93b-d9fc-4e58-a0fc-5b11997e67b2' WHERE slug = 'test-test';

-- KIỂM TRA KẾT QUẢ
SELECT '=== KẾT QUẢ PHÂN LOẠI ===' as info;
SELECT 
  s.name as "Tên Bot",
  s.slug as "Slug",
  c.name as "Lĩnh vực"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
ORDER BY c."order" NULLS LAST, s.name;

SELECT '=== ĐẾM THEO LĨNH VỰC ===' as info;
SELECT 
  COALESCE(c.name, 'Chưa phân loại') as "Lĩnh vực",
  COUNT(s.id) as "Số bot"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
GROUP BY c.id, c.name, c."order"
ORDER BY c."order" NULLS LAST;

SELECT '=== BOT CHƯA PHÂN LOẠI ===' as info;
SELECT name, slug FROM "Service" WHERE "categoryId" IS NULL;

