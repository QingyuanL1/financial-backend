-- 使用财务分析数据库
USE finance;

-- 创建南华主营业务成本结构与质量表
CREATE TABLE IF NOT EXISTS nanhua_main_business_cost (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
    customer_name VARCHAR(100) NOT NULL COMMENT '客户属性',
    yearly_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划',
    current_period DECIMAL(15,2) DEFAULT 0 COMMENT '当期',
    accumulated DECIMAL(15,2) DEFAULT 0 COMMENT '累计',
    revenue_ratio DECIMAL(8,2) DEFAULT 0 COMMENT '占主营收入比',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_period (period),
    INDEX idx_customer_name (customer_name),
    UNIQUE KEY unique_period_customer (period, customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华主营业务成本结构与质量';

-- 插入初始数据（基于图片中的数据）
INSERT INTO nanhua_main_business_cost (period, customer_name, yearly_plan, current_period, accumulated, revenue_ratio) VALUES
('2025-01', '一包项目', 4576.40, 446.33, 446.33, 77.79),
('2025-01', '二包项目', 2441.97, 631.68, 631.68, 96.65),
('2025-01', '域内合作项目', 3831.93, 155.49, 155.49, 90.02),
('2025-01', '域外合作项目', 2410.82, 267.83, 267.83, 96.42),
('2025-01', '新能源项目', 3098.65, 625.40, 625.40, 82.60),
('2025-01', '苏州项目', 707.15, 469.95, 469.95, 108.55),
('2025-01', '抢修项目', 183.74, 0.00, 0.00, 0.00),
('2025-01', '运检项目', 1070.12, 546.60, 546.60, 81.45),
('2025-01', '设备外服', 242.25, 0.00, 0.00, 0.00),
('2025-01', '派遣', 207.07, 0.00, 0.00, 0.00),
('2025-01', '自建项目', 0.00, 0.00, 0.00, 0.00)
ON DUPLICATE KEY UPDATE
    yearly_plan = VALUES(yearly_plan),
    current_period = VALUES(current_period),
    accumulated = VALUES(accumulated),
    revenue_ratio = VALUES(revenue_ratio),
    updated_at = CURRENT_TIMESTAMP;
