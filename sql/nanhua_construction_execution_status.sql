-- 南华公司施工执行情况表
CREATE TABLE IF NOT EXISTS nanhua_construction_execution_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间(YYYY-MM)',
    customer_attribute VARCHAR(100) NOT NULL COMMENT '客户属性',
    annual_planned_output DECIMAL(15,2) DEFAULT 0.00 COMMENT '年度计划产值(万元)',
    self_construction DECIMAL(15,2) DEFAULT 0.00 COMMENT '自制/自行施工(万元)',
    semi_self_subcontract DECIMAL(15,2) DEFAULT 0.00 COMMENT '半自制/分包(万元)',
    outsourced_subcontract DECIMAL(15,2) DEFAULT 0.00 COMMENT '外发/转包(万元)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_customer_attribute (customer_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华公司施工执行情况';