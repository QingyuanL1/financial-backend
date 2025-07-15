const { pool } = require('../config/database');

/**
 * 为2025年初始化业务数据
 * 从预算表读取客户信息，在业务表中创建基础数据（current_total=0）
 */
async function init2025Data() {
    try {
        console.log('开始初始化2025年业务数据...');
        
        // 获取所有预算数据
        const [budgetRows] = await pool.execute(`
            SELECT DISTINCT table_key, category, customer 
            FROM budget_planning 
            WHERE period = '2025' 
            ORDER BY table_key, 
                CASE category 
                    WHEN '设备' THEN 1 
                    WHEN '元件' THEN 2 
                    WHEN '工程' THEN 3 
                    WHEN '营业收入' THEN 4
                    WHEN '非主营业务' THEN 5
                    WHEN '部门成本中心' THEN 6
                    WHEN '净利润' THEN 7
                END
        `);
        
        console.log(`找到 ${budgetRows.length} 项预算数据`);
        
        // 按表格分组
        const tableGroups = {};
        budgetRows.forEach(row => {
            if (!tableGroups[row.table_key]) {
                tableGroups[row.table_key] = [];
            }
            tableGroups[row.table_key].push(row);
        });
        
        // 处理新签订单数据
        if (tableGroups.new_orders) {
            console.log('处理新签订单数据...');
            await pool.execute('DELETE FROM new_orders WHERE period = ?', ['2025-01']);
            
            const insertData = [];
            tableGroups.new_orders.forEach(item => {
                insertData.push([
                    '2025-01',
                    item.category,
                    item.customer,
                    0, // yearly_plan 会由中间件填充
                    0, // current_total
                    0  // progress
                ]);
            });
            
            if (insertData.length > 0) {
                const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
                const insertQuery = `
                    INSERT INTO new_orders (period, category, customer, yearly_plan, current_total, progress) 
                    VALUES ${placeholders}
                `;
                await pool.execute(insertQuery, insertData.flat());
                console.log(`✅ 新签订单: 插入了 ${insertData.length} 条记录`);
            }
        }
        
        // 处理项目跟踪数据
        if (tableGroups.project_tracking) {
            console.log('处理项目跟踪数据...');
            await pool.execute('DELETE FROM project_tracking WHERE period = ?', ['2025-01']);
            
            const insertData = [];
            tableGroups.project_tracking.forEach(item => {
                insertData.push([
                    '2025-01',
                    item.category,
                    item.customer,
                    0, // yearly_plan
                    0, // current_total
                    0  // progress
                ]);
            });
            
            if (insertData.length > 0) {
                const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
                const insertQuery = `
                    INSERT INTO project_tracking (period, category, customer, yearly_plan, current_total, progress) 
                    VALUES ${placeholders}
                `;
                await pool.execute(insertQuery, insertData.flat());
                console.log(`✅ 项目跟踪: 插入了 ${insertData.length} 条记录`);
            }
        }
        
        // 处理营业收入结构数据
        if (tableGroups.business_income_structure) {
            console.log('处理营业收入结构数据...');
            await pool.execute('DELETE FROM business_income_structure WHERE period = ?', ['2025-01']);
            
            const insertData = [];
            tableGroups.business_income_structure.forEach(item => {
                insertData.push([
                    '2025-01',
                    item.customer, // category 字段存客户名
                    0, // yearly_plan
                    0, // current_total
                    0  // progress
                ]);
            });
            
            if (insertData.length > 0) {
                const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
                const insertQuery = `
                    INSERT INTO business_income_structure (period, category, yearly_plan, current_total, progress) 
                    VALUES ${placeholders}
                `;
                await pool.execute(insertQuery, insertData.flat());
                console.log(`✅ 营业收入结构: 插入了 ${insertData.length} 条记录`);
            }
        }
        
        console.log('🎉 2025年业务数据初始化完成！');
        
    } catch (error) {
        console.error('初始化失败:', error);
    } finally {
        process.exit(0);
    }
}

init2025Data();