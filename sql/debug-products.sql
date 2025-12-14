-- Script debug sản phẩm không hiển thị
-- Chạy script này để kiểm tra sản phẩm mới

-- 1. Kiểm tra tất cả sản phẩm và trạng thái
SELECT 
    id,
    name,
    slug,
    active,
    "categoryId",
    "createdAt",
    "updatedAt"
FROM "Service"
ORDER BY "createdAt" DESC
LIMIT 10;

-- 2. Kiểm tra sản phẩm có active = false hoặc null
SELECT 
    id,
    name,
    slug,
    active,
    "categoryId"
FROM "Service"
WHERE active IS NULL OR active = false
ORDER BY "createdAt" DESC;

-- 3. Kiểm tra sản phẩm có active = true (sẽ hiển thị)
SELECT 
    COUNT(*) as total_active,
    COUNT(*) FILTER (WHERE "categoryId" IS NOT NULL) as with_category,
    COUNT(*) FILTER (WHERE "categoryId" IS NULL) as without_category
FROM "Service"
WHERE active = true;

-- 4. Kiểm tra sản phẩm mới nhất (5 sản phẩm gần đây)
SELECT 
    s.id,
    s.name,
    s.slug,
    s.active,
    s."categoryId",
    c.name as category_name,
    s."createdAt"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
ORDER BY s."createdAt" DESC
LIMIT 5;

-- 5. Cập nhật tất cả sản phẩm mới thành active = true (nếu cần)
-- UNCOMMENT để chạy:
-- UPDATE "Service" 
-- SET active = true, "updatedAt" = NOW()
-- WHERE active IS NULL OR active = false;

