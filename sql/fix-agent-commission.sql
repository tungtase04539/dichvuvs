-- Tạo commission cho đơn hàng của agent1@test.com
-- Đơn hàng: VS260110L947, totalPrice: 89000, referrerId: f7b06a99-2513-4635-a304-5263a6c809fa

-- Lấy commission rate cho agent (15%)
-- Tính: 89000 * 15% = 13350

INSERT INTO "Commission" (
  id, 
  "userId", 
  "orderId", 
  amount, 
  rate, 
  level, 
  status, 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'f7b06a99-2513-4635-a304-5263a6c809fa',  -- agent1@test.com
  '44c510dd-e221-453d-b0f7-f96515b48136',  -- order id
  13350,  -- 89000 * 15%
  15,     -- 15% rate for agent
  1,      -- level 1 (direct)
  'pending',
  NOW(),
  NOW()
);

-- Verify
SELECT c.*, u.email 
FROM "Commission" c 
JOIN "User" u ON c."userId" = u.id 
WHERE u.email = 'agent1@test.com';
