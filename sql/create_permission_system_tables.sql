-- 权限系统相关表结构

-- 1. 用户角色表
DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  role_description VARCHAR(200) COMMENT '角色描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色表';

-- 2. 表单模块表
DROP TABLE IF EXISTS form_modules;
CREATE TABLE form_modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_name VARCHAR(100) NOT NULL COMMENT '模块名称',
  module_key VARCHAR(50) NOT NULL UNIQUE COMMENT '模块标识键',
  module_category VARCHAR(50) NOT NULL COMMENT '模块分类(财务/营销/生产/企管)',
  route_path VARCHAR(200) NOT NULL COMMENT '路由路径',
  description VARCHAR(200) COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单模块表';

-- 3. 角色权限表
DROP TABLE IF EXISTS role_permissions;
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  module_id INT NOT NULL,
  permission_type ENUM('read', 'write') NOT NULL COMMENT '权限类型：只读或读写',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES form_modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_module (role_id, module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限表';

-- 4. 用户表(扩展现有users表)
-- 添加email字段（如果不存在）
ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER username;
-- 设置role_id外键（如果还没有）
ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES user_roles(id);

-- 5. 表单填写记录表
DROP TABLE IF EXISTS form_submissions;
CREATE TABLE form_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  module_id INT NOT NULL,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  submission_data JSON COMMENT '提交的表单数据',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES form_modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_module_period (user_id, module_id, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单填写记录表';

-- 插入初始角色数据
INSERT INTO user_roles (role_name, role_description) VALUES 
('super_admin', '超级管理员 - 拥有所有权限'),
('admin', '管理员 - 拥有大部分管理权限'),
('financial_manager', '财务经理 - 拥有财务模块的所有权限'),
('marketing_manager', '营销经理 - 拥有营销模块的所有权限'),
('production_manager', '生产经理 - 拥有生产模块的所有权限'),
('enterprise_manager', '企管经理 - 拥有企管模块的所有权限'),
('financial_staff', '财务专员 - 财务模块填写权限'),
('marketing_staff', '营销专员 - 营销模块填写权限'),
('production_staff', '生产专员 - 生产模块填写权限'),
('enterprise_staff', '企管专员 - 企管模块填写权限'),
('leader', '领导 - 只有查看权限，无填写权限'),
('viewer', '查看者 - 只有部分模块的查看权限');

-- 插入表单模块数据
INSERT INTO form_modules (module_name, module_key, module_category, route_path, description) VALUES 
-- 财务模块
('资产负债表', 'balance_sheet', '财务', '/example', '企业资产负债状况'),
('现金流量表', 'cash_flow', '财务', '/cashflow', '现金流入流出情况'),
('利润表', 'income_statement', '财务', '/incomestatement', '收入支出和利润情况'),
('营业收入结构与质量', 'business_income_structure', '财务', '/business-income-structure', '营业收入分析'),
('主营业务收入分解', 'main_business_income', '财务', '/main-business-income', '主营业务收入详情'),
('主营业务当年订单转收入', 'order_to_income', '财务', '/order-to-income', '当年订单转收入分析'),
('主营业务存量订单转收入', 'stock_order_to_income', '财务', '/stock-order-to-income', '存量订单转收入分析'),
('非主营业务情况', 'non_main_business', '财务', '/non-main-business', '非主营业务收入'),
('成本中心结构与质量', 'cost_center_structure', '财务', '/cost-center-structure', '成本中心分析'),
('主营业务边际贡献率', 'business_contribution', '财务', '/business-contribution', '边际贡献率分析'),
('主营业务毛利率', 'business_profit_margin', '财务', '/business-profit-margin', '毛利率分析'),
('净利润结构', 'net_profit_structure', '财务', '/net-profit-structure', '净利润结构分析'),
('主营净利润贡献情况', 'main_business_net_profit', '财务', '/main-business-net-profit', '主营净利润贡献'),
('非主营净利润贡献情况', 'non_main_business_net_profit', '财务', '/non-main-business-net-profit', '非主营净利润贡献'),
('收款结构', 'receipt_structure', '财务', '/receipt-structure', '收款结构分析'),
('应收账款', 'accounts_receivable', '财务', '/accounts-receivable', '应收账款管理'),
('逾期应收款', 'overdue_receivables', '财务', '/overdue-receivables', '逾期应收款分析'),
('坏账准备情况', 'bad_debt_provision', '财务', '/bad-debt-provision', '坏账准备管理'),

-- 营销模块
('新签订单', 'new_orders', '营销', '/new-order', '新签订单情况'),
('项目跟踪', 'project_tracking', '营销', '/budget-execution-new', '项目进展跟踪'),
('招投标情况', 'bidding_status', '营销', '/bidding-status', '招投标分析'),
('中标未履约', 'bid_fulfillment', '营销', '/bid-fulfillment', '中标未履约情况'),
('存量结构', 'inventory_structure', '营销', '/inventory-structure', '存量结构分析'),
('在产情况', 'inventory_in_progress', '营销', '/inventory-in-progress', '在产情况分析'),
('库存情况(合同存量)', 'contract_inventory', '营销', '/contract-inventory', '合同存量分析'),
('主营业务成本', 'main_business_cost', '营销', '/main-business-cost', '主营业务成本分析'),
('成本暂估入库和计提', 'cost_estimation', '营销', '/cost-estimation', '成本暂估分析'),

-- 生产模块
('产值结构与质量', 'production_value', '生产', '/production-value', '产值结构分析'),
('生产计划执行情况', 'production_plan_execution', '生产', '/production-plan-execution', '生产计划执行'),
('生产执行分析', 'production_execution_analysis', '生产', '/production-execution-analysis', '生产执行情况分析'),

-- 企管模块
('部门成本中心实际发生', 'department_cost_center', '企管', '/department-cost-center', '部门成本中心分析'),
('部门成本中心计入损益', 'department_cost_input', '企管', '/department-cost-input', '部门成本损益分析'),
('年度重大投资情况', 'major_investment_analysis', '企管', '/major-investment-analysis', '重大投资分析');

-- 插入角色权限数据(示例)
-- 超级管理员 - 所有模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 1, id, 'write' FROM form_modules;

-- 财务经理 - 财务模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 3, id, 'write' FROM form_modules WHERE module_category = '财务';

-- 营销经理 - 营销模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 4, id, 'write' FROM form_modules WHERE module_category = '营销';

-- 生产经理 - 生产模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 5, id, 'write' FROM form_modules WHERE module_category = '生产';

-- 企管经理 - 企管模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 6, id, 'write' FROM form_modules WHERE module_category = '企管';

-- 领导 - 所有模块只读权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 11, id, 'read' FROM form_modules;

-- 财务专员 - 财务模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 7, id, 'write' FROM form_modules WHERE module_category = '财务';

-- 营销专员 - 营销模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 8, id, 'write' FROM form_modules WHERE module_category = '营销';

-- 生产专员 - 生产模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 9, id, 'write' FROM form_modules WHERE module_category = '生产';

-- 企管专员 - 企管模块读写权限
INSERT INTO role_permissions (role_id, module_id, permission_type) 
SELECT 10, id, 'write' FROM form_modules WHERE module_category = '企管';

-- 插入示例用户数据
UPDATE users SET role_id = 1 WHERE id = 1; -- 设置第一个用户为超级管理员

-- 为现有用户添加email
UPDATE users SET email = CONCAT(username, '@company.com') WHERE email IS NULL;

-- 插入更多示例用户
INSERT INTO users (username, email, password, role_id, created_at) VALUES 
('financial_manager', 'fm@company.com', 'hashed_password', 3, NOW()),
('marketing_manager', 'mm@company.com', 'hashed_password', 4, NOW()),
('production_manager', 'pm@company.com', 'hashed_password', 5, NOW()),
('enterprise_manager', 'em@company.com', 'hashed_password', 6, NOW()),
('leader', 'leader@company.com', 'hashed_password', 11, NOW()),
('financial_staff', 'fs@company.com', 'hashed_password', 7, NOW()),
('marketing_staff', 'ms@company.com', 'hashed_password', 8, NOW()),
('production_staff', 'ps@company.com', 'hashed_password', 9, NOW()),
('enterprise_staff', 'es@company.com', 'hashed_password', 10, NOW());