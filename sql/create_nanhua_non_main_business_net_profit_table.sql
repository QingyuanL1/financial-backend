-- 创建南华非主营业务净利润贡献情况表
CREATE TABLE IF NOT EXISTS nanhua_non_main_business_net_profit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    financial_subject VARCHAR(100) NOT NULL COMMENT '财务科目',
    annual_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划',
    current_amount DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    accumulated DECIMAL(15,2) DEFAULT 0 COMMENT '累计',
    execution_progress DECIMAL(8,2) DEFAULT 0 COMMENT '执行进度(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_period_subject (period, financial_subject),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华非主营业务净利润贡献情况表';

-- 创建南华非主营业务净利润贡献情况评估意见表
CREATE TABLE IF NOT EXISTS nanhua_non_main_business_net_profit_assessment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    assessment TEXT COMMENT '分公司评估意见',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_period (period),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华非主营业务净利润贡献情况评估意见表';

-- 插入初始数据（2025-07期间的示例数据）
INSERT INTO nanhua_non_main_business_net_profit (period, financial_subject, annual_plan, current_amount, accumulated, execution_progress) VALUES
('2025-07', '处置固废收入', 5.00, 0.15, 0.15, 3.00),
('2025-07', '车辆租金收入', 30.00, 0.00, 0.00, 0.00),
('2025-07', '利息收入', 0.00, 5.91, 5.91, 0.00),
('2025-07', '设备外服收入', 11.78, 0.00, 0.00, 0.00),
('2025-07', '政府补贴收入', 50.00, 1.39, 1.39, 2.78),
('2025-07', '派遣补贴收入', 20.71, 0.00, 0.00, 0.00)
ON DUPLICATE KEY UPDATE
    annual_plan = VALUES(annual_plan),
    current_amount = VALUES(current_amount),
    accumulated = VALUES(accumulated),
    execution_progress = VALUES(execution_progress),
    updated_at = CURRENT_TIMESTAMP;

-- 插入初始评估意见示例
INSERT INTO nanhua_non_main_business_net_profit_assessment (period, assessment) VALUES
('2025-07', '')
ON DUPLICATE KEY UPDATE
    assessment = VALUES(assessment),
    updated_at = CURRENT_TIMESTAMP;