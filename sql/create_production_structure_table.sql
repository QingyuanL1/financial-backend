-- 产值结构与质量表结构
DROP TABLE IF EXISTS production_structure;

CREATE TABLE production_structure (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  data JSON NOT NULL COMMENT '产值结构数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产值结构与质量表';

-- 插入示例数据
INSERT INTO production_structure (period, data) VALUES 
('2025-06', JSON_OBJECT(
  'equipment', JSON_ARRAY(
    JSON_OBJECT('customerType', '上海', 'designCapacity', 50000, 'yearlyPlan', 40000, 'currentAccumulated', 2000, 'executionProgress', '5%', 'utilizationRate', '2.5%'),
    JSON_OBJECT('customerType', '国网', 'designCapacity', 30000, 'yearlyPlan', 25000, 'currentAccumulated', 1500, 'executionProgress', '6%', 'utilizationRate', '3%'),
    JSON_OBJECT('customerType', '江苏', 'designCapacity', 25000, 'yearlyPlan', 20000, 'currentAccumulated', 1200, 'executionProgress', '6%', 'utilizationRate', '2.8%'),
    JSON_OBJECT('customerType', '输配电内配', 'designCapacity', 20000, 'yearlyPlan', 15000, 'currentAccumulated', 800, 'executionProgress', '5.3%', 'utilizationRate', '2.4%'),
    JSON_OBJECT('customerType', '西门子', 'designCapacity', 15000, 'yearlyPlan', 12000, 'currentAccumulated', 700, 'executionProgress', '5.8%', 'utilizationRate', '2.7%'),
    JSON_OBJECT('customerType', '同业', 'designCapacity', 10000, 'yearlyPlan', 8000, 'currentAccumulated', 500, 'executionProgress', '6.3%', 'utilizationRate', '3.1%'),
    JSON_OBJECT('customerType', '用户', 'designCapacity', 35000, 'yearlyPlan', 28000, 'currentAccumulated', 1600, 'executionProgress', '5.7%', 'utilizationRate', '2.9%')
  ),
  'component', JSON_ARRAY(
    JSON_OBJECT('customerType', '其它', 'designCapacity', 8000, 'yearlyPlan', 6000, 'currentAccumulated', 350, 'executionProgress', '5.8%', 'utilizationRate', '2.6%'),
    JSON_OBJECT('customerType', '用户', 'designCapacity', 12000, 'yearlyPlan', 9000, 'currentAccumulated', 520, 'executionProgress', '5.8%', 'utilizationRate', '2.7%')
  ),
  'project', JSON_ARRAY(
    JSON_OBJECT('customerType', '一包', 'designCapacity', 18000, 'yearlyPlan', 14000, 'currentAccumulated', 800, 'executionProgress', '5.7%', 'utilizationRate', '2.8%'),
    JSON_OBJECT('customerType', '二包', 'designCapacity', 15000, 'yearlyPlan', 12000, 'currentAccumulated', 650, 'executionProgress', '5.4%', 'utilizationRate', '2.6%'),
    JSON_OBJECT('customerType', '域内合作', 'designCapacity', 12000, 'yearlyPlan', 9500, 'currentAccumulated', 550, 'executionProgress', '5.8%', 'utilizationRate', '2.7%'),
    JSON_OBJECT('customerType', '域外合作', 'designCapacity', 10000, 'yearlyPlan', 8000, 'currentAccumulated', 450, 'executionProgress', '5.6%', 'utilizationRate', '2.5%'),
    JSON_OBJECT('customerType', '其它', 'designCapacity', 8000, 'yearlyPlan', 6500, 'currentAccumulated', 380, 'executionProgress', '5.8%', 'utilizationRate', '2.8%')
  )
)) ON DUPLICATE KEY UPDATE 
data = VALUES(data),
updated_at = CURRENT_TIMESTAMP;