-- 创建拓源主营业务收入分解情况表
CREATE TABLE IF NOT EXISTS tuoyuan_main_business_income_breakdown (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    segment_attribute VARCHAR(100) NOT NULL COMMENT '板块属性',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    annual_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    current_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '当期累计',
    execution_progress DECIMAL(8,2) DEFAULT 0 COMMENT '执行进度(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_period (period),
    INDEX idx_segment_customer (segment_attribute, customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源主营业务收入分解情况表';

-- 插入默认数据结构
INSERT INTO tuoyuan_main_business_income_breakdown 
(period, segment_attribute, customer_attribute, annual_plan, current_period, current_cumulative, execution_progress)
VALUES
('2024-01', '设备', '电业项目', 6017.70, 0, 0, 0),
('2024-01', '设备', '用户项目', 0.00, 0, 0, 0),
('2024-01', '设备', '贸易', 707.96, 0, 0, 0),
('2024-01', '设备', '代理设备', 2654.87, 0, 0, 0),
('2024-01', '设备', '代理工程', 0.00, 0, 0, 0),
('2024-01', '设备', '代理设计', 73.58, 0, 0, 0)
ON DUPLICATE KEY UPDATE
annual_plan = VALUES(annual_plan),
updated_at = CURRENT_TIMESTAMP;