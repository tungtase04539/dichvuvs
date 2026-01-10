-- =====================================================
-- FIX TÀI KHOẢN TEST TRONG SUPABASE AUTH
-- Chạy từng block một trong Supabase SQL Editor
-- =====================================================

-- BLOCK 1: Kiểm tra users hiện có trong auth.users
SELECT id, email, raw_user_meta_data->>'role' as role, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
ORDER BY email;

-- =====================================================

-- BLOCK 2: Xóa các tài khoản test cũ (nếu có lỗi)
-- CHỈ CHẠY NẾU CẦN RESET
/*
DELETE FROM auth.users 
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');
*/

-- =====================================================

-- BLOCK 3: Lấy IDs từ bảng User để đồng bộ
SELECT id, email, role, name FROM public."User"
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
ORDER BY email;

-- =====================================================

-- BLOCK 4: Tạo tài khoản NPP trong auth.users
-- Lấy ID từ bảng User: 69308392-6a54-4465-8c4c-df001db0578c
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
SELECT 
  '69308392-6a54-4465-8c4c-df001db0578c'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'npp@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "distributor", "name": "Nhà Phân Phối Test"}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'npp@test.com');

-- =====================================================

-- BLOCK 5: Tạo tài khoản Agent 1
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
  '2d1aec5d-53b6-4084-a805-df0824b41dcb'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'agent1@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 1"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'agent1@test.com');

-- =====================================================

-- BLOCK 6: Tạo tài khoản Agent 2
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
  '1fa13183-4efe-4fcb-9f28-f03b97fa88dc'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'agent2@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 2"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'agent2@test.com');

-- =====================================================

-- BLOCK 7: Tạo tài khoản Agent 3
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
  '1b1d17e9-6eae-4151-8015-901e8ec04d72'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'agent3@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 3"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'agent3@test.com');

-- =====================================================

-- BLOCK 8: Tạo tài khoản CTV 1
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
  'b16993c9-21a7-4629-a8fc-3e023db70594'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ctv1@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 1"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ctv1@test.com');

-- =====================================================

-- BLOCK 9: Tạo tài khoản CTV 2
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
  '923e8908-e47e-48e1-b4de-fb34f3542a91'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ctv2@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 2"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ctv2@test.com');

-- =====================================================

-- BLOCK 10: Tạo tài khoản CTV 3
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
  'f6d33795-c074-4e38-b661-05a32dcd18f5'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ctv3@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 3"}'::jsonb,
  'authenticated', 'authenticated', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ctv3@test.com');

-- =====================================================

-- BLOCK 11: Tạo identities cho các users (BẮT BUỘC để đăng nhập)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email'
  );

-- =====================================================

-- BLOCK 12: Verify - Kiểm tra lại
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  EXISTS(SELECT 1 FROM auth.identities i WHERE i.user_id = u.id) as has_identity
FROM auth.users u
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
ORDER BY u.email;
