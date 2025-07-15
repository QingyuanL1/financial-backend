-- 拓源公司施工执行情况表
CREATE TABLE IF NOT EXISTS `tuoyuan_construction_execution_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `segment_attribute` varchar(50) NOT NULL COMMENT '板块属性',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `yearly_plan_production_value` decimal(15,2) DEFAULT 0.00 COMMENT '年度计划产值',
  `self_construction` decimal(15,2) DEFAULT 0.00 COMMENT '自制/自行施工',
  `semi_self_subcontract` decimal(15,2) DEFAULT 0.00 COMMENT '半自制/分包',
  `outsource_transfer` decimal(15,2) DEFAULT 0.00 COMMENT '外发/转包',
  `self_construction_percentage` decimal(5,2) DEFAULT 0.00 COMMENT '自行施工率(百分比)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `segment_attribute` (`segment_attribute`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源公司施工执行情况';