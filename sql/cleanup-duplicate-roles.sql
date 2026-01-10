-- Xóa các CommissionSetting thừa
-- Giữ lại: collaborator_retail, agent_retail, distributor_retail
-- Xóa: ctv_retail, master_agent_retail

DELETE FROM "CommissionSetting" WHERE key = 'ctv_retail';
DELETE FROM "CommissionSetting" WHERE key = 'master_agent_retail';

-- Verify
SELECT * FROM "CommissionSetting" ORDER BY role;
