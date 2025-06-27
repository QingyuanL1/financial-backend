-- 年度重大投资情况表结构
DROP TABLE IF EXISTS major_investment_analysis;

CREATE TABLE major_investment_analysis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  data JSON NOT NULL COMMENT '年度重大投资数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='年度重大投资情况表';

-- 插入示例数据
INSERT INTO major_investment_analysis (period, data) VALUES 
('2025-06', JSON_OBJECT(
  'projects', JSON_ARRAY(
    JSON_OBJECT('id', 1, 'projectName', '智能化生产线改造项目', 'initialPlan', 2500000, 'currentExecution', 450000, 'executionProgress', '18.0%'),
    JSON_OBJECT('id', 2, 'projectName', '研发中心扩建工程', 'initialPlan', 1800000, 'currentExecution', 320000, 'executionProgress', '17.8%'),
    JSON_OBJECT('id', 3, 'projectName', '设备数字化升级', 'initialPlan', 1200000, 'currentExecution', 180000, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 4, 'projectName', '环保设施完善工程', 'initialPlan', 800000, 'currentExecution', 120000, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 5, 'projectName', '信息化系统建设', 'initialPlan', 600000, 'currentExecution', 95000, 'executionProgress', '15.8%'),
    JSON_OBJECT('id', 6, 'projectName', '仓储物流优化项目', 'initialPlan', 500000, 'currentExecution', 75000, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 7, 'projectName', '质量检测设备采购', 'initialPlan', 400000, 'currentExecution', 60000, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 8, 'projectName', '安全生产设施改造', 'initialPlan', 350000, 'currentExecution', 52500, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 9, 'projectName', '节能减排技术改造', 'initialPlan', 300000, 'currentExecution', 45000, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 10, 'projectName', '办公楼维修改造', 'initialPlan', 250000, 'currentExecution', 37500, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 11, 'projectName', '备品备件库建设', 'initialPlan', 200000, 'currentExecution', 30000, 'executionProgress', '15.0%'),
    JSON_OBJECT('id', 12, 'projectName', '培训中心建设', 'initialPlan', 150000, 'currentExecution', 22500, 'executionProgress', '15.0%')
  ),
  'summary', JSON_OBJECT(
    'totalInitialPlan', 9050000,
    'totalCurrentExecution', 1487500,
    'totalExecutionProgress', '16.4%'
  )
)) ON DUPLICATE KEY UPDATE 
data = VALUES(data),
updated_at = CURRENT_TIMESTAMP;