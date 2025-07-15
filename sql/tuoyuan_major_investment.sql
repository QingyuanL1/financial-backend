-- 拓源年度重大投资情况表
CREATE TABLE IF NOT EXISTS `tuoyuan_major_investment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `sequence_no` int NOT NULL COMMENT '序号',
  `project_name` varchar(200) DEFAULT '' COMMENT '项目名称',
  `annual_plan` decimal(15,2) DEFAULT 0.00 COMMENT '年度计划',
  `current_execution` decimal(15,2) DEFAULT 0.00 COMMENT '当期执行',
  `current_execution_cumulative` decimal(15,2) DEFAULT 0.00 COMMENT '当期执行累计',
  `execution_progress` decimal(10,4) DEFAULT 0.0000 COMMENT '执行进度(%)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `sequence_no` (`sequence_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源年度重大投资情况';