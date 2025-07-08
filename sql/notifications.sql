-- 通知管理表
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL COMMENT '通知标题',
  content TEXT NOT NULL COMMENT '通知内容',
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info' COMMENT '通知类型',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '优先级',
  status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT '状态',
  target_users JSON COMMENT '目标用户列表，为空表示所有用户',
  sender_id INT COMMENT '发送者ID',
  start_time DATETIME COMMENT '开始显示时间',
  end_time DATETIME COMMENT '结束显示时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_priority (priority),
  INDEX idx_start_time (start_time),
  INDEX idx_end_time (end_time),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='通知管理表';

-- 用户通知阅读记录表
CREATE TABLE IF NOT EXISTS user_notification_reads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  notification_id INT NOT NULL COMMENT '通知ID',
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  UNIQUE KEY unique_user_notification (user_id, notification_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
) COMMENT='用户通知阅读记录表';

-- 插入一些示例数据
INSERT INTO notifications (title, content, type, priority, sender_id, start_time, end_time) VALUES
('系统维护通知', '系统将于本周六晚上10点进行维护，预计维护时间2小时，期间系统可能无法正常访问。', 'warning', 'high', 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
('新功能上线', '财务数据分析模块已上线，支持多维度数据分析和可视化展示。', 'success', 'medium', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('月度报表提醒', '请各部门及时填写本月财务报表，截止日期为月底最后一天。', 'info', 'medium', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('安全提醒', '为保障系统安全，请定期更新密码，建议使用复杂密码。', 'warning', 'low', 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY));