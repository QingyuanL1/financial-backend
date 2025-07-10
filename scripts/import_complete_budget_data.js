const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'finance'
};

// 从 BudgetPlanning.vue 中提取的完整23个表格预算数据
const completeBudgetData = [
    // 1. 新签订单结构与质量
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '上海项目', yearly_budget: 30000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '国网项目', yearly_budget: 8000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '江苏项目', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '输配电内配', yearly_budget: 4000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '西门子项目', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '同业项目', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '用户项目', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'new_orders', category: '设备', customer: '其它项目', yearly_budget: 0.00 },
    { period: '2025', table_key: 'new_orders', category: '元件', customer: '用户项目', yearly_budget: 4000.00 },
    { period: '2025', table_key: 'new_orders', category: '工程', customer: '一包项目', yearly_budget: 3900.00 },
    { period: '2025', table_key: 'new_orders', category: '工程', customer: '二包项目', yearly_budget: 2200.00 },
    { period: '2025', table_key: 'new_orders', category: '工程', customer: '域内合作项目', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'new_orders', category: '工程', customer: '域外合作项目', yearly_budget: 1000.00 },
    { period: '2025', table_key: 'new_orders', category: '工程', customer: '其它项目', yearly_budget: 1900.00 },

    // 2. 项目跟踪情况
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '上海', yearly_budget: 500000.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '国网', yearly_budget: 1050000.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '江苏', yearly_budget: 300000.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '同业', yearly_budget: 0.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '用户', yearly_budget: 20000.00 },
    { period: '2025', table_key: 'project_tracking', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'project_tracking', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'project_tracking', category: '工程', customer: '一包', yearly_budget: 150000.00 },
    { period: '2025', table_key: 'project_tracking', category: '工程', customer: '二包', yearly_budget: 600.00 },
    { period: '2025', table_key: 'project_tracking', category: '工程', customer: '域内合作', yearly_budget: 95000.00 },
    { period: '2025', table_key: 'project_tracking', category: '工程', customer: '域外合作', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'project_tracking', category: '工程', customer: '其它', yearly_budget: 2000.00 },

    // 3. 营业收入结构与质量
    { period: '2025', table_key: 'business_income_structure', category: '营业收入', customer: '主营业务', yearly_budget: 59400.00 },
    { period: '2025', table_key: 'business_income_structure', category: '营业收入', customer: '非主营业务', yearly_budget: 600.00 },

    // 4. 主营业务收入分解情况
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '上海', yearly_budget: 22000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '国网', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '江苏', yearly_budget: 3000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '输配电内配', yearly_budget: 2000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '西门子', yearly_budget: 1000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '同业', yearly_budget: 3000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '用户', yearly_budget: 2000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '元件', customer: '用户', yearly_budget: 1000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '工程', customer: '一包', yearly_budget: 3800.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '工程', customer: '二包', yearly_budget: 700.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '工程', customer: '域内合作', yearly_budget: 10000.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '工程', customer: '域外合作', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_income_breakdown', category: '工程', customer: '其它', yearly_budget: 1500.00 },

    // 5. 主营业务——当年订单转收入
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '上海', yearly_budget: 5593.15 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '国网', yearly_budget: 1358.11 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '江苏', yearly_budget: 1132.24 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '西门子', yearly_budget: 9.94 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '同业', yearly_budget: 765.74 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '用户', yearly_budget: 90.95 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '元件', customer: '用户', yearly_budget: 97.86 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '工程', customer: '一包', yearly_budget: 2029.79 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '工程', customer: '二包', yearly_budget: 7.94 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '工程', customer: '域内合作', yearly_budget: 1744.52 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '工程', customer: '域外合作', yearly_budget: 12.70 },
    { period: '2025', table_key: 'current_year_order_to_income', category: '工程', customer: '其它', yearly_budget: 238.62 },

    // 6. 主营业务——存量订单转收入
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '上海', yearly_budget: 39050.53 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '国网', yearly_budget: 7802.20 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '江苏', yearly_budget: 6341.95 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '西门子', yearly_budget: 14.11 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '同业', yearly_budget: 1003.79 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '用户', yearly_budget: 535.45 },
    { period: '2025', table_key: 'stock_order_to_income', category: '设备', customer: '其它', yearly_budget: 221.15 },
    { period: '2025', table_key: 'stock_order_to_income', category: '元件', customer: '用户', yearly_budget: 34.95 },
    { period: '2025', table_key: 'stock_order_to_income', category: '工程', customer: '一包', yearly_budget: 13327.25 },
    { period: '2025', table_key: 'stock_order_to_income', category: '工程', customer: '二包', yearly_budget: 954.35 },
    { period: '2025', table_key: 'stock_order_to_income', category: '工程', customer: '域内合作', yearly_budget: 1906.28 },
    { period: '2025', table_key: 'stock_order_to_income', category: '工程', customer: '域外合作', yearly_budget: 7590.69 },
    { period: '2025', table_key: 'stock_order_to_income', category: '工程', customer: '其它', yearly_budget: 1677.30 },

    // 7. 非主营业务情况
    { period: '2025', table_key: 'non_main_business', category: '非主营业务', customer: '固废收入', yearly_budget: 100.00 },
    { period: '2025', table_key: 'non_main_business', category: '非主营业务', customer: '房屋租金', yearly_budget: 100.00 },
    { period: '2025', table_key: 'non_main_business', category: '非主营业务', customer: '利息收入', yearly_budget: 100.00 },
    { period: '2025', table_key: 'non_main_business', category: '非主营业务', customer: '投资收益', yearly_budget: 130.00 },
    { period: '2025', table_key: 'non_main_business', category: '非主营业务', customer: '补贴收入', yearly_budget: 130.00 },
    { period: '2025', table_key: 'non_main_business', category: '非主营业务', customer: '其他', yearly_budget: 40.00 },

    // 8. 存量结构与质量
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '上海', yearly_budget: 39151.53 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '国网', yearly_budget: 7841.48 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '江苏', yearly_budget: 6793.01 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '西门子', yearly_budget: 28.46 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '同业', yearly_budget: 821.55 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '用户', yearly_budget: 577.37 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '设备', customer: '其它', yearly_budget: 220.08 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '元件', customer: '用户', yearly_budget: 26.60 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '工程', customer: '一包', yearly_budget: 12720.17 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '工程', customer: '二包', yearly_budget: 960.55 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '工程', customer: '域内合作', yearly_budget: 1818.79 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '工程', customer: '域外合作', yearly_budget: 8063.91 },
    { period: '2025', table_key: 'inventory_structure_quality', category: '工程', customer: '其它', yearly_budget: 1973.08 },

    // 9. 中标未履约情况
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '上海', yearly_budget: 31055.26 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '国网', yearly_budget: 2798.76 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '江苏', yearly_budget: 5085.93 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '同业', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '工程', customer: '一包', yearly_budget: 8281.13 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '工程', customer: '二包', yearly_budget: 444.83 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '工程', customer: '域内合作', yearly_budget: 702.04 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '工程', customer: '域外合作', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bid_fulfillment_status', category: '工程', customer: '其它', yearly_budget: 21.93 },

    // 10. 在产情况
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '上海', yearly_budget: 4726.55 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '国网', yearly_budget: 5036.79 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '江苏', yearly_budget: 1603.09 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '西门子', yearly_budget: 28.46 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '同业', yearly_budget: 749.99 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '用户', yearly_budget: 520.40 },
    { period: '2025', table_key: 'work_in_progress', category: '设备', customer: '其它', yearly_budget: 205.32 },
    { period: '2025', table_key: 'work_in_progress', category: '元件', customer: '用户', yearly_budget: 26.60 },
    { period: '2025', table_key: 'work_in_progress', category: '工程', customer: '一包', yearly_budget: 4388.98 },
    { period: '2025', table_key: 'work_in_progress', category: '工程', customer: '二包', yearly_budget: 421.20 },
    { period: '2025', table_key: 'work_in_progress', category: '工程', customer: '域内合作', yearly_budget: 4062.14 },
    { period: '2025', table_key: 'work_in_progress', category: '工程', customer: '域外合作', yearly_budget: 1603.51 },
    { period: '2025', table_key: 'work_in_progress', category: '工程', customer: '其它', yearly_budget: 2492.58 },

    // 11. 库存情况(合同存量)
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '上海', yearly_budget: 1924.96 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '国网', yearly_budget: 0.00 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '江苏', yearly_budget: 0.00 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '同业', yearly_budget: 71.56 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '用户', yearly_budget: 56.97 },
    { period: '2025', table_key: 'contract_inventory', category: '设备', customer: '其它', yearly_budget: 14.76 },
    { period: '2025', table_key: 'contract_inventory', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'contract_inventory', category: '工程', customer: '一包', yearly_budget: 50.06 },
    { period: '2025', table_key: 'contract_inventory', category: '工程', customer: '二包', yearly_budget: 94.52 },
    { period: '2025', table_key: 'contract_inventory', category: '工程', customer: '域内合作', yearly_budget: 825.80 },
    { period: '2025', table_key: 'contract_inventory', category: '工程', customer: '域外合作', yearly_budget: 11.81 },
    { period: '2025', table_key: 'contract_inventory', category: '工程', customer: '其它', yearly_budget: 1299.29 },

    // 12. 主营业务成本结构与质量
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '上海', yearly_budget: 17398.82 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '国网', yearly_budget: 6890.12 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '江苏', yearly_budget: 3534.29 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '同业', yearly_budget: 2828.35 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '用户', yearly_budget: 4658.44 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '工程', customer: '一包', yearly_budget: 3283.30 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '工程', customer: '二包', yearly_budget: 659.15 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '工程', customer: '域内合作', yearly_budget: 9700.00 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '工程', customer: '域外合作', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_cost_structure', category: '工程', customer: '其它', yearly_budget: 1366.90 },

    // 13. 部门成本中心计入损益情况
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '总经理室', yearly_budget: 736.83 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '企管部', yearly_budget: 501.30 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '财务部', yearly_budget: 0.00 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '销售部', yearly_budget: 1614.28 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '市场部', yearly_budget: 0.00 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '营运部', yearly_budget: 906.40 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '研技部', yearly_budget: 1069.78 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: 'C-GIS事业部', yearly_budget: 1894.69 },
    { period: '2025', table_key: 'department_cost_center_profit_loss', category: '部门成本中心', customer: '工程事业部', yearly_budget: 1620.43 },

    // 14. 主营业务边际贡献率结构与质量
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '上海', yearly_budget: 28.22 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '国网', yearly_budget: 20.19 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '江苏', yearly_budget: 8.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '同业', yearly_budget: 25.92 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '工程', customer: '一包', yearly_budget: 26.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '工程', customer: '二包', yearly_budget: 15.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '工程', customer: '域内合作', yearly_budget: 8.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '工程', customer: '域外合作', yearly_budget: 6.00 },
    { period: '2025', table_key: 'main_business_contribution_rate_structure', category: '工程', customer: '其它', yearly_budget: 15.00 },

    // 15. 成本暂估入库和计提情况
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '上海', yearly_budget: 586.50 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '国网', yearly_budget: 0.00 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '江苏', yearly_budget: 0.00 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '西门子', yearly_budget: 62.13 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '同业', yearly_budget: 0.00 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '用户', yearly_budget: 199.74 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '工程', customer: '一包', yearly_budget: 3644.44 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '工程', customer: '二包', yearly_budget: 2341.80 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '工程', customer: '域内合作', yearly_budget: 1023.15 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '工程', customer: '域外合作', yearly_budget: 487.10 },
    { period: '2025', table_key: 'cost_estimate_personnel_withdrawals', category: '工程', customer: '其它', yearly_budget: 788.07 },

    // 16. 主营业务毛利率结构与质量
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '上海', yearly_budget: 21.99 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '国网', yearly_budget: 13.83 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '江苏', yearly_budget: 8.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '同业', yearly_budget: 22.43 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '用户', yearly_budget: 11.68 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '元件', customer: '用户', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '工程', customer: '一包', yearly_budget: 26.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '工程', customer: '二包', yearly_budget: 15.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '工程', customer: '域内合作', yearly_budget: 8.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '工程', customer: '域外合作', yearly_budget: 6.00 },
    { period: '2025', table_key: 'main_business_gross_profit_rate_structure', category: '工程', customer: '其它', yearly_budget: 15.00 },

    // 17. 净利润结构与质量
    { period: '2025', table_key: 'net_profit_structure_quality', category: '净利润', customer: '主营业务', yearly_budget: 3871.58 },
    { period: '2025', table_key: 'net_profit_structure_quality', category: '净利润', customer: '非主营业务', yearly_budget: 128.42 },

    // 18. 主营业务净利润贡献情况
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '上海', yearly_budget: 2145.03 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '国网', yearly_budget: 621.55 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '江苏', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '输配电内配', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '同业', yearly_budget: 553.08 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '用户', yearly_budget: 323.80 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '元件', customer: '用户', yearly_budget: -26.21 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '工程', customer: '一包', yearly_budget: 328.91 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '工程', customer: '二包', yearly_budget: 14.40 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '工程', customer: '域内合作', yearly_budget: -35.24 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '工程', customer: '域外合作', yearly_budget: 0.00 },
    { period: '2025', table_key: 'main_business_net_profit_contribution', category: '工程', customer: '其它', yearly_budget: 69.60 },

    // 19. 非主营业务净利润贡献情况
    { period: '2025', table_key: 'non_main_business_net_profit_contribution', category: '非主营业务', customer: '固废收入', yearly_budget: 12.83 },
    { period: '2025', table_key: 'non_main_business_net_profit_contribution', category: '非主营业务', customer: '房屋租金', yearly_budget: 25.58 },
    { period: '2025', table_key: 'non_main_business_net_profit_contribution', category: '非主营业务', customer: '利息收入', yearly_budget: 25.58 },
    { period: '2025', table_key: 'non_main_business_net_profit_contribution', category: '非主营业务', customer: '投资收益', yearly_budget: 33.25 },
    { period: '2025', table_key: 'non_main_business_net_profit_contribution', category: '非主营业务', customer: '补贴收入', yearly_budget: 33.25 },
    { period: '2025', table_key: 'non_main_business_net_profit_contribution', category: '非主营业务', customer: '其他', yearly_budget: 10.23 },

    // 20. 收款结构与质量
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '上海', yearly_budget: 25000.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '国网', yearly_budget: 5000.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '江苏', yearly_budget: 3500.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '输配电内配', yearly_budget: 3000.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '西门子', yearly_budget: 3500.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '同业', yearly_budget: 3500.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '用户', yearly_budget: 3500.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '设备', customer: '其它', yearly_budget: 0.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '元件', customer: '用户', yearly_budget: 3000.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '工程', customer: '一包', yearly_budget: 2800.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '工程', customer: '二包', yearly_budget: 1700.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '工程', customer: '域内合作', yearly_budget: 4000.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '工程', customer: '域外合作', yearly_budget: 1000.00 },
    { period: '2025', table_key: 'payment_structure_quality', category: '工程', customer: '其它', yearly_budget: 1500.00 },

    // 21. 应收账款情况
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '上海', yearly_budget: 3558.98 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '国网', yearly_budget: 5190.93 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '江苏', yearly_budget: 1154.56 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '输配电内配', yearly_budget: 176.86 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '同业', yearly_budget: 2028.53 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '用户', yearly_budget: 1727.31 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '设备', customer: '其它', yearly_budget: 303.55 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '元件', customer: '用户', yearly_budget: 458.54 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '工程', customer: '一包', yearly_budget: 385.47 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '工程', customer: '二包', yearly_budget: 189.12 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '工程', customer: '域内合作', yearly_budget: 2772.83 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '工程', customer: '域外合作', yearly_budget: 752.14 },
    { period: '2025', table_key: 'accounts_receivable_situation', category: '工程', customer: '其它', yearly_budget: 488.67 },

    // 22. 逾期应收账款情况
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '上海', yearly_budget: 1349.60 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '国网', yearly_budget: 462.01 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '江苏', yearly_budget: 1123.94 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '输配电内配', yearly_budget: 176.86 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '同业', yearly_budget: 46.23 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '用户', yearly_budget: 1705.24 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '设备', customer: '其它', yearly_budget: 391.31 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '元件', customer: '用户', yearly_budget: 380.94 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '工程', customer: '一包', yearly_budget: 106.86 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '工程', customer: '二包', yearly_budget: 189.12 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '工程', customer: '域内合作', yearly_budget: 358.51 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '工程', customer: '域外合作', yearly_budget: 564.23 },
    { period: '2025', table_key: 'overdue_accounts_receivable_situation', category: '工程', customer: '其它', yearly_budget: 324.30 },

    // 23. 坏账准备情况
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '上海', yearly_budget: 235.75 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '国网', yearly_budget: 76.77 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '江苏', yearly_budget: 79.63 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '输配电内配', yearly_budget: 163.42 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '西门子', yearly_budget: 0.00 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '同业', yearly_budget: 10.33 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '用户', yearly_budget: 1490.63 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '设备', customer: '其它', yearly_budget: 381.37 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '元件', customer: '用户', yearly_budget: 14.76 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '工程', customer: '一包', yearly_budget: 13.94 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '工程', customer: '二包', yearly_budget: 66.50 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '工程', customer: '域内合作', yearly_budget: 71.29 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '工程', customer: '域外合作', yearly_budget: 76.52 },
    { period: '2025', table_key: 'bad_debt_provision_situation', category: '工程', customer: '其它', yearly_budget: 16.89 }
];

async function importCompleteBudgetData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('数据库连接成功');

        // 清空现有数据
        await connection.execute('DELETE FROM budget_planning WHERE period = ?', ['2025']);
        console.log('清空现有预算数据');

        // 批量插入数据
        const insertQuery = `
            INSERT INTO budget_planning (period, table_key, category, customer, yearly_budget) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE yearly_budget = VALUES(yearly_budget)
        `;

        for (const item of completeBudgetData) {
            await connection.execute(insertQuery, [
                item.period,
                item.table_key,
                item.category,
                item.customer,
                item.yearly_budget
            ]);
        }

        console.log(`成功导入 ${completeBudgetData.length} 条预算数据`);
        
        // 统计各表格的数据量
        const tableStats = {};
        completeBudgetData.forEach(item => {
            if (!tableStats[item.table_key]) {
                tableStats[item.table_key] = 0;
            }
            tableStats[item.table_key]++;
        });
        
        console.log('\n各表格预算数据统计：');
        Object.entries(tableStats).forEach(([tableKey, count]) => {
            console.log(`  ${tableKey}: ${count} 条`);
        });

    } catch (error) {
        console.error('导入预算数据失败:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 执行导入
importCompleteBudgetData();