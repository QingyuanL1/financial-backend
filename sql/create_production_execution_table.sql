-- 生产/施工订单生产施工执行情况表结构
DROP TABLE IF EXISTS production_execution;

CREATE TABLE production_execution (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  data JSON NOT NULL COMMENT '生产执行数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生产/施工订单生产施工执行情况表';

-- 插入示例数据
INSERT INTO production_execution (period, data) VALUES 
('2025-06', JSON_OBJECT(
  'equipment', JSON_ARRAY(
    JSON_OBJECT('customerType', '上海', 'yearlyPlan', 6000, 'selfProduction', 3600, 'semiProduction', 1800, 'outsourcing', 600),
    JSON_OBJECT('customerType', '国网', 'yearlyPlan', 8000, 'selfProduction', 4800, 'semiProduction', 2400, 'outsourcing', 800),
    JSON_OBJECT('customerType', '江苏', 'yearlyPlan', 7000, 'selfProduction', 4200, 'semiProduction', 2100, 'outsourcing', 700),
    JSON_OBJECT('customerType', '输配电内配', 'yearlyPlan', 5000, 'selfProduction', 3000, 'semiProduction', 1500, 'outsourcing', 500),
    JSON_OBJECT('customerType', '西门子', 'yearlyPlan', 4000, 'selfProduction', 2400, 'semiProduction', 1200, 'outsourcing', 400),
    JSON_OBJECT('customerType', '同业', 'yearlyPlan', 3000, 'selfProduction', 1800, 'semiProduction', 900, 'outsourcing', 300),
    JSON_OBJECT('customerType', '用户', 'yearlyPlan', 9000, 'selfProduction', 5400, 'semiProduction', 2700, 'outsourcing', 900),
    JSON_OBJECT('customerType', '其它', 'yearlyPlan', 5000, 'selfProduction', 3000, 'semiProduction', 1500, 'outsourcing', 500)
  ),
  'component', JSON_OBJECT(
    'yearlyPlan', 7000, 'selfProduction', 4900, 'semiProduction', 1400, 'outsourcing', 700
  ),
  'project', JSON_ARRAY(
    JSON_OBJECT('customerType', '一包', 'yearlyPlan', 12000, 'selfProduction', 6000, 'semiProduction', 4800, 'outsourcing', 1200),
    JSON_OBJECT('customerType', '二包', 'yearlyPlan', 10000, 'selfProduction', 5000, 'semiProduction', 4000, 'outsourcing', 1000),
    JSON_OBJECT('customerType', '域内合作', 'yearlyPlan', 8000, 'selfProduction', 4000, 'semiProduction', 3200, 'outsourcing', 800),
    JSON_OBJECT('customerType', '域外合作', 'yearlyPlan', 9000, 'selfProduction', 4500, 'semiProduction', 3600, 'outsourcing', 900),
    JSON_OBJECT('customerType', '其它', 'yearlyPlan', 7000, 'selfProduction', 3500, 'semiProduction', 2800, 'outsourcing', 700)
  )
)) ON DUPLICATE KEY UPDATE 
data = VALUES(data),
updated_at = CURRENT_TIMESTAMP;