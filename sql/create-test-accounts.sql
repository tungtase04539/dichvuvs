-- =====================================================
-- TẠO TÀI KHOẢN TEST CHO CÁC VAI TRÒ
-- Chạy trong Supabase SQL Editor
-- Password mặc định: 123456
-- =====================================================

-- 1. Tạo Nhà phân phối (NPP/Distributor) - Cấp cao nhất
INSERT INTO "User" (id, email, password, name, role, phone, balance, active, "createdAt", "updatedAt")
VALUES (
    'npp-001',
    'npp@test.com',
    '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa',
    'Nhà Phân Phối Test',
    'distributor',
    '0901000001',
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET role = 'distributor', name = 'Nhà Phân Phối Test';

-- 2. Tạo 3 Đại lý (Agent) thuộc NPP - để NPP đủ điều kiện nhận override
INSERT INTO "User" (id, email, password, name, role, phone, balance, active, "parentId", "createdAt", "updatedAt")
VALUES 
    ('agent-001', 'agent1@test.com', '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa', 'Đại Lý 1', 'agent', '0902000001', 0, true, 'npp-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('agent-002', 'agent2@test.com', '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa', 'Đại Lý 2', 'agent', '0902000002', 0, true, 'npp-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('agent-003', 'agent3@test.com', '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa', 'Đại Lý 3', 'agent', '0902000003', 0, true, 'npp-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET role = 'agent', "parentId" = 'npp-001';

-- 3. Tạo 3 CTV thuộc Đại Lý 1 - để Đại Lý 1 đủ điều kiện nhận override
INSERT INTO "User" (id, email, password, name, role, phone, balance, active, "parentId", "createdAt", "updatedAt")
VALUES 
    ('ctv-001', 'ctv1@test.com', '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa', 'CTV 1', 'collaborator', '0903000001', 0, true, 'agent-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ctv-002', 'ctv2@test.com', '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa', 'CTV 2', 'collaborator', '0903000002', 0, true, 'agent-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ctv-003', 'ctv3@test.com', '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa', 'CTV 3', 'collaborator', '0903000003', 0, true, 'agent-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET role = 'collaborator', "parentId" = 'agent-001';

-- 4. Tạo thêm 1 CTV độc lập (không có cấp trên)
INSERT INTO "User" (id, email, password, name, role, phone, balance, active, "createdAt", "updatedAt")
VALUES (
    'ctv-solo',
    'ctv.solo@test.com',
    '$2a$10$Y1PvEC7jAEqtJ38ioPE8/.XS48KINRpwpEnElUqO4vDGvHV9659Xa',
    'CTV Độc Lập',
    'collaborator',
    '0903000099',
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET role = 'collaborator', name = 'CTV Độc Lập';

-- 5. Tạo Referral Links cho các tài khoản
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
VALUES 
    ('ref-npp', 'NPP001', 'npp-001', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-agent1', 'AGENT001', 'agent-001', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-agent2', 'AGENT002', 'agent-002', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-agent3', 'AGENT003', 'agent-003', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-ctv1', 'CTV001', 'ctv-001', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-ctv2', 'CTV002', 'ctv-002', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-ctv3', 'CTV003', 'ctv-003', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ref-ctv-solo', 'CTVSOLO', 'ctv-solo', 0, 0, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Verify - Xem cấu trúc phân cấp
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u."parentId",
    p.name as "parentName",
    p.role as "parentRole"
FROM "User" u
LEFT JOIN "User" p ON u."parentId" = p.id
WHERE u.email LIKE '%@test.com'
ORDER BY 
    CASE u.role 
        WHEN 'distributor' THEN 1 
        WHEN 'agent' THEN 2 
        WHEN 'collaborator' THEN 3 
    END,
    u.email;

-- =====================================================
-- DANH SÁCH TÀI KHOẢN TEST:
-- =====================================================
-- | Email              | Password | Vai trò      | Cấp trên    |
-- |--------------------|----------|--------------|-------------|
-- | npp@test.com       | 123456   | NPP          | -           |
-- | agent1@test.com    | 123456   | Đại lý       | NPP         |
-- | agent2@test.com    | 123456   | Đại lý       | NPP         |
-- | agent3@test.com    | 123456   | Đại lý       | NPP         |
-- | ctv1@test.com      | 123456   | CTV          | Đại lý 1    |
-- | ctv2@test.com      | 123456   | CTV          | Đại lý 1    |
-- | ctv3@test.com      | 123456   | CTV          | Đại lý 1    |
-- | ctv.solo@test.com  | 123456   | CTV          | -           |
-- =====================================================
-- 
-- CẤU TRÚC PHÂN CẤP:
-- NPP (npp@test.com)
--   ├── Đại lý 1 (agent1@test.com) - có 3 CTV → đủ điều kiện override
--   │     ├── CTV 1 (ctv1@test.com)
--   │     ├── CTV 2 (ctv2@test.com)
--   │     └── CTV 3 (ctv3@test.com)
--   ├── Đại lý 2 (agent2@test.com) - chưa có CTV
--   └── Đại lý 3 (agent3@test.com) - chưa có CTV
-- 
-- CTV Độc lập (ctv.solo@test.com) - không có cấp trên
-- =====================================================
