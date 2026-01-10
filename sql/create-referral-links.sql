-- =====================================================
-- TẠO REFERRAL LINKS CHO CÁC USER TEST
-- Chạy trong Supabase SQL Editor
-- =====================================================

-- Tạo link cho NPP
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'NPP001',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'npp@test.com'
ON CONFLICT (code) DO NOTHING;

-- Tạo link cho Đại lý 1
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'AGENT001',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'agent1@test.com'
ON CONFLICT (code) DO NOTHING;

-- Tạo link cho Đại lý 2
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'AGENT002',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'agent2@test.com'
ON CONFLICT (code) DO NOTHING;

-- Tạo link cho Đại lý 3
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'AGENT003',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'agent3@test.com'
ON CONFLICT (code) DO NOTHING;

-- Tạo link cho CTV 1
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'CTV001',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'ctv1@test.com'
ON CONFLICT (code) DO NOTHING;

-- Tạo link cho CTV 2
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'CTV002',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'ctv2@test.com'
ON CONFLICT (code) DO NOTHING;

-- Tạo link cho CTV 3
INSERT INTO "ReferralLink" (id, code, "userId", "clickCount", "orderCount", revenue, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'CTV003',
    id,
    0, 0, 0, true, NOW(), NOW()
FROM "User" WHERE email = 'ctv3@test.com'
ON CONFLICT (code) DO NOTHING;

-- Verify
SELECT 
    r.code,
    u.name,
    u.role,
    u.email
FROM "ReferralLink" r
JOIN "User" u ON r."userId" = u.id
WHERE r.code IN ('NPP001', 'AGENT001', 'AGENT002', 'AGENT003', 'CTV001', 'CTV002', 'CTV003')
ORDER BY r.code;
