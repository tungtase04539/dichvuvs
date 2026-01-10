-- =====================================================
-- KIỂM TRA VÀ FIX AUTH.IDENTITIES
-- Lỗi "Database error querying schema" thường do thiếu identity
-- =====================================================

-- BLOCK 1: Kiểm tra users có identity chưa
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.email_confirmed_at IS NOT NULL as confirmed,
  i.id as identity_id,
  i.provider
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com', 'admin@admin.com')
ORDER BY u.email;

-- =====================================================

-- BLOCK 2: Tạo identities cho các users thiếu
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  u.id::text,
  NOW(),
  u.created_at,
  NOW()
FROM auth.users u
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email'
  );

-- =====================================================

-- BLOCK 3: Verify lại
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as role,
  COUNT(i.id) as identity_count
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com', 'admin@admin.com')
GROUP BY u.id, u.email
ORDER BY u.email;

-- =====================================================

-- BLOCK 4: Kiểm tra instance_id (phải là 00000000-0000-0000-0000-000000000000)
SELECT id, email, instance_id 
FROM auth.users 
WHERE email IN ('npp@test.com', 'agent1@test.com', 'ctv1@test.com', 'admin@admin.com');

-- =====================================================

-- BLOCK 5: Fix instance_id nếu sai
UPDATE auth.users 
SET instance_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
  AND instance_id != '00000000-0000-0000-0000-000000000000'::uuid;

-- =====================================================

-- BLOCK 6: Kiểm tra aud và role (phải là 'authenticated')
SELECT id, email, aud, role 
FROM auth.users 
WHERE email IN ('npp@test.com', 'agent1@test.com', 'ctv1@test.com', 'admin@admin.com');

-- =====================================================

-- BLOCK 7: Fix aud và role nếu sai
UPDATE auth.users 
SET aud = 'authenticated', role = 'authenticated'
WHERE email IN ('npp@test.com', 'agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
  AND (aud != 'authenticated' OR role != 'authenticated');
