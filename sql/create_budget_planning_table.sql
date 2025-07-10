-- 创建预算计划表
CREATE TABLE IF NOT EXISTS `budget_planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(4) NOT NULL COMMENT '年度，格式：YYYY',
  `table_key` varchar(100) NOT NULL COMMENT '表格键值',
  `category` varchar(50) NOT NULL COMMENT '类别（设备、元件、工程等）',
  `customer` varchar(100) NOT NULL COMMENT '客户/项目名称',
  `yearly_budget` decimal(15,2) DEFAULT '0.00' COMMENT '年度预算（万元）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_period` (`period`),
  KEY `idx_table_key` (`table_key`),
  KEY `idx_category` (`category`),
  KEY `idx_customer` (`customer`),
  UNIQUE KEY `unique_budget_item` (`period`, `table_key`, `category`, `customer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='年度预算计划表';

-- 插入示例数据
INSERT INTO `budget_planning` (`period`, `table_key`, `category`, `customer`, `yearly_budget`) VALUES
-- 新签订单预算数据
('2025', 'new_orders', '设备', '上海项目', 30000.00),
('2025', 'new_orders', '设备', '国网项目', 8000.00),
('2025', 'new_orders', '设备', '江苏项目', 5000.00),
('2025', 'new_orders', '设备', '输配电内配', 4000.00),
('2025', 'new_orders', '设备', '西门子项目', 5000.00),
('2025', 'new_orders', '设备', '同业项目', 5000.00),
('2025', 'new_orders', '设备', '用户项目', 5000.00),
('2025', 'new_orders', '设备', '其它项目', 0.00),
('2025', 'new_orders', '元件', '用户项目', 4000.00),
('2025', 'new_orders', '工程', '一包项目', 3900.00),
('2025', 'new_orders', '工程', '二包项目', 2200.00),
('2025', 'new_orders', '工程', '域内合作项目', 5000.00),
('2025', 'new_orders', '工程', '域外合作项目', 1000.00),
('2025', 'new_orders', '工程', '其它项目', 1900.00),

-- 项目跟踪预算数据
('2025', 'project_tracking', '设备', '上海', 500000.00),
('2025', 'project_tracking', '设备', '国网', 1050000.00),
('2025', 'project_tracking', '设备', '江苏', 300000.00),
('2025', 'project_tracking', '设备', '输配电内配', 0.00),
('2025', 'project_tracking', '设备', '西门子', 0.00),
('2025', 'project_tracking', '设备', '同业', 0.00),
('2025', 'project_tracking', '设备', '用户', 20000.00),
('2025', 'project_tracking', '设备', '其它', 0.00),
('2025', 'project_tracking', '元件', '用户', 0.00),
('2025', 'project_tracking', '工程', '一包', 150000.00),
('2025', 'project_tracking', '工程', '二包', 600.00),
('2025', 'project_tracking', '工程', '域内合作', 95000.00),
('2025', 'project_tracking', '工程', '域外合作', 5000.00),
('2025', 'project_tracking', '工程', '其它', 2000.00),

-- 营业收入结构预算数据
('2025', 'business_income_structure', '营业收入', '主营业务', 59400.00),
('2025', 'business_income_structure', '营业收入', '非主营业务', 600.00);