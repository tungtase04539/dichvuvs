-- =====================================================
-- XÓA HOÀN TOÀN CÁC USER BỊ LỖI
-- Chạy toàn bộ một lần
-- =====================================================

-- Xóa sessions
DELETE FROM auth.sessions WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

-- Xóa refresh tokens
DELETE FROM auth.refresh_tokens WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

-- Xóa mfa factors
DELETE FROM auth.mfa_factors WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

-- Xóa identities
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

-- Xóa users
DELETE FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');

-- Verify
SELECT email FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');
-- Kết quả phải là 0 rows
