-- 创建拓源公司主营业务毛利率结构与质量表
CREATE TABLE IF NOT EXISTS tuoyuan_main_business_profit_margin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
    segment_attribute VARCHAR(100) NOT NULL COMMENT '板块',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    yearly_plan DECIMAL(10,2) DEFAULT 0 COMMENT '年度计划（%）',
    current_actual DECIMAL(10,2) DEFAULT 0 COMMENT '当期实际（%）',
    deviation DECIMAL(10,2) DEFAULT 0 COMMENT '偏差（%）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_period_segment_customer (period, segment_attribute, customer_attribute),
    INDEX idx_period (period),
    INDEX idx_segment_attribute (segment_attribute),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源公司主营业务毛利率结构与质量';

-- 初始化基础数据
INSERT INTO tuoyuan_main_business_profit_margin (period, segment_attribute, customer_attribute, yearly_plan, current_actual, deviation) VALUES
('2024-01', '设备', '电业项目', 8.00, 0, 0),
('2024-01', '设备', '用户项目', 0, 0, 0),
('2024-01', '设备', '贸易', 0, 0, 0),
('2024-01', '设备', '代理设备', 24.99, 0, 0),
('2024-01', '设备', '代理工程', 0, 0, 0),
('2024-01', '设备', '代理设计', 100.00, 0, 0);