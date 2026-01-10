-- Xóa admin corrupt trong auth.users
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@admin.com'
);

DELETE FROM auth.users WHERE email = 'admin@admin.com';

-- Verify
SELECT id, email FROM auth.users WHERE email = 'admin@admin.com';
