-- =====================================================
-- HỆ THỐNG CTV/ĐẠI LÝ - SETUP SQL
-- Chạy trong Supabase SQL Editor
-- =====================================================

-- 1. Tạo table Withdrawal (Yêu cầu rút tiền)
CREATE TABLE IF NOT EXISTS "Withdrawal" (
    "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankHolder" TEXT,
    "status" TEXT DEFAULT 'pending',
    "note" TEXT,
    "adminNote" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm foreign keys sau khi tạo table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Withdrawal_userId_fkey') THEN
        ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Withdrawal_processedBy_fkey') THEN
        ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_processedBy_fkey" 
        FOREIGN KEY ("processedBy") REFERENCES "User"("id");
    END IF;
END $$;

-- 2. Xóa dữ liệu cũ trong CommissionSetting (nếu có) và insert mới
DELETE FROM "CommissionSetting";

INSERT INTO "CommissionSetting" (id, key, role, type, percent, description, "createdAt", "updatedAt") 
VALUES
    ((gen_random_uuid())::text, 'ctv_retail', 'ctv', 'retail', 20, 'CTV bán trực tiếp - 20%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'collaborator_retail', 'collaborator', 'retail', 20, 'Cộng tác viên bán trực tiếp - 20%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'agent_retail', 'agent', 'retail', 25, 'Đại lý bán trực tiếp - 25%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'agent_override', 'agent', 'override', 5, 'Đại lý hưởng từ CTV cấp dưới - 5%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'master_agent_retail', 'master_agent', 'retail', 30, 'Tổng đại lý bán trực tiếp - 30%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'master_agent_override_l1', 'master_agent', 'override', 5, 'Tổng đại lý hưởng từ Agent trực tiếp - 5%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'master_agent_override_l2', 'master_agent', 'override', 2, 'Tổng đại lý hưởng từ CTV (qua Agent) - 2%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Thêm index để tăng performance
CREATE INDEX IF NOT EXISTS idx_commission_user ON "Commission"("userId");
CREATE INDEX IF NOT EXISTS idx_commission_order ON "Commission"("orderId");
CREATE INDEX IF NOT EXISTS idx_commission_status ON "Commission"(status);
CREATE INDEX IF NOT EXISTS idx_order_referrer ON "Order"("referrerId");
CREATE INDEX IF NOT EXISTS idx_withdrawal_user ON "Withdrawal"("userId");
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON "Withdrawal"(status);
CREATE INDEX IF NOT EXISTS idx_user_parent ON "User"("parentId");
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);

-- 4. Thêm cột chatbotLink vào Order nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Order' AND column_name = 'chatbotLink') THEN
        ALTER TABLE "Order" ADD COLUMN "chatbotLink" TEXT;
    END IF;
END $$;

-- 5. Verify setup
SELECT 'CommissionSetting count: ' || COUNT(*)::text as result FROM "CommissionSetting"
UNION ALL
SELECT 'Withdrawal table exists: ' || EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Withdrawal')::text;

-- 6. Hiển thị cấu hình hoa hồng
SELECT key, role, type, percent, description FROM "CommissionSetting" ORDER BY role, type;
