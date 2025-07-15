-- 创建拓源非主营业务情况表
CREATE TABLE IF NOT EXISTS tuoyuan_non_main_business (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    sequence_number INT NOT NULL COMMENT '序号',
    financial_subject VARCHAR(200) NOT NULL COMMENT '财务科目',
    annual_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    current_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '当期累计',
    execution_progress DECIMAL(8,2) DEFAULT 0 COMMENT '执行进度(%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_period (period),
    INDEX idx_sequence (sequence_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源非主营业务情况表';

-- 插入默认数据结构
INSERT INTO tuoyuan_non_main_business 
(period, sequence_number, financial_subject, annual_plan, current_period, current_cumulative, execution_progress)
VALUES
('2024-01', 1, '无', 0, 0, 0, 0),
('2024-01', 2, '', 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE
financial_subject = VALUES(financial_subject),
updated_at = CURRENT_TIMESTAMP;