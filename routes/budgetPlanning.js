const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取年度预算计划数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT table_key, category, customer, yearly_budget 
            FROM budget_planning 
            WHERE period = ? 
            ORDER BY table_key, 
                CASE category 
                    WHEN '设备' THEN 1 
                    WHEN '元件' THEN 2 
                    WHEN '工程' THEN 3 
                    WHEN '净利润' THEN 4
                    WHEN '非主营业务' THEN 5
                    WHEN '部门成本中心' THEN 6
                END,
                id
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        // 将数据按表格类型分组
        const groupedData = {};
        rows.forEach(row => {
            if (!groupedData[row.table_key]) {
                groupedData[row.table_key] = {};
            }
            if (!groupedData[row.table_key][row.category]) {
                groupedData[row.table_key][row.category] = [];
            }
            groupedData[row.table_key][row.category].push({
                customer: row.customer,
                yearlyBudget: parseFloat(row.yearly_budget)
            });
        });
        
        res.json({
            success: true,
            data: {
                selectedTable: null, // 前端会根据需要设置
                modifications: groupedData
            },
            period: period
        });
    } catch (error) {
        console.error('获取年度预算计划数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存年度预算计划数据
router.post('/', async (req, res) => {
    try {
        console.log('=== 预算保存接口调用 ===');
        console.log('请求体:', JSON.stringify(req.body, null, 2));
        
        const { period, data } = req.body;
        
        console.log('period:', period);
        console.log('data:', data);
        
        if (!period || !data) {
            console.log('缺少必要参数 - period:', period, 'data:', data);
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 删除该期间的现有数据
        console.log('删除现有数据...');
        await pool.execute('DELETE FROM budget_planning WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理所有表格的修改数据
        if (data.modifications) {
            console.log('处理modifications:', Object.keys(data.modifications));
            Object.keys(data.modifications).forEach(tableKey => {
                console.log(`处理表格: ${tableKey}`);
                const tableData = data.modifications[tableKey];
                console.log(`表格数据:`, tableData);
                tableData.forEach(categoryData => {
                    console.log(`  类别: ${categoryData.name}, 项目数: ${categoryData.items.length}`);
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
        } else {
            console.log('没有找到modifications数据');
        }
        
        console.log('准备插入数据:', insertData.length, '条');
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO budget_planning (period, table_key, category, customer, yearly_budget) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            console.log('执行插入操作...');
            await pool.execute(insertQuery, flattenedData);
            console.log('插入完成');
        }
        
        res.json({
            success: true,
            message: '年度预算计划数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存年度预算计划数据失败:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误',
            error: error.message
        });
    }
});

// 更新年度预算计划数据
router.put('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少数据参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM budget_planning WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理所有表格的修改数据
        if (data.modifications) {
            Object.keys(data.modifications).forEach(tableKey => {
                const tableData = data.modifications[tableKey];
                tableData.forEach(categoryData => {
                    categoryData.items.forEach(item => {
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
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO budget_planning (period, table_key, category, customer, yearly_budget) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '年度预算计划数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新年度预算计划数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除年度预算计划数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM budget_planning WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '年度预算计划数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除年度预算计划数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;