-- 创建拓源主营业务净利润贡献情况表
CREATE TABLE IF NOT EXISTS tuoyuan_main_business_net_profit_contribution (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    business_type VARCHAR(100) NOT NULL COMMENT '业务类型',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    annual_budget DECIMAL(15,2) DEFAULT 0 COMMENT '年度预算',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '累计',
    execution_progress DECIMAL(8,4) DEFAULT 0 COMMENT '执行进度(%)',
    budget_vs_plan_ratio DECIMAL(8,4) DEFAULT 0 COMMENT '预算占计划收入比',
    actual_vs_current_ratio DECIMAL(8,4) DEFAULT 0 COMMENT '实际占当期收入比',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_period_business_customer (period, business_type, customer_attribute),
    INDEX idx_period (period),
    INDEX idx_business_type (business_type),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源主营业务净利润贡献情况表';