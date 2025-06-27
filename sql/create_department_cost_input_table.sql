-- 部门成本中心计入损益情况表结构
DROP TABLE IF EXISTS department_cost_input;

CREATE TABLE department_cost_input (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  data JSON NOT NULL COMMENT '部门成本计入损益数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门成本中心计入损益情况表';

-- 插入示例数据
INSERT INTO department_cost_input (period, data) VALUES 
('2025-06', JSON_OBJECT(
  'departments', JSON_ARRAY(
    JSON_OBJECT('department', '总经理室', 'yearlyBudget', '736.83', 'currentTotal', '48.07', 'executionProgress', '6.52%', 'budgetToOutputRatio', '1.22%', 'actualToOutputRatio', '0.91%'),
    JSON_OBJECT('department', '企管部', 'yearlyBudget', '501.30', 'currentTotal', '46.07', 'executionProgress', '9.19%', 'budgetToOutputRatio', '0.83%', 'actualToOutputRatio', '0.87%'),
    JSON_OBJECT('department', '财务部', 'yearlyBudget', '501.30', 'currentTotal', '26.15', 'executionProgress', '5.22%', 'budgetToOutputRatio', '0.83%', 'actualToOutputRatio', '0.50%'),
    JSON_OBJECT('department', '销售部', 'yearlyBudget', '1,614.28', 'currentTotal', '154.20', 'executionProgress', '9.55%', 'budgetToOutputRatio', '2.67%', 'actualToOutputRatio', '2.93%'),
    JSON_OBJECT('department', '市场部', 'yearlyBudget', '1,614.28', 'currentTotal', '171.82', 'executionProgress', '10.64%', 'budgetToOutputRatio', '2.67%', 'actualToOutputRatio', '3.26%'),
    JSON_OBJECT('department', '营运部', 'yearlyBudget', '2,623.72', 'currentTotal', '239.72', 'executionProgress', '9.14%', 'budgetToOutputRatio', '4.34%', 'actualToOutputRatio', '4.55%'),
    JSON_OBJECT('department', '研技部', 'yearlyBudget', '1,069.78', 'currentTotal', '147.44', 'executionProgress', '13.78%', 'budgetToOutputRatio', '1.77%', 'actualToOutputRatio', '2.80%'),
    JSON_OBJECT('department', 'C-GIS 事业部', 'yearlyBudget', '1,894.69', 'currentTotal', '116.54', 'executionProgress', '6.15%', 'budgetToOutputRatio', '3.14%', 'actualToOutputRatio', '2.21%'),
    JSON_OBJECT('department', '工程事业部', 'yearlyBudget', '1,620.43', 'currentTotal', '59.97', 'executionProgress', '3.70%', 'budgetToOutputRatio', '2.68%', 'actualToOutputRatio', '1.14%')
  ),
  'total', JSON_OBJECT('department', '合计', 'yearlyBudget', '10,061.03', 'currentTotal', '1,009.97', 'executionProgress', '10.04%', 'budgetToOutputRatio', '16.65%', 'actualToOutputRatio', '19.16%')
)) ON DUPLICATE KEY UPDATE 
data = VALUES(data),
updated_at = CURRENT_TIMESTAMP;