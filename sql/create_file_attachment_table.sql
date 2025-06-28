-- 创建文件附件表
CREATE TABLE IF NOT EXISTS form_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  period VARCHAR(7) NOT NULL,
  user_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_module_period (module_id, period),
  INDEX idx_user (user_id),
  
  FOREIGN KEY (module_id) REFERENCES form_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 为表单提交表添加备注字段
ALTER TABLE form_submissions 
ADD COLUMN remarks TEXT COMMENT '备注信息',
ADD COLUMN suggestions TEXT COMMENT '建议信息';

-- 为表单提交历史表添加备注字段
ALTER TABLE form_submission_history 
ADD COLUMN remarks TEXT COMMENT '备注信息',
ADD COLUMN suggestions TEXT COMMENT '建议信息';