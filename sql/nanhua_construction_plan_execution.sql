-- 南华公司施工计划执行情况表
CREATE TABLE IF NOT EXISTS nanhua_construction_plan_execution (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间(YYYY-MM)',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    annual_target DECIMAL(10,2) DEFAULT 0.00 COMMENT '年度目标',
    on_time_completion_rate DECIMAL(10,2) DEFAULT 0.00 COMMENT '准时完工率(%)',
    acceptance_qualification_rate DECIMAL(10,2) DEFAULT 0.00 COMMENT '验收合格率(%)',
    plan_achievement_rate DECIMAL(10,2) DEFAULT 0.00 COMMENT '计划达成率(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华公司施工计划执行情况';