-- =====================================================
-- FIX TÀI KHOẢN TEST TRONG SUPABASE AUTH
-- Password = Số điện thoại (theo logic của hệ thống)
-- Chạy từng block một trong Supabase SQL Editor
-- =====================================================

-- BLOCK 1: Kiểm tra dữ liệu hiện tại trong bảng User
SELECT id, email, phone, role, name, password 
FROM public."User"
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
ORDER BY email;

-- =====================================================

-- BLOCK 2: Kiểm tra auth.users hiện tại
SELECT id, email, raw_user_meta_data->>'role' as role, 
       email_confirmed_at IS NOT NULL as confirmed
FROM auth.users
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com', 'admin@admin.com')
ORDER BY email;

-- =====================================================

-- BLOCK 3: Xóa tài khoản test cũ trong auth (nếu có lỗi)
-- CẢNH BÁO: Chỉ chạy nếu cần reset hoàn toàn
/*
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

DELETE FROM auth.users 
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');
*/

-- =====================================================

-- BLOCK 4: Tạo NPP Test (password = 0901000001)
-- ID phải khớp với bảng User: 69308392-6a54-4465-8c4c-df001db0578c
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  '69308392-6a54-4465-8c4c-df001db0578c'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'npp@test.com',
  crypt('0901000001', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "distributor", "name": "Nhà Phân Phối Test", "phone": "0901000001"}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0901000001', gen_salt('bf')),
  raw_user_meta_data = '{"role": "distributor", "name": "Nhà Phân Phối Test", "phone": "0901000001"}'::jsonb,
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Tạo identity cho NPP
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '69308392-6a54-4465-8c4c-df001db0578c'::uuid,
  '{"sub": "69308392-6a54-4465-8c4c-df001db0578c", "email": "npp@test.com"}'::jsonb,
  'email',
  '69308392-6a54-4465-8c4c-df001db0578c',
  NOW(), NOW(), NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 5: Tạo Agent 1 (password = 0902000001)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  '2d1aec5d-53b6-4084-a805-df0824b41dcb'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'agent1@test.com',
  crypt('0902000001', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 1", "phone": "0902000001"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0902000001', gen_salt('bf')),
  raw_user_meta_data = '{"role": "agent", "name": "Đại Lý 1", "phone": "0902000001"}'::jsonb,
  email_confirmed_at = NOW(), updated_at = NOW();

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '2d1aec5d-53b6-4084-a805-df0824b41dcb'::uuid,
  '{"sub": "2d1aec5d-53b6-4084-a805-df0824b41dcb", "email": "agent1@test.com"}'::jsonb,
  'email', '2d1aec5d-53b6-4084-a805-df0824b41dcb', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 6: Tạo Agent 2 (password = 0902000002)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  '1fa13183-4efe-4fcb-9f28-f03b97fa88dc'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'agent2@test.com',
  crypt('0902000002', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 2", "phone": "0902000002"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0902000002', gen_salt('bf')),
  raw_user_meta_data = '{"role": "agent", "name": "Đại Lý 2", "phone": "0902000002"}'::jsonb,
  email_confirmed_at = NOW(), updated_at = NOW();

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '1fa13183-4efe-4fcb-9f28-f03b97fa88dc'::uuid,
  '{"sub": "1fa13183-4efe-4fcb-9f28-f03b97fa88dc", "email": "agent2@test.com"}'::jsonb,
  'email', '1fa13183-4efe-4fcb-9f28-f03b97fa88dc', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 7: Tạo Agent 3 (password = 0902000003)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  '1b1d17e9-6eae-4151-8015-901e8ec04d72'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'agent3@test.com',
  crypt('0902000003', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 3", "phone": "0902000003"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0902000003', gen_salt('bf')),
  raw_user_meta_data = '{"role": "agent", "name": "Đại Lý 3", "phone": "0902000003"}'::jsonb,
  email_confirmed_at = NOW(), updated_at = NOW();

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '1b1d17e9-6eae-4151-8015-901e8ec04d72'::uuid,
  '{"sub": "1b1d17e9-6eae-4151-8015-901e8ec04d72", "email": "agent3@test.com"}'::jsonb,
  'email', '1b1d17e9-6eae-4151-8015-901e8ec04d72', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 8: Tạo CTV 1 (password = 0903000001)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  'b16993c9-21a7-4629-a8fc-3e023db70594'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ctv1@test.com',
  crypt('0903000001', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 1", "phone": "0903000001"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0903000001', gen_salt('bf')),
  raw_user_meta_data = '{"role": "collaborator", "name": "CTV 1", "phone": "0903000001"}'::jsonb,
  email_confirmed_at = NOW(), updated_at = NOW();

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'b16993c9-21a7-4629-a8fc-3e023db70594'::uuid,
  '{"sub": "b16993c9-21a7-4629-a8fc-3e023db70594", "email": "ctv1@test.com"}'::jsonb,
  'email', 'b16993c9-21a7-4629-a8fc-3e023db70594', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 9: Tạo CTV 2 (password = 0903000002)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  '923e8908-e47e-48e1-b4de-fb34f3542a91'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ctv2@test.com',
  crypt('0903000002', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 2", "phone": "0903000002"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0903000002', gen_salt('bf')),
  raw_user_meta_data = '{"role": "collaborator", "name": "CTV 2", "phone": "0903000002"}'::jsonb,
  email_confirmed_at = NOW(), updated_at = NOW();

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '923e8908-e47e-48e1-b4de-fb34f3542a91'::uuid,
  '{"sub": "923e8908-e47e-48e1-b4de-fb34f3542a91", "email": "ctv2@test.com"}'::jsonb,
  'email', '923e8908-e47e-48e1-b4de-fb34f3542a91', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 10: Tạo CTV 3 (password = 0903000003)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
VALUES (
  'f6d33795-c074-4e38-b661-05a32dcd18f5'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ctv3@test.com',
  crypt('0903000003', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 3", "phone": "0903000003"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('0903000003', gen_salt('bf')),
  raw_user_meta_data = '{"role": "collaborator", "name": "CTV 3", "phone": "0903000003"}'::jsonb,
  email_confirmed_at = NOW(), updated_at = NOW();

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'f6d33795-c074-4e38-b661-05a32dcd18f5'::uuid,
  '{"sub": "f6d33795-c074-4e38-b661-05a32dcd18f5", "email": "ctv3@test.com"}'::jsonb,
  'email', 'f6d33795-c074-4e38-b661-05a32dcd18f5', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================

-- BLOCK 11: Cập nhật bảng User với phone đúng (để sync)
UPDATE public."User" SET phone = '0901000001' WHERE email = 'npp@test.com';
UPDATE public."User" SET phone = '0902000001' WHERE email = 'agent1@test.com';
UPDATE public."User" SET phone = '0902000002' WHERE email = 'agent2@test.com';
UPDATE public."User" SET phone = '0902000003' WHERE email = 'agent3@test.com';
UPDATE public."User" SET phone = '0903000001' WHERE email = 'ctv1@test.com';
UPDATE public."User" SET phone = '0903000002' WHERE email = 'ctv2@test.com';
UPDATE public."User" SET phone = '0903000003' WHERE email = 'ctv3@test.com';

-- Fix: admin@admin.com role phải là admin
UPDATE public."User" SET role = 'admin' WHERE email = 'admin@admin.com';

-- =====================================================

-- BLOCK 12: Verify - Kiểm tra kết quả
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  u.raw_user_meta_data->>'phone' as auth_phone,
  u.email_confirmed_at IS NOT NULL as confirmed,
  EXISTS(SELECT 1 FROM auth.identities i WHERE i.user_id = u.id) as has_identity,
  pu.role as db_role,
  pu.phone as db_phone
FROM auth.users u
LEFT JOIN public."User" pu ON pu.email = u.email
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
ORDER BY u.email;

-- =====================================================
-- THÔNG TIN ĐĂNG NHẬP TEST:
-- =====================================================
-- | Email            | Password    | Role        |
-- |------------------|-------------|-------------|
-- | npp@test.com     | 0901000001  | distributor |
-- | agent1@test.com  | 0902000001  | agent       |
-- | agent2@test.com  | 0902000002  | agent       |
-- | agent3@test.com  | 0902000003  | agent       |
-- | ctv1@test.com    | 0903000001  | collaborator|
-- | ctv2@test.com    | 0903000002  | collaborator|
-- | ctv3@test.com    | 0903000003  | collaborator|
-- | admin@admin.com  | admin       | admin       |
-- =====================================================
