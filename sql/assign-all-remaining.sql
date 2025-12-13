-- Script phân loại tất cả bot còn lại vào lĩnh vực "Khác"
-- Chạy script này nếu vẫn còn bot chưa được phân loại

-- Phân loại tất cả bot chưa có categoryId vào "Khác"
UPDATE "Service" 
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'khac' LIMIT 1)
WHERE "categoryId" IS NULL
  AND slug NOT LIKE 'test%';  -- Không phân loại các bot test

-- Hoặc nếu muốn phân loại cả bot test vào "Khác":
-- UPDATE "Service" 
-- SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'khac' LIMIT 1)
-- WHERE "categoryId" IS NULL;

-- Kiểm tra kết quả
SELECT 
  s.name as "Tên Bot",
  s.slug as "Slug Bot",
  c.name as "Lĩnh vực",
  c.slug as "Category Slug"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
WHERE s."categoryId" IS NULL
ORDER BY s.name;

-- Đếm số bot theo từng lĩnh vực (sau khi phân loại)
SELECT 
  COALESCE(c.name, 'Chưa phân loại') as "Lĩnh vực",
  COUNT(s.id) as "Số bot"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
WHERE s."active" = true OR s."active" IS NULL
GROUP BY c.id, c.name, c."order"
ORDER BY c."order" NULLS LAST;

