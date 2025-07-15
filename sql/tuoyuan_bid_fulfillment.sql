-- 创建拓源中标未履约情况表
CREATE TABLE IF NOT EXISTS tuoyuan_bid_fulfillment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    segment_attribute VARCHAR(100) NOT NULL COMMENT '板块属性',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    initial_balance DECIMAL(15,2) DEFAULT 0 COMMENT '期初余额',
    current_period_value DECIMAL(15,2) DEFAULT 0 COMMENT '当期值',
    current_balance DECIMAL(15,2) DEFAULT 0 COMMENT '当期余额(计算值)',
    volatility_rate DECIMAL(8,2) DEFAULT 0 COMMENT '波动率(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_period (period),
    INDEX idx_segment_customer (segment_attribute, customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源中标未履约情况表';

-- 插入默认数据结构
INSERT INTO tuoyuan_bid_fulfillment 
(period, segment_attribute, customer_attribute, initial_balance, current_period_value, current_balance, volatility_rate)
VALUES
('2024-01', '设备', '电业项目', 4200.00, 0, 4200.00, 0),
('2024-01', '设备', '用户项目', 0.00, 0, 0.00, 0),
('2024-01', '设备', '贸易', 0.00, 0, 0.00, 0),
('2024-01', '设备', '代理设备', 2800.00, 0, 2800.00, 0),
('2024-01', '设备', '代理工程', 0.00, 0, 0.00, 0),
('2024-01', '设备', '代理设计', 200.00, 0, 200.00, 0)
ON DUPLICATE KEY UPDATE
initial_balance = VALUES(initial_balance),
updated_at = CURRENT_TIMESTAMP;