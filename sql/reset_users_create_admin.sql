-- 清空users表并创建管理员账号
USE financial_analysis;

-- 清空users表
DELETE FROM users;

-- 重置自增ID
ALTER TABLE users AUTO_INCREMENT = 1;

-- 创建超级管理员账号
-- 密码: admin123 (已加密)
INSERT INTO users (username, email, password, role_id, created_at) VALUES 
('admin', 'admin@dayagroup.com', '$2b$10$fQWvtgBmoSMBPJQgJk9cy.qR3lQxn7OC3PR9WrXzJBu52ztdHU51y', 1, NOW());

-- 验证插入结果
SELECT u.id, u.username, u.email, r.role_name, r.role_description, u.created_at
FROM users u
JOIN user_roles r ON u.role_id = r.id
WHERE u.username = 'admin';

-- 显示角色码信息供参考
SELECT '=== 角色码参考 ===' as info;
SELECT 
    'SUPER_ADMIN_2024' as role_code, 
    'super_admin' as role_name, 
    '超级管理员 - 系统最高权限' as description
UNION ALL
SELECT 'ADMIN_2024', 'admin', '管理员 - 系统管理权限'
UNION ALL  
SELECT 'FINANCE_MGR_2024', 'financial_manager', '财务经理 - 财务模块管理权限'
UNION ALL
SELECT 'MARKETING_MGR_2024', 'marketing_manager', '营销经理 - 营销模块管理权限'
UNION ALL
SELECT 'PRODUCTION_MGR_2024', 'production_manager', '生产经理 - 生产模块管理权限'
UNION ALL
SELECT 'ENTERPRISE_MGR_2024', 'enterprise_manager', '企管经理 - 企管模块管理权限'
UNION ALL
SELECT 'FINANCE_STAFF_2024', 'financial_staff', '财务专员 - 财务模块操作权限'
UNION ALL
SELECT 'MARKETING_STAFF_2024', 'marketing_staff', '营销专员 - 营销模块操作权限'
UNION ALL
SELECT 'PRODUCTION_STAFF_2024', 'production_staff', '生产专员 - 生产模块操作权限'
UNION ALL
SELECT 'ENTERPRISE_STAFF_2024', 'enterprise_staff', '企管专员 - 企管模块操作权限'
UNION ALL
SELECT 'LEADER_2024', 'leader', '领导 - 查看权限'
UNION ALL
SELECT 'VIEWER_2024', 'viewer', '查看者 - 基础查看权限';