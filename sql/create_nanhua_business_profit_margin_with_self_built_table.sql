-- 创建南华主营业务毛利率结构与质量表（含自建项目）
CREATE TABLE IF NOT EXISTS `nanhua_business_profit_margin_with_self_built` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` varchar(7) NOT NULL COMMENT '期间 (YYYY-MM格式)',
  `customer_name` varchar(100) NOT NULL COMMENT '客户名称',
  `yearly_plan` decimal(10,2) DEFAULT '0.00' COMMENT '年度计划 (百分比)',
  `current_amount` decimal(10,2) DEFAULT '0.00' COMMENT '当期实际 (百分比)',
  `deviation` decimal(10,2) DEFAULT '0.00' COMMENT '偏差 (百分比)',
  `category` varchar(50) DEFAULT '工程' COMMENT '类别',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_period` (`period`),
  KEY `idx_customer` (`customer_name`),
  KEY `idx_period_customer` (`period`, `customer_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='南华主营业务毛利率结构与质量表（含自建项目）';