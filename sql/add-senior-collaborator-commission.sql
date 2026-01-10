-- Thêm cấu hình hoa hồng cho CTV cao cấp (senior_collaborator)
-- Chạy SQL này trong Supabase SQL Editor

INSERT INTO "CommissionSetting" (id, key, role, type, percent, description, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'senior_collaborator_retail',
  'senior_collaborator',
  'retail',
  12,
  'CTV cao cấp bán trực tiếp - 12%',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  percent = 12,
  description = 'CTV cao cấp bán trực tiếp - 12%',
  "updatedAt" = NOW();

-- Kiểm tra kết quả
SELECT * FROM "CommissionSetting" ORDER BY percent ASC;
