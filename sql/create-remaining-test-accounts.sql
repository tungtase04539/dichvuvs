-- =====================================================
-- TẠO CÁC TÀI KHOẢN TEST CÒN LẠI (Agent 1-3, CTV 1-3)
-- Chạy toàn bộ một lần
-- =====================================================

-- Xóa nếu đã tồn tại (để tránh lỗi duplicate)
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

DELETE FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');

-- Tạo Agent 1
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

-- Tạo Agent 2
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

-- Tạo Agent 3
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

-- Tạo CTV 1
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

-- Tạo CTV 2
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

-- Tạo CTV 3
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

-- Verify
SELECT email, id, raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
ORDER BY email;
