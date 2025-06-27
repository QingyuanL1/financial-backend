-- 新增三个财务报表的数据库表结构

-- 营业收入结构与质量表
DROP TABLE IF EXISTS `business_income_structure`;
CREATE TABLE `business_income_structure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL COMMENT '期间',
  `data` json NOT NULL COMMENT '数据JSON格式',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营业收入结构与质量表';

-- 主营业务收入分解情况表
DROP TABLE IF EXISTS `main_business_income`;
CREATE TABLE `main_business_income` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL COMMENT '期间',
  `data` json NOT NULL COMMENT '数据JSON格式',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主营业务收入分解情况表';

-- 主营业务当年订单转收入表
DROP TABLE IF EXISTS `order_to_income`;
CREATE TABLE `order_to_income` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL COMMENT '期间',
  `data` json NOT NULL COMMENT '数据JSON格式',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主营业务当年订单转收入表';

-- 插入示例数据
INSERT INTO `business_income_structure` (`period`, `data`) VALUES 
('2025-06-01', '[{"id":1,"category":"主营业务","yearlyPlan":59400.00,"currentTotal":5147.93,"progress":8.67},{"id":2,"category":"非主营业务","yearlyPlan":600.00,"currentTotal":50.30,"progress":8.38}]');

INSERT INTO `main_business_income` (`period`, `data`) VALUES 
('2025-06-01', '{"equipment":[{"customer":"上海","yearlyPlan":"缺少数据","currentTotal":2363.98,"progress":"/"},{"customer":"国网","yearlyPlan":"缺少数据","currentTotal":884.59,"progress":"/"},{"customer":"江苏","yearlyPlan":"缺少数据","currentTotal":119.81,"progress":"/"},{"customer":"输配电内配","yearlyPlan":"缺少数据","currentTotal":0.00,"progress":"/"},{"customer":"西门子","yearlyPlan":"缺少数据","currentTotal":0.00,"progress":"/"},{"customer":"同业","yearlyPlan":"缺少数据","currentTotal":67.98,"progress":"/"},{"customer":"用户","yearlyPlan":"缺少数据","currentTotal":26.41,"progress":"/"},{"customer":"其它","yearlyPlan":"缺少数据","currentTotal":0.00,"progress":"/"}],"components":[{"customer":"用户","yearlyPlan":"缺少数据","currentTotal":3.09,"progress":"/"}],"engineering":[{"customer":"一包","yearlyPlan":"缺少数据","currentTotal":-0.01,"progress":"/"},{"customer":"二包","yearlyPlan":"缺少数据","currentTotal":297.01,"progress":"/"},{"customer":"域内合作","yearlyPlan":"缺少数据","currentTotal":717.23,"progress":"/"},{"customer":"域外合作","yearlyPlan":"缺少数据","currentTotal":522.45,"progress":"/"},{"customer":"其它","yearlyPlan":"缺少数据","currentTotal":145.39,"progress":"/"}]}');

INSERT INTO `order_to_income` (`period`, `data`) VALUES 
('2025-06-01', '{"equipment":[{"customer":"上海","signedOrder":5593.15,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"国网","signedOrder":1358.11,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"江苏","signedOrder":1132.24,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"输配电内配","signedOrder":0.00,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"西门子","signedOrder":9.94,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"同业","signedOrder":765.74,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"用户","signedOrder":90.95,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"其它","signedOrder":0.00,"incomeTotal":0.00,"incomeRate":0.00}],"components":[{"customer":"用户","signedOrder":97.86,"incomeTotal":0.00,"incomeRate":0.00}],"engineering":[{"customer":"一包","signedOrder":2029.79,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"二包","signedOrder":7.94,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"域内合作","signedOrder":1744.52,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"域外合作","signedOrder":12.70,"incomeTotal":0.00,"incomeRate":0.00},{"customer":"其它","signedOrder":238.62,"incomeTotal":0.00,"incomeRate":0.00}]}');