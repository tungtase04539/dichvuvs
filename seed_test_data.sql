-- Xóa dữ liệu cũ (Tùy chọn, hãy cẩn thận)
-- DELETE FROM "Commission";
-- DELETE FROM "ReferralLink";
-- DELETE FROM "Order";
-- DELETE FROM "ProductCredential";
-- DELETE FROM "Service";
-- DELETE FROM "Category";
-- DELETE FROM "User" WHERE email LIKE '%@test.com';

-- 1. Thêm Cài đặt Hoa hồng (Nếu code dùng bảng này)
INSERT INTO "CommissionSetting" ("id", "key", "role", "type", "percent", "description", "createdAt", "updatedAt")
VALUES 
('11111111-1111-1111-1111-111111111101', 'ctv_retail', 'ctv', 'retail', 15, 'CTV bán trực tiếp hưởng 15%', NOW(), NOW()),
('11111111-1111-1111-1111-111111111102', 'agent_retail', 'agent', 'retail', 20, 'Đại lý bán trực tiếp hưởng 20%', NOW(), NOW()),
('11111111-1111-1111-1111-111111111103', 'agent_override', 'agent', 'override', 5, 'Đại lý hưởng 5% từ CTV cấp dưới', NOW(), NOW())
ON CONFLICT ("key") DO UPDATE SET "percent" = EXCLUDED."percent";

-- 2. Thêm Users theo cấp bậc
-- Admin
INSERT INTO "User" ("id", "email", "password", "name", "role", "balance", "active", "createdAt", "updatedAt")
VALUES ('22222222-2222-2222-2222-222222222201', 'admin@test.com', 'scrypt.1.pw...', 'Hệ thống Admin', 'admin', 0, true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Master Agent (Cấp 1)
INSERT INTO "User" ("id", "email", "password", "name", "role", "balance", "active", "createdAt", "updatedAt")
VALUES ('22222222-2222-2222-2222-222222222202', 'master@test.com', 'scrypt.1.pw...', 'Đại lý Tổng', 'agent', 1000000, true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Sub-Agent (Cấp 2, con của Master Agent)
INSERT INTO "User" ("id", "email", "password", "name", "role", "balance", "active", "parentId", "createdAt", "updatedAt")
VALUES ('22222222-2222-2222-2222-222222222203', 'subagent@test.com', 'scrypt.1.pw...', 'Đại lý Cấp 2', 'agent', 500000, true, '22222222-2222-2222-2222-222222222202', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- CTV (Cấp 3, con của Sub-Agent)
INSERT INTO "User" ("id", "email", "password", "name", "role", "balance", "active", "parentId", "createdAt", "updatedAt")
VALUES ('22222222-2222-2222-2222-222222222204', 'ctv@test.com', 'scrypt.1.pw...', 'Cộng tác viên A', 'ctv', 200000, true, '22222222-2222-2222-2222-222222222203', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Customer (Người mua)
INSERT INTO "User" ("id", "email", "password", "name", "role", "balance", "active", "createdAt", "updatedAt")
VALUES ('22222222-2222-2222-2222-222222222205', 'customer@test.com', 'scrypt.1.pw...', 'Khách hàng May mắn', 'customer', 0, true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- 3. Thêm Danh mục và Dịch vụ
INSERT INTO "Category" ("id", "name", "slug", "description", "active", "createdAt", "updatedAt")
VALUES ('33333333-3333-3333-3333-333333333301', 'Công cụ AI', 'cong-cu-ai', 'Các chatbot hỗ trợ công việc', true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Service" ("id", "name", "slug", "description", "price", "unit", "active", "categoryId", "createdAt", "updatedAt")
VALUES ('33333333-3333-3333-3333-333333333302', 'ChatBot Premium', 'chatbot-premium', 'Gói chatbot xịn nhất', 500000, 'gói', true, '33333333-3333-3333-3333-333333333301', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- 4. Thêm Link Giới thiệu
INSERT INTO "ReferralLink" ("id", "code", "userId", "clickCount", "orderCount", "revenue", "isActive", "createdAt", "updatedAt")
VALUES 
('44444444-4444-4444-4444-444444444401', 'REF-MASTER', '22222222-2222-2222-2222-222222222202', 100, 5, 2500000, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444402', 'REF-CTV', '22222222-2222-2222-2222-222222222204', 50, 2, 1000000, true, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- 5. Thêm Đơn hàng mẫu
-- Đơn hàng từ link của CTV
INSERT INTO "Order" ("id", "orderCode", "customerName", "customerPhone", "customerEmail", "address", "serviceId", "quantity", "unit", "scheduledDate", "scheduledTime", "basePrice", "totalPrice", "status", "referrerId", "referralCode", "createdAt", "updatedAt")
VALUES 
('55555555-5555-5555-5555-555555555501', 'VS2412220001', 'Khách hàng 1', '0123456789', 'kh1@test.com', 'Hà Nội', '33333333-3333-3333-3333-333333333302', 1, 'gói', NOW(), '08:00', 500000, 500000, 'completed', '22222222-2222-2222-2222-222222222204', 'REF-CTV', NOW(), NOW());

-- 6. Thêm Hoa hồng mẫu cho đơn hàng trên (CTV hưởng 15%, Sub-Agent hưởng 5%)
INSERT INTO "Commission" ("id", "orderId", "userId", "amount", "percent", "level", "status", "createdAt", "updatedAt")
VALUES 
('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222204', 75000, 15, 1, 'paid', NOW(), NOW()),
('66666666-6666-6666-6666-666666666602', '55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222203', 25000, 5, 2, 'paid', NOW(), NOW());

-- 7. Thêm Credential cho sản phẩm (để test khi đơn xác nhận tự động)
INSERT INTO "ProductCredential" ("id", "serviceId", "accountInfo", "password", "isUsed", "createdAt", "updatedAt")
VALUES 
('77777777-7777-7777-7777-777777777701', '33333333-3333-3333-3333-333333333302', 'account_test_1', 'pass_test_1', false, NOW(), NOW()),
('77777777-7777-7777-7777-777777777702', '33333333-3333-3333-3333-333333333302', 'account_test_2', 'pass_test_2', false, NOW(), NOW());
