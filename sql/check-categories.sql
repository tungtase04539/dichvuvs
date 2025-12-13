-- Script kiểm tra xem bot đã được phân loại vào lĩnh vực chưa
-- Chạy script này để xem tình trạng phân loại

-- 1. Kiểm tra các Category có tồn tại không
SELECT 
  id,
  name,
  slug,
  "order"
FROM "Category"
ORDER BY "order";

-- 2. Kiểm tra các Service và categoryId của chúng
SELECT 
  s.id,
  s.name as "Tên Bot",
  s.slug as "Slug Bot",
  s."categoryId",
  c.name as "Lĩnh vực",
  c.slug as "Category Slug"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
ORDER BY c."order" NULLS LAST, s.name;

-- 3. Đếm số bot theo từng lĩnh vực
SELECT 
  c.name as "Lĩnh vực",
  c.slug as "Category Slug",
  COUNT(s.id) as "Số bot"
FROM "Category" c
LEFT JOIN "Service" s ON s."categoryId" = c.id
GROUP BY c.id, c.name, c.slug, c."order"
ORDER BY c."order";

-- 4. Danh sách bot chưa được phân loại
SELECT 
  id,
  name as "Bot chưa phân loại",
  slug
FROM "Service"
WHERE "categoryId" IS NULL;

