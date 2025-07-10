const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取成本暂估入库和计提情况数据
router.get('/:period', createBudgetMiddleware('cost_estimate_personnel_withdrawals'), async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer_type, initial_balance, new_addition, year_total, provision_rate 
            FROM cost_estimation 
            WHERE period = ? 
            ORDER BY 
                CASE category 
                    WHEN '设备' THEN 1 
                    WHEN '元件' THEN 2 
                    WHEN '工程' THEN 3 
                END,
                id
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
        if (rows.length === 0) {
            // 没有数据时，返回空的数据结构，让中间件填充预算数据
            const data = {
                equipment: [
                    { customerType: '上海', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '国网', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '江苏', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '输配电内配', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '西门子', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '同业', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '用户', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '其它', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 }
                ],
                component: [
                    { customerType: '用户', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 }
                ],
                project: [
                    { customerType: '一包', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '二包', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '域内合作', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '域外合作', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 },
                    { customerType: '其它', initialBalance: 0, newAddition: 0, yearTotal: 0, provisionRate: 0 }
                ]
            };
            
            return res.json({
                success: true,
                data: data,
                period: period
            });
        }
        
        // 按类别分组数据
        const data = {
            equipment: rows.filter(row => row.category === '设备').map(row => ({
                customerType: row.customer_type,
                initialBalance: row.initial_balance,
                newAddition: row.new_addition,
                yearTotal: row.year_total,
                provisionRate: row.provision_rate
            })),
            component: rows.filter(row => row.category === '元件').map(row => ({
                customerType: row.customer_type,
                initialBalance: row.initial_balance,
                newAddition: row.new_addition,
                yearTotal: row.year_total,
                provisionRate: row.provision_rate
            })),
            project: rows.filter(row => row.category === '工程').map(row => ({
                customerType: row.customer_type,
                initialBalance: row.initial_balance,
                newAddition: row.new_addition,
                yearTotal: row.year_total,
                provisionRate: row.provision_rate
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取成本暂估入库和计提情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存成本暂估入库和计提情况数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM cost_estimation WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.initialBalance || '',
                    item.newAddition || '',
                    item.yearTotal || '',
                    item.provisionRate || ''
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.initialBalance || '',
                    item.newAddition || '',
                    item.yearTotal || '',
                    item.provisionRate || ''
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.initialBalance || '',
                    item.newAddition || '',
                    item.yearTotal || '',
                    item.provisionRate || ''
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO cost_estimation (period, category, customer_type, initial_balance, new_addition, year_total, provision_rate) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '成本暂估入库和计提情况数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存成本暂估入库和计提情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新成本暂估入库和计提情况数据
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
        await pool.execute('DELETE FROM cost_estimation WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.initialBalance || '',
                    item.newAddition || '',
                    item.yearTotal || '',
                    item.provisionRate || ''
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.initialBalance || '',
                    item.newAddition || '',
                    item.yearTotal || '',
                    item.provisionRate || ''
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.initialBalance || '',
                    item.newAddition || '',
                    item.yearTotal || '',
                    item.provisionRate || ''
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO cost_estimation (period, category, customer_type, initial_balance, new_addition, year_total, provision_rate) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '成本暂估入库和计提情况数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新成本暂估入库和计提情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除成本暂估入库和计提情况数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM cost_estimation WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '成本暂估入库和计提情况数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除成本暂估入库和计提情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;