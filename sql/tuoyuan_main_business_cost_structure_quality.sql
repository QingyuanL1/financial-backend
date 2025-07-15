-- 删除旧表（如果存在）
DROP TABLE IF EXISTS tuoyuan_main_business_cost_structure_quality;

-- 创建拓源公司主营业务成本结构与质量（按年度口径分解）表
CREATE TABLE IF NOT EXISTS tuoyuan_main_business_cost_structure_quality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
    segment_attribute VARCHAR(100) NOT NULL COMMENT '板块',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    yearly_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划（万元）',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期（万元）',
    yearly_accumulated DECIMAL(15,2) DEFAULT 0 COMMENT '本年累计（万元）',
    yearly_plan_completion_rate DECIMAL(10,2) DEFAULT 0 COMMENT '年度计划完成率（%）',
    cumulative_ratio DECIMAL(10,2) DEFAULT 0 COMMENT '累计占比（%）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_period_segment_customer (period, segment_attribute, customer_attribute),
    INDEX idx_period (period),
    INDEX idx_segment_attribute (segment_attribute),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源公司主营业务成本结构与质量（按年度口径分解）';

-- 初始化基础数据
INSERT INTO tuoyuan_main_business_cost_structure_quality (period, segment_attribute, customer_attribute, yearly_plan, current_period, yearly_accumulated, yearly_plan_completion_rate, cumulative_ratio) VALUES
('2024-01', '设备', '电业项目', 0, 0, 0, 0, 0),
('2024-01', '设备', '用户项目', 0, 0, 0, 0, 0),
('2024-01', '设备', '贸易', 0, 0, 0, 0, 0),
('2024-01', '设备', '代理设备', 0, 0, 0, 0, 0),
('2024-01', '设备', '代理工程', 0, 0, 0, 0, 0),
('2024-01', '设备', '代理设计', 0, 0, 0, 0, 0);