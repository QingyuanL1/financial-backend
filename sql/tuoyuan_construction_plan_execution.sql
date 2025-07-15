-- 拓源公司施工计划执行情况表
CREATE TABLE IF NOT EXISTS `tuoyuan_construction_plan_execution` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `segment_attribute` varchar(50) NOT NULL COMMENT '板块属性',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `yearly_target` decimal(15,2) DEFAULT 0.00 COMMENT '年度目标',
  `on_time_completion_rate` decimal(5,2) DEFAULT 0.00 COMMENT '准时完工率(百分比)',
  `acceptance_qualification_rate` decimal(5,2) DEFAULT 0.00 COMMENT '验收合格率(百分比)',
  `plan_achievement_rate` decimal(5,2) DEFAULT 0.00 COMMENT '计划达成率(百分比)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `segment_attribute` (`segment_attribute`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源公司施工计划执行情况';