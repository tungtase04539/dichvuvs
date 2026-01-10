-- Kiểm tra ID của các tài khoản đại lý/CTV trong DB
-- So sánh với auth.users để xem có khớp không

SELECT 
  u.id as "DB_ID",
  u.email,
  u.role,
  au.id as "Auth_ID",
  CASE WHEN u.id = au.id THEN 'OK' ELSE 'MISMATCH' END as "Status"
FROM "User" u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.email IN (
  'npp@test.com',
  'agent1@test.com', 
  'ctv1@test.com',
  'anhtung000@gmail.com'
);
