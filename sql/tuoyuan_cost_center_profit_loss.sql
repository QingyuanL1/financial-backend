-- 创建拓源成本中心计入损益情况表
CREATE TABLE IF NOT EXISTS tuoyuan_cost_center_profit_loss (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    department_attribute VARCHAR(50) NOT NULL COMMENT '部门属性',
    annual_budget DECIMAL(15,2) DEFAULT 0 COMMENT '年度预算',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '累计',
    execution_progress DECIMAL(8,4) DEFAULT 0 COMMENT '执行进度(%)',
    budget_vs_plan_ratio DECIMAL(8,4) DEFAULT 0 COMMENT '预算占计划收入比',
    actual_vs_current_ratio DECIMAL(8,4) DEFAULT 0 COMMENT '实际占当期收入比',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_period_department (period, department_attribute),
    INDEX idx_period (period),
    INDEX idx_department (department_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源成本中心计入损益情况表';