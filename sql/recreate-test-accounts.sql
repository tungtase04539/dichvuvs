-- =====================================================
-- XÓA VÀ TẠO LẠI TÀI KHOẢN TEST HOÀN TOÀN
-- Chạy từng block một trong Supabase SQL Editor
-- =====================================================

-- BLOCK 1: Xóa identities của các tài khoản test
DELETE FROM auth.identities 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

-- =====================================================

-- BLOCK 2: Xóa users trong auth.users
DELETE FROM auth.users 
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');

-- =====================================================

-- BLOCK 3: Tạo lại NPP (copy cấu trúc từ admin@admin.com)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
)
SELECT 
  instance_id,
  '69308392-6a54-4465-8c4c-df001db0578c'::uuid,  -- ID từ bảng User
  aud,
  role,
  'npp@test.com',
  crypt('0901000001', gen_salt('bf')),  -- Password = phone
  NOW(),
  invited_at,
  '',
  confirmation_sent_at,
  '',
  recovery_sent_at,
  '',
  '',
  email_change_sent_at,
  NULL,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "distributor", "name": "Nhà Phân Phối Test", "phone": "0901000001"}'::jsonb,
  is_super_admin,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL,
  false
FROM auth.users WHERE email = 'admin@admin.com';

-- =====================================================

-- BLOCK 4: Tạo identity cho NPP
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
)
VALUES (
  '69308392-6a54-4465-8c4c-df001db0578c',
  '69308392-6a54-4465-8c4c-df001db0578c'::uuid,
  '{"sub": "69308392-6a54-4465-8c4c-df001db0578c", "email": "npp@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
);

-- =====================================================

-- BLOCK 5: Tạo Agent 1
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  is_sso_user, is_anonymous
)
SELECT 
  instance_id,
  '2d1aec5d-53b6-4084-a805-df0824b41dcb'::uuid,
  aud, role,
  'agent1@test.com',
  crypt('0902000001', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 1", "phone": "0902000001"}'::jsonb,
  false, NOW(), NOW(), false, false
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES (
  '2d1aec5d-53b6-4084-a805-df0824b41dcb',
  '2d1aec5d-53b6-4084-a805-df0824b41dcb'::uuid,
  '{"sub": "2d1aec5d-53b6-4084-a805-df0824b41dcb", "email": "agent1@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email', NOW(), NOW(), NOW(), gen_random_uuid()
);

-- =====================================================

-- BLOCK 6: Tạo Agent 2
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  is_sso_user, is_anonymous
)
SELECT 
  instance_id,
  '1fa13183-4efe-4fcb-9f28-f03b97fa88dc'::uuid,
  aud, role,
  'agent2@test.com',
  crypt('0902000002', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 2", "phone": "0902000002"}'::jsonb,
  false, NOW(), NOW(), false, false
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES (
  '1fa13183-4efe-4fcb-9f28-f03b97fa88dc',
  '1fa13183-4efe-4fcb-9f28-f03b97fa88dc'::uuid,
  '{"sub": "1fa13183-4efe-4fcb-9f28-f03b97fa88dc", "email": "agent2@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email', NOW(), NOW(), NOW(), gen_random_uuid()
);

-- =====================================================

-- BLOCK 7: Tạo Agent 3
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  is_sso_user, is_anonymous
)
SELECT 
  instance_id,
  '1b1d17e9-6eae-4151-8015-901e8ec04d72'::uuid,
  aud, role,
  'agent3@test.com',
  crypt('0902000003', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "agent", "name": "Đại Lý 3", "phone": "0902000003"}'::jsonb,
  false, NOW(), NOW(), false, false
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES (
  '1b1d17e9-6eae-4151-8015-901e8ec04d72',
  '1b1d17e9-6eae-4151-8015-901e8ec04d72'::uuid,
  '{"sub": "1b1d17e9-6eae-4151-8015-901e8ec04d72", "email": "agent3@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email', NOW(), NOW(), NOW(), gen_random_uuid()
);

-- =====================================================

-- BLOCK 8: Tạo CTV 1
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  is_sso_user, is_anonymous
)
SELECT 
  instance_id,
  'b16993c9-21a7-4629-a8fc-3e023db70594'::uuid,
  aud, role,
  'ctv1@test.com',
  crypt('0903000001', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 1", "phone": "0903000001"}'::jsonb,
  false, NOW(), NOW(), false, false
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES (
  'b16993c9-21a7-4629-a8fc-3e023db70594',
  'b16993c9-21a7-4629-a8fc-3e023db70594'::uuid,
  '{"sub": "b16993c9-21a7-4629-a8fc-3e023db70594", "email": "ctv1@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email', NOW(), NOW(), NOW(), gen_random_uuid()
);

-- =====================================================

-- BLOCK 9: Tạo CTV 2
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  is_sso_user, is_anonymous
)
SELECT 
  instance_id,
  '923e8908-e47e-48e1-b4de-fb34f3542a91'::uuid,
  aud, role,
  'ctv2@test.com',
  crypt('0903000002', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 2", "phone": "0903000002"}'::jsonb,
  false, NOW(), NOW(), false, false
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES (
  '923e8908-e47e-48e1-b4de-fb34f3542a91',
  '923e8908-e47e-48e1-b4de-fb34f3542a91'::uuid,
  '{"sub": "923e8908-e47e-48e1-b4de-fb34f3542a91", "email": "ctv2@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email', NOW(), NOW(), NOW(), gen_random_uuid()
);

-- =====================================================

-- BLOCK 10: Tạo CTV 3
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  is_sso_user, is_anonymous
)
SELECT 
  instance_id,
  'f6d33795-c074-4e38-b661-05a32dcd18f5'::uuid,
  aud, role,
  'ctv3@test.com',
  crypt('0903000003', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "collaborator", "name": "CTV 3", "phone": "0903000003"}'::jsonb,
  false, NOW(), NOW(), false, false
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES (
  'f6d33795-c074-4e38-b661-05a32dcd18f5',
  'f6d33795-c074-4e38-b661-05a32dcd18f5'::uuid,
  '{"sub": "f6d33795-c074-4e38-b661-05a32dcd18f5", "email": "ctv3@test.com", "email_verified": false, "phone_verified": false}'::jsonb,
  'email', NOW(), NOW(), NOW(), gen_random_uuid()
);

-- =====================================================

-- BLOCK 11: Verify
SELECT 
  u.email,
  u.id,
  u.aud,
  u.role as auth_role,
  u.raw_user_meta_data->>'role' as meta_role,
  u.email_confirmed_at IS NOT NULL as confirmed,
  COUNT(i.id) as identity_count
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com', 'admin@admin.com')
GROUP BY u.id
ORDER BY u.email;

-- =====================================================
-- THÔNG TIN ĐĂNG NHẬP:
-- npp@test.com / 0901000001
-- agent1@test.com / 0902000001
-- agent2@test.com / 0902000002
-- agent3@test.com / 0902000003
-- ctv1@test.com / 0903000001
-- ctv2@test.com / 0903000002
-- ctv3@test.com / 0903000003
-- admin@admin.com / admin
-- =====================================================
