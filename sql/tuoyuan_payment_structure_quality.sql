-- 拓源公司收款结构与质量表
CREATE TABLE IF NOT EXISTS `tuoyuan_payment_structure_quality` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `segment_attribute` varchar(50) NOT NULL COMMENT '板块属性',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `yearly_plan` decimal(15,2) DEFAULT 0.00 COMMENT '年度计划',
  `missing_data` decimal(15,2) DEFAULT 0.00 COMMENT '缺少数据',
  `current_accumulated` decimal(15,2) DEFAULT 0.00 COMMENT '当期累计',
  `execution_progress` decimal(5,2) DEFAULT 0.00 COMMENT '执行进度(百分比)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `segment_attribute` (`segment_attribute`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源公司收款结构与质量';