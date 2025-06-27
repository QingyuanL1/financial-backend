-- 创建新的表单提交系统 (系统级别，非用户级别)
USE finance;

-- 1. 创建系统级别的表单提交记录表
CREATE TABLE form_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id INT NOT NULL COMMENT '模块ID',
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  submission_data JSON COMMENT '提交的表单数据',
  last_submitted_by INT COMMENT '最后提交用户ID',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '首次提交时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  submission_count INT DEFAULT 1 COMMENT '提交次数',
  FOREIGN KEY (module_id) REFERENCES form_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (last_submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_module_period (module_id, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单提交记录表(系统级别)';

-- 2. 创建提交历史表 (记录每次提交的历史)
CREATE TABLE form_submission_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id INT NOT NULL COMMENT '模块ID',
  period VARCHAR(7) NOT NULL COMMENT '期间',
  submitted_by INT NOT NULL COMMENT '提交用户ID',
  submission_data JSON COMMENT '提交的表单数据',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  action_type ENUM('create', 'update') DEFAULT 'create' COMMENT '操作类型',
  FOREIGN KEY (module_id) REFERENCES form_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_module_period (module_id, period),
  INDEX idx_submitted_by (submitted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单提交历史记录';

-- 3. 插入测试数据
INSERT INTO form_submissions (module_id, period, submission_data, last_submitted_by, submission_count)
VALUES 
(29, '2025-06', '{"test": "production plan data"}', 1, 1),
(19, '2025-06', '{"test": "new orders data"}', 1, 1);

INSERT INTO form_submission_history (module_id, period, submitted_by, submission_data, action_type)
VALUES 
(29, '2025-06', 1, '{"test": "production plan data"}', 'create'),
(19, '2025-06', 1, '{"test": "new orders data"}', 'create');

-- 4. 显示创建结果
SELECT '=== 新提交系统创建完成 ===' as info;

SELECT 
    fs.module_id,
    fm.module_name,
    fm.module_category,
    fs.period,
    u.username as last_submitted_by,
    fs.submitted_at,
    fs.submission_count
FROM form_submissions fs
JOIN form_modules fm ON fs.module_id = fm.id
LEFT JOIN users u ON fs.last_submitted_by = u.id
ORDER BY fs.submitted_at DESC;

SELECT CONCAT('历史记录数: ', COUNT(*)) as history_count
FROM form_submission_history;