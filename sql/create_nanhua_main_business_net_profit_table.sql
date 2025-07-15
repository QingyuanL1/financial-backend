-- 创建南华主营业务净利润贡献情况表
CREATE TABLE IF NOT EXISTS nanhua_main_business_net_profit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    customer_name VARCHAR(100) NOT NULL COMMENT '客户属性',
    yearly_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度目标',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '累计',
    decomposition_ratio DECIMAL(8,2) DEFAULT 0 COMMENT '分解占比(%)',
    annual_ratio DECIMAL(8,2) DEFAULT 0 COMMENT '年度比重(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_period_customer (period, customer_name),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华主营业务净利润贡献情况表';

-- 插入初始数据（2025-06期间的示例数据）
INSERT INTO nanhua_main_business_net_profit (period, customer_name, yearly_plan, current_period, cumulative, decomposition_ratio, annual_ratio) VALUES
('2025-06', '一包项目', 158.95, 127.43, 127.43, 80.21, 19.20),
('2025-06', '二包项目', 30.25, 21.52, 21.52, 71.15, 3.65),
('2025-06', '域内合作项目', 103.14, 9.25, 9.25, 8.97, 12.46),
('2025-06', '域外合作项目', 32.31, 133.78, 133.78, 414.13, 3.90),
('2025-06', '新能源项目', 235.15, 37.62, 37.62, 16.00, 28.41),
('2025-06', '苏州项目', 34.77, 0.00, 0.00, 0.00, 4.20),
('2025-06', '抢修项目', 61.03, 124.45, 124.45, 204.02, 7.37),
('2025-06', '运检项目', 61.08, 0.00, 0.00, 0.00, 7.38),
('2025-06', '派遣', 0.00, 0.00, 0.00, 0.00, 0.00),
('2025-06', '自建', 0.00, 0.00, 0.00, 0.00, 0.00)
ON DUPLICATE KEY UPDATE
    yearly_plan = VALUES(yearly_plan),
    current_period = VALUES(current_period),
    cumulative = VALUES(cumulative),
    decomposition_ratio = VALUES(decomposition_ratio),
    annual_ratio = VALUES(annual_ratio),
    updated_at = CURRENT_TIMESTAMP;