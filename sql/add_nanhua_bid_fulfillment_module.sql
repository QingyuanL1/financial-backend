-- 添加南华中标未履约情况模块到form_modules表

INSERT IGNORE INTO form_modules (id, module_name, module_key, module_category, route_path, description) VALUES 
(308, '南华中标未履约情况', 'nanhua_bid_fulfillment', '南华', '/nanhua/bid-fulfillment', '南华公司中标未履约情况分析');

-- 验证插入结果
SELECT * FROM form_modules WHERE id = 308;
