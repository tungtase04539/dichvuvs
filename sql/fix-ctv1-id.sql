-- Fix ID của ctv1@test.com
-- ID mới từ Auth: 232c978c-1a23-42b6-9d82-35a1305df43f
-- ID cũ trong User: b16993c9-21a7-4629-a8fc-3e023db70594

-- BLOCK 1: Kiểm tra foreign keys
SELECT * FROM public."Withdrawal" WHERE "userId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';
SELECT * FROM public."Commission" WHERE "userId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';
SELECT * FROM public."ReferralLink" WHERE "userId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';

-- BLOCK 2: Cập nhật foreign keys trước
UPDATE public."Withdrawal" SET "userId" = '232c978c-1a23-42b6-9d82-35a1305df43f' WHERE "userId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';
UPDATE public."Commission" SET "userId" = '232c978c-1a23-42b6-9d82-35a1305df43f' WHERE "userId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';
UPDATE public."ReferralLink" SET "userId" = '232c978c-1a23-42b6-9d82-35a1305df43f' WHERE "userId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';
UPDATE public."Order" SET "referrerId" = '232c978c-1a23-42b6-9d82-35a1305df43f' WHERE "referrerId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';
UPDATE public."User" SET "parentId" = '232c978c-1a23-42b6-9d82-35a1305df43f' WHERE "parentId" = 'b16993c9-21a7-4629-a8fc-3e023db70594';

-- BLOCK 3: Cập nhật ID của User
UPDATE public."User" SET id = '232c978c-1a23-42b6-9d82-35a1305df43f' WHERE email = 'ctv1@test.com';

-- BLOCK 4: Verify
SELECT id, email, role FROM public."User" WHERE email = 'ctv1@test.com';
