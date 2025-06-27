-- 重新设计表单提交逻辑
-- 从基于用户的提交改为基于系统的提交

USE finance;

-- 1. 备份现有数据
CREATE TABLE form_submissions_backup AS SELECT * FROM form_submissions;

-- 2. 删除现有的form_submissions表
DROP TABLE form_submissions;

-- 3. 重新创建form_submissions表 (系统级别，不基于用户)
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

-- 4. 创建提交历史表 (记录每次提交的历史)
CREATE TABLE form_submission_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id INT NOT NULL COMMENT '模块ID',
  period VARCHAR(7) NOT NULL COMMENT '期间',
  submitted_by INT NOT NULL COMMENT '提交用户ID',
  submission_data JSON COMMENT '提交的表单数据',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  FOREIGN KEY (module_id) REFERENCES form_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_module_period (module_id, period),
  INDEX idx_submitted_by (submitted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单提交历史记录';

-- 5. 从备份数据中迁移数据 (合并同一模块同一期间的提交，保留最新的数据)
INSERT INTO form_submissions (module_id, period, submission_data, last_submitted_by, submitted_at, submission_count)
SELECT 
    b1.module_id,
    b1.period,
    b1.submission_data,
    b1.last_submitted_by,
    b1.submitted_at,
    (SELECT COUNT(*) FROM form_submissions_backup b2 
     WHERE b2.module_id = b1.module_id AND b2.period = b1.period) as submission_count
FROM form_submissions_backup b1
INNER JOIN (
    SELECT module_id, period, MAX(submitted_at) as max_submitted_at
    FROM form_submissions_backup
    GROUP BY module_id, period
) latest ON b1.module_id = latest.module_id 
        AND b1.period = latest.period 
        AND b1.submitted_at = latest.max_submitted_at;

-- 6. 迁移历史记录
INSERT INTO form_submission_history (module_id, period, submitted_by, submission_data, submitted_at)
SELECT module_id, period, last_submitted_by, submission_data, submitted_at
FROM form_submissions_backup 
ORDER BY submitted_at;

-- 7. 显示迁移结果
SELECT '=== 迁移完成统计 ===' as info;
SELECT 
    '原始记录数' as type,
    COUNT(*) as count
FROM form_submissions_backup
UNION ALL
SELECT 
    '新表记录数' as type,
    COUNT(*) as count
FROM form_submissions
UNION ALL
SELECT 
    '历史记录数' as type,
    COUNT(*) as count
FROM form_submission_history;

-- 8. 显示当前提交状态
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