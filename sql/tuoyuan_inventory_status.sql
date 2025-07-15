-- 创建拓源库存情况表
CREATE TABLE IF NOT EXISTS tuoyuan_inventory_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    segment_attribute VARCHAR(50) NOT NULL COMMENT '板块',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    initial_balance DECIMAL(15,2) DEFAULT 0 COMMENT '年初余量',
    current_amount DECIMAL(15,2) DEFAULT 0 COMMENT '当期余额',
    balance DECIMAL(15,2) DEFAULT 0 COMMENT '余额',
    fluctuation_rate DECIMAL(8,4) DEFAULT 0 COMMENT '波动率(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_period_segment_customer (period, segment_attribute, customer_attribute),
    INDEX idx_period (period),
    INDEX idx_segment (segment_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源库存情况表';