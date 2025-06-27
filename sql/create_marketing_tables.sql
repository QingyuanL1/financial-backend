-- 创建营销相关表结构 (Marketing Tables)
-- 新签订单结构与质量, 项目跟踪, 招投标情况

-- 1. 新签订单结构与质量表
CREATE TABLE IF NOT EXISTS new_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer VARCHAR(100) NOT NULL,
    yearly_plan DECIMAL(15,2) DEFAULT 0.00,
    current_total DECIMAL(15,2) DEFAULT 0.00,
    progress DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer (customer)
);

-- 2. 项目跟踪表 (对应 BudgetExecution.vue)
DROP TABLE IF EXISTS project_tracking;
CREATE TABLE project_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer VARCHAR(100) NOT NULL,
    yearly_plan DECIMAL(15,2) DEFAULT 0.00,
    current_total DECIMAL(15,2) DEFAULT 0.00,
    progress DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer (customer)
);

-- 3. 招投标情况表
CREATE TABLE IF NOT EXISTS bidding_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer VARCHAR(100) NOT NULL,
    bid_amount DECIMAL(15,2) DEFAULT 0.00,
    win_amount DECIMAL(15,2) DEFAULT 0.00,
    win_rate DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer (customer)
);

-- 插入新签订单样本数据
INSERT INTO new_orders (period, category, customer, yearly_plan, current_total, progress) VALUES
('2024-12', '设备', '上海项目', 30000.00, 5593.15, 18.64),
('2024-12', '设备', '国网项目', 8000.00, 1358.11, 16.98),
('2024-12', '设备', '江苏项目', 5000.00, 1132.24, 22.64),
('2024-12', '设备', '输配电内配', 4000.00, 0.00, 0.00),
('2024-12', '设备', '西门子项目', 5000.00, 9.94, 0.20),
('2024-12', '设备', '同业项目', 5000.00, 765.74, 15.31),
('2024-12', '设备', '用户项目', 5000.00, 90.95, 1.82),
('2024-12', '设备', '其它项目', 0.00, 0.00, 0.00),
('2024-12', '元件', '用户项目', 4000.00, 97.86, 2.45),
('2024-12', '工程', '一包项目', 3900.00, 2029.79, 52.05),
('2024-12', '工程', '二包项目', 2200.00, 7.94, 0.36),
('2024-12', '工程', '域内合作项目', 5000.00, 1744.52, 34.89),
('2024-12', '工程', '域外合作项目', 1000.00, 12.70, 1.27),
('2024-12', '工程', '其它项目', 1900.00, 238.62, 12.56);

-- 插入项目跟踪样本数据
INSERT INTO project_tracking (period, category, customer, yearly_plan, current_total, progress) VALUES
('2024-12', '设备', '上海', 500000.00, 869.12, 0.17),
('2024-12', '设备', '国网', 1050000.00, 47080.48, 4.48),
('2024-12', '设备', '江苏', 300000.00, 5566.01, 1.86),
('2024-12', '设备', '输配电内配', 0.00, 0.00, 0.00),
('2024-12', '设备', '西门子', 0.00, 0.00, 0.00),
('2024-12', '设备', '同业', 0.00, 0.00, 0.00),
('2024-12', '设备', '用户', 20000.00, 0.00, 0.00),
('2024-12', '设备', '其它', 0.00, 0.00, 0.00),
('2024-12', '元件', '用户', 0.00, 0.00, 0.00),
('2024-12', '工程', '一包', 150000.00, 26306.96, 17.54),
('2024-12', '工程', '二包', 600.00, 0.00, 0.00),
('2024-12', '工程', '域内合作', 95000.00, 4248.34, 4.47),
('2024-12', '工程', '域外合作', 5000.00, 1967.21, 39.34),
('2024-12', '工程', '其它', 2000.00, 0.00, 0.00);

-- 插入招投标情况样本数据
INSERT INTO bidding_status (period, category, customer, bid_amount, win_amount, win_rate) VALUES
('2024-12', '设备', '上海', 869.12, 0.00, 0.00),
('2024-12', '设备', '国网', 47080.48, 0.00, 0.00),
('2024-12', '设备', '江苏', 5566.01, 337.85, 6.07),
('2024-12', '设备', '输配电内配', 0.00, 0.00, 0.00),
('2024-12', '设备', '西门子', 0.00, 0.00, 0.00),
('2024-12', '设备', '同业', 0.00, 0.00, 0.00),
('2024-12', '设备', '用户', 0.00, 0.00, 0.00),
('2024-12', '设备', '其它', 0.00, 0.00, 0.00),
('2024-12', '元件', '用户', 0.00, 0.00, 0.00),
('2024-12', '工程', '一包', 26306.96, 1577.71, 6.00),
('2024-12', '工程', '二包', 0.00, 0.00, 0.00),
('2024-12', '工程', '域内合作', 4248.34, 742.71, 17.48),
('2024-12', '工程', '域外合作', 1967.21, 0.00, 0.00),
('2024-12', '工程', '其它', 0.00, 0.00, 0.00);