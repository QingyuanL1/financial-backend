-- 创建拓源存量订单转收入表
CREATE TABLE IF NOT EXISTS tuoyuan_stock_order_to_income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    segment_attribute VARCHAR(100) NOT NULL COMMENT '板块属性',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    initial_stock_order_balance DECIMAL(15,2) DEFAULT 0 COMMENT '期初存量订单余额',
    current_period_income DECIMAL(15,2) DEFAULT 0 COMMENT '当期转收入',
    current_income_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '当期转收入累计',
    stock_order_income_ratio DECIMAL(8,2) DEFAULT 0 COMMENT '存量订单转收入比率(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_period (period),
    INDEX idx_segment_customer (segment_attribute, customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源存量订单转收入表';

-- 插入默认数据结构
INSERT INTO tuoyuan_stock_order_to_income 
(period, segment_attribute, customer_attribute, initial_stock_order_balance, current_period_income, current_income_cumulative, stock_order_income_ratio)
VALUES
('2024-01', '设备', '电业项目', 1104.53, 0, 0, 0),
('2024-01', '设备', '用户项目', 374.66, 0, 0, 0),
('2024-01', '设备', '贸易', 0.00, 0, 0, 0),
('2024-01', '设备', '代理设备', 861.89, 0, 0, 0),
('2024-01', '设备', '代理工程', 0.00, 0, 0, 0),
('2024-01', '设备', '代理设计', 0.00, 0, 0, 0)
ON DUPLICATE KEY UPDATE
initial_stock_order_balance = VALUES(initial_stock_order_balance),
updated_at = CURRENT_TIMESTAMP;