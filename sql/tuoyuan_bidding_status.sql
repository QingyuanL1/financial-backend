-- 拓源招投标情况表
CREATE TABLE IF NOT EXISTS `tuoyuan_bidding_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `segment_attribute` varchar(50) NOT NULL COMMENT '板块属性',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `collective_bidding` int DEFAULT 0 COMMENT '集采投标数量',
  `winning_bid_count` int DEFAULT 0 COMMENT '中标数量',
  `winning_rate` decimal(10,4) DEFAULT 0.0000 COMMENT '中标率(%)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `segment_attribute` (`segment_attribute`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源招投标情况';