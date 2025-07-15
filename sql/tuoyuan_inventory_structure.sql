-- 拓源存量结构与质量表
CREATE TABLE IF NOT EXISTS `tuoyuan_inventory_structure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `segment_attribute` varchar(50) NOT NULL COMMENT '板块属性',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `year_beginning_amount` decimal(15,2) DEFAULT 0.00 COMMENT '年初金额',
  `current_period_amount` decimal(15,2) DEFAULT 0.00 COMMENT '当期金额',
  `current_period_cumulative` decimal(15,2) DEFAULT 0.00 COMMENT '当期金额累计',
  `fluctuation_rate` decimal(10,4) DEFAULT 0.0000 COMMENT '波动率(%)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `segment_attribute` (`segment_attribute`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源存量结构与质量';