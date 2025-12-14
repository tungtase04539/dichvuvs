-- Kích hoạt tất cả chatbot (set active = true)
-- Script này sẽ cập nhật TẤT CẢ chatbot thành active = true

-- 1. Xem trước số lượng chatbot sẽ được cập nhật
SELECT 
    COUNT(*) as total_bots,
    COUNT(*) FILTER (WHERE active = true) as already_active,
    COUNT(*) FILTER (WHERE active = false OR active IS NULL) as need_activation
FROM "Service";

-- 2. Cập nhật TẤT CẢ chatbot thành active = true
UPDATE "Service" 
SET active = true 
WHERE active IS NULL OR active = false;

-- 3. Xác nhận kết quả
SELECT 
    id,
    name,
    slug,
    active,
    "categoryId",
    created_at
FROM "Service"
ORDER BY updated_at DESC
LIMIT 20;

