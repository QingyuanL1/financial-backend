-- 生产/施工计划执行情况表结构
DROP TABLE IF EXISTS production_plan_execution;

CREATE TABLE production_plan_execution (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  data JSON NOT NULL COMMENT '生产计划执行数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生产/施工计划执行情况表';

-- 插入示例数据
INSERT INTO production_plan_execution (period, data) VALUES 
('2025-06', JSON_OBJECT(
  'equipment', JSON_ARRAY(
    JSON_OBJECT('customerType', '上海', 'yearlyTarget', '100%', 'onTimeRate', '99%', 'qualifiedRate', '99.99%', 'achievementRate', '80%'),
    JSON_OBJECT('customerType', '国网', 'yearlyTarget', '100%', 'onTimeRate', '98%', 'qualifiedRate', '99.95%', 'achievementRate', '85%'),
    JSON_OBJECT('customerType', '江苏', 'yearlyTarget', '100%', 'onTimeRate', '97%', 'qualifiedRate', '99.98%', 'achievementRate', '82%'),
    JSON_OBJECT('customerType', '输配电内配', 'yearlyTarget', '100%', 'onTimeRate', '98.5%', 'qualifiedRate', '99.97%', 'achievementRate', '84%'),
    JSON_OBJECT('customerType', '西门子', 'yearlyTarget', '100%', 'onTimeRate', '99.5%', 'qualifiedRate', '100%', 'achievementRate', '88%'),
    JSON_OBJECT('customerType', '同业', 'yearlyTarget', '100%', 'onTimeRate', '97.5%', 'qualifiedRate', '99.96%', 'achievementRate', '83%'),
    JSON_OBJECT('customerType', '用户', 'yearlyTarget', '100%', 'onTimeRate', '98%', 'qualifiedRate', '99.98%', 'achievementRate', '81%'),
    JSON_OBJECT('customerType', '其它', 'yearlyTarget', '100%', 'onTimeRate', '96%', 'qualifiedRate', '99.9%', 'achievementRate', '79%')
  ),
  'component', JSON_ARRAY(
    JSON_OBJECT('customerType', '用户', 'yearlyTarget', '100%', 'onTimeRate', '97%', 'qualifiedRate', '99.95%', 'achievementRate', '83%')
  ),
  'project', JSON_ARRAY(
    JSON_OBJECT('customerType', '一包', 'yearlyTarget', '100%', 'onTimeRate', '95%', 'qualifiedRate', '99.8%', 'achievementRate', '78%'),
    JSON_OBJECT('customerType', '二包', 'yearlyTarget', '100%', 'onTimeRate', '94%', 'qualifiedRate', '99.85%', 'achievementRate', '77%'),
    JSON_OBJECT('customerType', '域内合作', 'yearlyTarget', '100%', 'onTimeRate', '96%', 'qualifiedRate', '99.7%', 'achievementRate', '80%'),
    JSON_OBJECT('customerType', '域外合作', 'yearlyTarget', '100%', 'onTimeRate', '93%', 'qualifiedRate', '99.6%', 'achievementRate', '75%'),
    JSON_OBJECT('customerType', '其它', 'yearlyTarget', '100%', 'onTimeRate', '92%', 'qualifiedRate', '99.5%', 'achievementRate', '73%')
  )
)) ON DUPLICATE KEY UPDATE 
data = VALUES(data),
updated_at = CURRENT_TIMESTAMP;