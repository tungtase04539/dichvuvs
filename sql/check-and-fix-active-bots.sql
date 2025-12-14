-- Kiểm tra và sửa chatbot không hiển thị
-- Chạy script này để kiểm tra chatbot nào có active = false hoặc null

-- 1. Kiểm tra tất cả chatbot và trạng thái active
SELECT 
    id,
    name,
    slug,
    active,
    "categoryId",
    created_at
FROM "Service"
ORDER BY created_at DESC;

-- 2. Kiểm tra chatbot có active = false hoặc null
SELECT 
    id,
    name,
    slug,
    active,
    "categoryId"
FROM "Service"
WHERE active IS NULL OR active = false;

-- 3. Cập nhật TẤT CẢ chatbot thành active = true (nếu muốn)
-- UNCOMMENT dòng dưới nếu muốn chạy:
-- UPDATE "Service" SET active = true WHERE active IS NULL OR active = false;

-- 4. Cập nhật chatbot cụ thể thành active = true
-- Thay 'slug-cua-chatbot' bằng slug thực tế của chatbot bạn vừa thêm
-- UPDATE "Service" SET active = true WHERE slug = 'slug-cua-chatbot';

-- 5. Kiểm tra chatbot có categoryId chưa
SELECT 
    id,
    name,
    slug,
    active,
    "categoryId",
    c.name as category_name
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
WHERE s."categoryId" IS NULL;

