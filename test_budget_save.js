const { pool } = require('./config/database');

// 测试预算数据保存
async function testBudgetSave() {
    try {
        // 模拟前端发送的数据格式
        const testData = {
            period: '2025',
            data: {
                selectedTable: 'new_orders',
                modifications: {
                    'new_orders': [
                        {
                            name: '设备',
                            items: [
                                { id: 1, projectName: '上海项目', yearlyBudget: 30000.00 },
                                { id: 2, projectName: '国网项目', yearlyBudget: 8000.00 }
                            ]
                        },
                        {
                            name: '元件',
                            items: [
                                { id: 9, projectName: '用户项目', yearlyBudget: 4000.00 }
                            ]
                        }
                    ]
                }
            }
        };
        
        console.log('测试数据:', JSON.stringify(testData, null, 2));
        
        const { period, data } = testData;
        
        if (!period || !data) {
            console.error('缺少必要参数');
            return;
        }
        
        // 删除该期间的现有数据
        console.log('删除现有数据...');
        await pool.execute('DELETE FROM budget_planning WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理所有表格的修改数据
        if (data.modifications) {
            Object.keys(data.modifications).forEach(tableKey => {
                console.log(`处理表格: ${tableKey}`);
                const tableData = data.modifications[tableKey];
                tableData.forEach(categoryData => {
                    console.log(`  处理类别: ${categoryData.name}`);
                    categoryData.items.forEach(item => {
                        console.log(`    项目: ${item.projectName}, 预算: ${item.yearlyBudget}`);
                        insertData.push([
                            period,
                            tableKey,
                            categoryData.name,
                            item.projectName,
                            item.yearlyBudget || 0
                        ]);
                    });
                });
            });
        }
        
        console.log('准备插入的数据:', insertData);
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO budget_planning (period, table_key, category, customer, yearly_budget) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            
            console.log('执行插入查询...');
            console.log('查询语句:', insertQuery);
            console.log('参数:', flattenedData);
            
            await pool.execute(insertQuery, flattenedData);
        }
        
        console.log('保存成功!');
        
        // 验证数据是否保存成功
        const [rows] = await pool.execute('SELECT * FROM budget_planning WHERE period = ?', [period]);
        console.log('保存的数据:', rows);
        
    } catch (error) {
        console.error('测试失败:', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
    } finally {
        process.exit(0);
    }
}

testBudgetSave();