-- =====================================================
-- XÓA HOÀN TOÀN CÁC USER BỊ LỖI (FIX TYPE CAST)
-- Chạy từng block một
-- =====================================================

-- BLOCK 1: Lấy danh sách IDs cần xóa
SELECT id, email FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');

-- =====================================================

-- BLOCK 2: Xóa identities
DELETE FROM auth.identities 
WHERE user_id::text IN (
  SELECT id::text FROM auth.users 
  WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                  'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com')
);

-- =====================================================

-- BLOCK 3: Xóa users
DELETE FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');

-- =====================================================

-- BLOCK 4: Verify - phải trả về 0 rows
SELECT email FROM auth.users 
WHERE email IN ('agent1@test.com', 'agent2@test.com', 'agent3@test.com', 
                'ctv1@test.com', 'ctv2@test.com', 'ctv3@test.com');
