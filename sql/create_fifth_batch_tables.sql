-- 创建第五批财务报表相关表结构
-- 库存情况（合同存量）, 主营业务成本结构与质量, 成本暂估入库和计提情况

-- 1. 库存情况（合同存量）表
CREATE TABLE IF NOT EXISTS contract_inventory (
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

-- 2. 主营业务成本结构与质量表
CREATE TABLE IF NOT EXISTS main_business_cost (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer_type VARCHAR(100) NOT NULL,
    yearly_plan VARCHAR(50) DEFAULT '',
    current_total DECIMAL(15,2) DEFAULT 0.00,
    revenue_ratio VARCHAR(20) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type)
);

-- 3. 成本暂估入库和计提情况表
CREATE TABLE IF NOT EXISTS cost_estimation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer_type VARCHAR(100) NOT NULL,
    initial_balance VARCHAR(50) DEFAULT '',
    new_addition VARCHAR(50) DEFAULT '',
    year_total VARCHAR(50) DEFAULT '',
    provision_rate VARCHAR(20) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type)
);

-- 插入库存情况（合同存量）样本数据
INSERT INTO contract_inventory (period, category, customer_type, initial_amount, current_amount) VALUES
('2024-12', '设备', '上海', 1924.96, 1645.56),
('2024-12', '设备', '国网', 0.00, 0.00),
('2024-12', '设备', '江苏', 0.00, 0.00),
('2024-12', '设备', '输配电内配', 0.00, 0.00),
('2024-12', '设备', '西门子', 0.00, 0.00),
('2024-12', '设备', '同业', 71.56, 71.56),
('2024-12', '设备', '用户', 56.97, 56.97),
('2024-12', '设备', '其它', 14.76, 14.76),
('2024-12', '元件', '用户', 0.00, 0.00),
('2024-12', '工程', '一包', 50.06, 77.28),
('2024-12', '工程', '二包', 94.52, 202.68),
('2024-12', '工程', '域内合作', 825.80, 74.86),
('2024-12', '工程', '域外合作', 11.81, 11.81),
('2024-12', '工程', '其它', 1299.29, 1829.25);

-- 插入主营业务成本结构与质量样本数据
INSERT INTO main_business_cost (period, category, customer_type, yearly_plan, current_total, revenue_ratio) VALUES
('2024-12', '设备', '上海', '17,398.82', 1647.50, '69.69%'),
('2024-12', '设备', '国网', '6,890.12', 746.79, '84.42%'),
('2024-12', '设备', '江苏', '3,534.29', 110.86, '92.53%'),
('2024-12', '设备', '输配电内配', '/', 0.00, '0.00%'),
('2024-12', '设备', '西门子', '/', 0.00, '0.00%'),
('2024-12', '设备', '同业', '2,828.35', 45.94, '67.58%'),
('2024-12', '设备', '用户', '4,658.44', 0.02, '0.00'),
('2024-12', '设备', '其它', '/', 24.82, '93.98%'),
('2024-12', '元件', '用户', '/', 2.75, '89.00%'),
('2024-12', '工程', '一包', '3,283.30', 0.15, '-1500.00%'),
('2024-12', '工程', '二包', '659.15', 285.90, '96.26%'),
('2024-12', '工程', '域内合作', '9,700.00', 683.89, '95.35%'),
('2024-12', '工程', '域外合作', '/', 495.58, '94.86%'),
('2024-12', '工程', '其它', '1,366.90', 132.89, '91.40%');

-- 插入成本暂估入库和计提情况样本数据
INSERT INTO cost_estimation (period, category, customer_type, initial_balance, new_addition, year_total, provision_rate) VALUES
('2024-12', '设备', '上海', '1,500.00', '500.00', '2,000.00', '15.5%'),
('2024-12', '设备', '国网', '800.00', '200.00', '1,000.00', '12.3%'),
('2024-12', '设备', '江苏', '600.00', '150.00', '750.00', '10.8%'),
('2024-12', '设备', '输配电内配', '0.00', '0.00', '0.00', '0.00%'),
('2024-12', '设备', '西门子', '0.00', '0.00', '0.00', '0.00%'),
('2024-12', '设备', '同业', '300.00', '100.00', '400.00', '8.5%'),
('2024-12', '设备', '用户', '200.00', '50.00', '250.00', '5.2%'),
('2024-12', '设备', '其它', '100.00', '25.00', '125.00', '3.1%'),
('2024-12', '元件', '用户', '50.00', '20.00', '70.00', '2.8%'),
('2024-12', '工程', '一包', '2,000.00', '800.00', '2,800.00', '18.9%'),
('2024-12', '工程', '二包', '1,200.00', '300.00', '1,500.00', '16.2%'),
('2024-12', '工程', '域内合作', '1,800.00', '600.00', '2,400.00', '22.1%'),
('2024-12', '工程', '域外合作', '500.00', '150.00', '650.00', '14.3%'),
('2024-12', '工程', '其它', '800.00', '200.00', '1,000.00', '11.7%');