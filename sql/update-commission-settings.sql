-- =====================================================
-- CẬP NHẬT CẤU HÌNH HOA HỒNG - CHÍNH SÁCH MỚI
-- Chạy trong Supabase SQL Editor
-- =====================================================

-- Xóa cấu hình cũ
DELETE FROM "CommissionSetting";

-- Insert cấu hình mới theo chính sách:
-- Cấp 1: CTV = 10% bán trực tiếp
-- Cấp 2: Đại lý = 15% bán trực tiếp (override = 15%-10% = 5% từ CTV, cần ≥3 CTV)
-- Cấp 3: NPP = 20% bán trực tiếp (override = 20%-15% = 5% từ Đại lý, cần ≥3 Đại lý)

INSERT INTO "CommissionSetting" (id, key, role, type, percent, description, "createdAt", "updatedAt") 
VALUES
    ((gen_random_uuid())::text, 'ctv_retail', 'ctv', 'retail', 10, 'Cấp 1: CTV bán trực tiếp - 10%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'collaborator_retail', 'collaborator', 'retail', 10, 'Cấp 1: Cộng tác viên bán trực tiếp - 10%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'agent_retail', 'agent', 'retail', 15, 'Cấp 2: Đại lý bán trực tiếp - 15%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'distributor_retail', 'distributor', 'retail', 20, 'Cấp 3: Nhà phân phối bán trực tiếp - 20%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ((gen_random_uuid())::text, 'master_agent_retail', 'master_agent', 'retail', 20, 'Cấp 3: Tổng đại lý bán trực tiếp - 20%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify
SELECT key, role, type, percent, description FROM "CommissionSetting" ORDER BY percent ASC;
