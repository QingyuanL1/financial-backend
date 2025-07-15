-- 创建拓源公司应收账款情况表
CREATE TABLE IF NOT EXISTS tuoyuan_accounts_receivable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
    segment_attribute VARCHAR(100) NOT NULL COMMENT '板块',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    year_beginning_balance DECIMAL(15,2) DEFAULT 0 COMMENT '年初应收余额（万元）',
    current_invoicing DECIMAL(15,2) DEFAULT 0 COMMENT '当期开票（万元）',
    cumulative_invoicing DECIMAL(15,2) DEFAULT 0 COMMENT '累计开票（万元）',
    current_collection DECIMAL(15,2) DEFAULT 0 COMMENT '当期收款（万元）',
    cumulative_collection DECIMAL(15,2) DEFAULT 0 COMMENT '累计收款（万元）',
    current_receivable_balance DECIMAL(15,2) DEFAULT 0 COMMENT '当期应收余额（万元）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_period_segment_customer (period, segment_attribute, customer_attribute),
    INDEX idx_period (period),
    INDEX idx_segment_attribute (segment_attribute),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源公司应收账款情况';

-- 初始化基础数据
INSERT INTO tuoyuan_accounts_receivable (period, segment_attribute, customer_attribute, year_beginning_balance, current_invoicing, cumulative_invoicing, current_collection, cumulative_collection, current_receivable_balance) VALUES
('2024-01', '设备', '电业项目', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '用户项目', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '贸易', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '代理设备', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '代理工程', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '代理设计', 0, 0, 0, 0, 0, 0);