-- 南华坏账准备情况主表
CREATE TABLE IF NOT EXISTS `nanhua_bad_debt_provision` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `customer_attribute` varchar(100) NOT NULL COMMENT '客户属性',
  `year_beginning_balance` decimal(15,2) DEFAULT 0.00 COMMENT '年初余额',
  `current_period_new_addition` decimal(15,2) DEFAULT 0.00 COMMENT '本期新增',
  `current_period_accumulated_collection` decimal(15,2) DEFAULT 0.00 COMMENT '当期累计已收款',
  `year_new_addition` decimal(15,2) DEFAULT 0.00 COMMENT '本年新增',
  `collection_progress` decimal(10,4) DEFAULT 0.0000 COMMENT '收款进度',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `period` (`period`),
  KEY `customer_attribute` (`customer_attribute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华坏账准备情况';

-- 南华坏账准备情况自建项目表
CREATE TABLE IF NOT EXISTS `nanhua_bad_debt_provision_self_built` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  `year_beginning_balance` decimal(15,2) DEFAULT 0.00 COMMENT '年初余额',
  `current_period_new_addition` decimal(15,2) DEFAULT 0.00 COMMENT '本期新增',
  `current_period_accumulated_collection` decimal(15,2) DEFAULT 0.00 COMMENT '当期累计已收款',
  `year_new_addition` decimal(15,2) DEFAULT 0.00 COMMENT '本年新增',
  `collection_progress` decimal(10,4) DEFAULT 0.0000 COMMENT '收款进度',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华坏账准备情况自建项目';