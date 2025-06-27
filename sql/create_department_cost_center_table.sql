-- 部门成本中心实际发生情况表结构
DROP TABLE IF EXISTS department_cost_center;

CREATE TABLE department_cost_center (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  data JSON NOT NULL COMMENT '部门成本中心数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门成本中心实际发生情况表';

-- 插入示例数据
INSERT INTO department_cost_center (period, data) VALUES 
('2025-06', JSON_OBJECT(
  'departments', JSON_ARRAY(
    JSON_OBJECT('department', '总经理室', 'yearlyBudget', '580.50', 'currentTotal', '38.70', 'executionProgress', '6.67%', 'budgetToOutputRatio', '0.96%', 'actualToOutputRatio', '0.73%'),
    JSON_OBJECT('department', '企管部', 'yearlyBudget', '420.80', 'currentTotal', '42.15', 'executionProgress', '10.02%', 'budgetToOutputRatio', '0.70%', 'actualToOutputRatio', '0.80%'),
    JSON_OBJECT('department', '财务部', 'yearlyBudget', '315.60', 'currentTotal', '28.40', 'executionProgress', '9.00%', 'budgetToOutputRatio', '0.52%', 'actualToOutputRatio', '0.54%'),
    JSON_OBJECT('department', '销售部', 'yearlyBudget', '1,280.30', 'currentTotal', '125.75', 'executionProgress', '9.82%', 'budgetToOutputRatio', '2.12%', 'actualToOutputRatio', '2.39%'),
    JSON_OBJECT('department', '市场部', 'yearlyBudget', '890.45', 'currentTotal', '89.20', 'executionProgress', '10.02%', 'budgetToOutputRatio', '1.48%', 'actualToOutputRatio', '1.69%'),
    JSON_OBJECT('department', '营运部', 'yearlyBudget', '2,105.80', 'currentTotal', '198.55', 'executionProgress', '9.43%', 'budgetToOutputRatio', '3.49%', 'actualToOutputRatio', '3.77%'),
    JSON_OBJECT('department', '研技部', 'yearlyBudget', '945.20', 'currentTotal', '105.80', 'executionProgress', '11.19%', 'budgetToOutputRatio', '1.57%', 'actualToOutputRatio', '2.01%'),
    JSON_OBJECT('department', 'C-GIS 事业部', 'yearlyBudget', '1,580.75', 'currentTotal', '142.65', 'executionProgress', '9.02%', 'budgetToOutputRatio', '2.62%', 'actualToOutputRatio', '2.71%'),
    JSON_OBJECT('department', '工程事业部', 'yearlyBudget', '1,225.40', 'currentTotal', '98.20', 'executionProgress', '8.01%', 'budgetToOutputRatio', '2.03%', 'actualToOutputRatio', '1.86%')
  ),
  'total', JSON_OBJECT('department', '合计', 'yearlyBudget', '9,344.80', 'currentTotal', '869.40', 'executionProgress', '9.31%', 'budgetToOutputRatio', '15.49%', 'actualToOutputRatio', '16.50%')
)) ON DUPLICATE KEY UPDATE 
data = VALUES(data),
updated_at = CURRENT_TIMESTAMP;