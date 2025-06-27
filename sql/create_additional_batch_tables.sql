-- 创建第四批财务报表相关表结构
-- 中标未履约情况, 存量结构与质量, 在产情况

-- 1. 中标未履约情况表
CREATE TABLE IF NOT EXISTS bid_fulfillment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer_type VARCHAR(100) NOT NULL,
    initial_amount DECIMAL(15,2) DEFAULT 0.00,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type)
);

-- 2. 存量结构与质量表
CREATE TABLE IF NOT EXISTS inventory_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer_type VARCHAR(100) NOT NULL,
    initial_amount DECIMAL(15,2) DEFAULT 0.00,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type)
);

-- 3. 在产情况表
CREATE TABLE IF NOT EXISTS inventory_in_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer_type VARCHAR(100) NOT NULL,
    initial_amount DECIMAL(15,2) DEFAULT 0.00,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type)
);

-- 插入中标未履约情况样本数据
INSERT INTO bid_fulfillment (period, category, customer_type, initial_amount, current_amount) VALUES
('2024-12', '设备', '上海', 31055.26, 24050.77),
('2024-12', '设备', '国网', 2798.76, 1749.41),
('2024-12', '设备', '江苏', 5085.93, 4652.29),
('2024-12', '设备', '输配电内配', 0.00, 0.00),
('2024-12', '设备', '西门子', 0.00, 0.00),
('2024-12', '设备', '同业', 0.00, 0.00),
('2024-12', '设备', '用户', 0.00, 0.00),
('2024-12', '设备', '其它', 0.00, 0.00),
('2024-12', '元件', '用户', 0.00, 0.00),
('2024-12', '工程', '一包', 8281.13, 7836.30),
('2024-12', '工程', '二包', 444.83, 444.83),
('2024-12', '工程', '域内合作', 702.04, 655.64),
('2024-12', '工程', '域外合作', 0.00, 0.00),
('2024-12', '工程', '其它', 21.93, 0.00);

-- 插入存量结构与质量样本数据
INSERT INTO inventory_structure (period, category, customer_type, initial_amount, current_amount) VALUES
('2024-12', '设备', '上海', 39151.53, 34606.27),
('2024-12', '设备', '国网', 7841.48, 7795.84),
('2024-12', '设备', '江苏', 6793.01, 6185.46),
('2024-12', '设备', '输配电内配', 0.00, 0.00),
('2024-12', '设备', '西门子', 28.46, 23.50),
('2024-12', '设备', '同业', 821.55, 1166.57),
('2024-12', '设备', '用户', 577.37, 557.38),
('2024-12', '设备', '其它', 220.08, 113.79),
('2024-12', '元件', '用户', 26.60, 103.44),
('2024-12', '工程', '一包', 12720.17, 13593.13),
('2024-12', '工程', '二包', 960.55, 954.34),
('2024-12', '工程', '域内合作', 1818.79, 5881.62),
('2024-12', '工程', '域外合作', 8063.91, 1054.74),
('2024-12', '工程', '其它', 1973.08, 3484.75);

-- 插入在产情况样本数据
INSERT INTO inventory_in_progress (period, category, customer_type, initial_amount, current_amount) VALUES
('2024-12', '设备', '上海', 4726.55, 8909.94),
('2024-12', '设备', '国网', 5036.79, 6046.43),
('2024-12', '设备', '江苏', 1603.09, 1533.16),
('2024-12', '设备', '输配电内配', 0.00, 0.00),
('2024-12', '设备', '西门子', 28.46, 23.50),
('2024-12', '设备', '同业', 749.99, 1095.01),
('2024-12', '设备', '用户', 520.40, 500.41),
('2024-12', '设备', '其它', 205.32, 99.03),
('2024-12', '元件', '用户', 26.60, 103.44),
('2024-12', '工程', '一包', 4388.98, 5679.55),
('2024-12', '工程', '二包', 421.20, 306.82),
('2024-12', '工程', '域内合作', 4062.14, 5151.32),
('2024-12', '工程', '域外合作', 1603.51, 1042.93),
('2024-12', '工程', '其它', 2492.58, 1655.50);