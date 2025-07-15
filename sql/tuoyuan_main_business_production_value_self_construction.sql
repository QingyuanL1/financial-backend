-- 创建拓源主营业务产值--自行施工情况分析表
CREATE TABLE IF NOT EXISTS tuoyuan_main_business_production_value_self_construction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    business_type VARCHAR(100) NOT NULL COMMENT '业务类型',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    company_design_capacity DECIMAL(15,2) DEFAULT 0 COMMENT '公司设计产能',
    annual_capacity_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度产能计划',
    current_capacity_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '当期产能累计',
    plan_execution_progress DECIMAL(8,4) DEFAULT 0 COMMENT '计划执行进度(%)',
    capacity_utilization_rate DECIMAL(8,4) DEFAULT 0 COMMENT '产能利用率(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_period_business_customer (period, business_type, customer_attribute),
    INDEX idx_period (period),
    INDEX idx_business_type (business_type),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源主营业务产值--自行施工情况分析表';