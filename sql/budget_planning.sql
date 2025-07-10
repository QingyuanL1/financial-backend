-- 创建年度预算计划表
CREATE TABLE IF NOT EXISTS budget_planning (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(10) NOT NULL COMMENT '期间（年份）',
    table_key VARCHAR(100) NOT NULL COMMENT '表格键值（如new_orders, project_tracking等）',
    category VARCHAR(50) NOT NULL COMMENT '板块属性（设备、元件、工程、净利润、非主营业务、部门成本中心）',
    customer VARCHAR(100) NOT NULL COMMENT '客户属性',
    yearly_budget DECIMAL(15,2) DEFAULT 0 COMMENT '年度预算（万元）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_table_key (table_key),
    INDEX idx_category (category),
    INDEX idx_period_table (period, table_key),
    UNIQUE KEY unique_budget_item (period, table_key, category, customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='年度预算计划表';

-- 插入示例数据（可选）
INSERT INTO budget_planning (period, table_key, category, customer, yearly_budget) VALUES
('2025', 'new_orders', '设备', '上海项目', 30000.00),
('2025', 'new_orders', '设备', '国网项目', 8000.00),
('2025', 'new_orders', '设备', '江苏项目', 5000.00),
('2025', 'new_orders', '元件', '用户项目', 4000.00),
('2025', 'new_orders', '工程', '一包项目', 3900.00),
('2025', 'new_orders', '工程', '二包项目', 2200.00),
('2025', 'project_tracking', '设备', '上海', 500000.00),
('2025', 'project_tracking', '设备', '国网', 1050000.00),
('2025', 'project_tracking', '元件', '用户', 0.00),
('2025', 'project_tracking', '工程', '一包', 150000.00);