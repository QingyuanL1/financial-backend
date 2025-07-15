-- 添加南华非主营业务情况模块到form_modules表

INSERT IGNORE INTO form_modules (id, module_name, module_key, module_category, route_path, description) VALUES 
(305, '南华非主营业务情况', 'nanhua_non_main_business', '南华', '/nanhua/non-main-business', '南华公司非主营业务收入情况分析');

-- 验证插入结果
SELECT * FROM form_modules WHERE id = 305;
