-- 创建南华成本计提情况表
CREATE TABLE IF NOT EXISTS nanhua_cost_provision (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    customer_name VARCHAR(100) NOT NULL COMMENT '客户属性',
    year_begin_balance DECIMAL(15,2) DEFAULT 0 COMMENT '年初余额',
    monthly_increase DECIMAL(15,2) DEFAULT 0 COMMENT '本月新增',
    yearly_accumulated DECIMAL(15,2) DEFAULT 0 COMMENT '本年累计',
    provision_rate DECIMAL(8,2) DEFAULT 0 COMMENT '计提率(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_period_customer (period, customer_name),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华成本计提情况表';

-- 插入初始数据（2025-06期间的示例数据）
INSERT INTO nanhua_cost_provision (period, customer_name, year_begin_balance, monthly_increase, yearly_accumulated, provision_rate) VALUES
('2025-06', '一包项目', 1164.76, 123.66, 215.82, 16.79),
('2025-06', '二包项目', 426.90, 148.30, 148.30, 23.32),
('2025-06', '域内合作项目', 474.41, 6.29, 16.42, 3.37),
('2025-06', '域外合作项目', 661.56, 0.00, 9.39, 1.42),
('2025-06', '新能源项目', 730.12, 66.76, 131.03, 16.01),
('2025-06', '苏州项目', 93.99, 10.05, 10.05, 9.57),
('2025-06', '抢修项目', 0.00, 0.00, 10.59, 0.00),
('2025-06', '运检项目', 242.66, 0.00, 80.90, 33.34),
('2025-06', '派遣', 19.50, 0.00, 0.00, 0.00),
('2025-06', '自建', 0.00, 0.00, 0.00, 0.00)
ON DUPLICATE KEY UPDATE
    monthly_increase = VALUES(monthly_increase),
    yearly_accumulated = VALUES(yearly_accumulated),
    provision_rate = VALUES(provision_rate),
    updated_at = CURRENT_TIMESTAMP;
