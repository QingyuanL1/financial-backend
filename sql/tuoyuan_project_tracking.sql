-- 拓源项目跟踪情况表
CREATE TABLE IF NOT EXISTS `tuoyuan_project_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `segment_attribute` varchar(50) NOT NULL COMMENT '板块属性',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `annual_plan` decimal(15,2) DEFAULT 0.00 COMMENT '年度计划',
  `current_period` decimal(15,2) DEFAULT 0.00 COMMENT '当期',
  `current_cumulative` decimal(15,2) DEFAULT 0.00 COMMENT '当期累计',
  `execution_progress` decimal(10,4) DEFAULT 0.0000 COMMENT '执行进度(%)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `segment_attribute` (`segment_attribute`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源项目跟踪情况';