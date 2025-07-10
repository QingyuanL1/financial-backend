const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取主营业务成本结构与质量数据
router.get('/:period', createBudgetMiddleware('main_business_cost_structure'), async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer_type, yearly_plan, current_total, revenue_ratio 
            FROM main_business_cost 
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
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        // 按类别分组数据
        const data = {
            equipment: rows.filter(row => row.category === '设备').map(row => ({
                customerType: row.customer_type,
                yearlyPlan: row.yearly_plan,
                currentTotal: parseFloat(row.current_total),
                revenueRatio: row.revenue_ratio
            })),
            component: rows.filter(row => row.category === '元件').map(row => ({
                customerType: row.customer_type,
                yearlyPlan: row.yearly_plan,
                currentTotal: parseFloat(row.current_total),
                revenueRatio: row.revenue_ratio
            })),
            project: rows.filter(row => row.category === '工程').map(row => ({
                customerType: row.customer_type,
                yearlyPlan: row.yearly_plan,
                currentTotal: parseFloat(row.current_total),
                revenueRatio: row.revenue_ratio
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存主营业务成本结构与质量数据
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
        await pool.execute('DELETE FROM main_business_cost WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.currentTotal || 0,
                    item.revenueRatio || ''
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
                    item.yearlyPlan || '',
                    item.currentTotal || 0,
                    item.revenueRatio || ''
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
                    item.yearlyPlan || '',
                    item.currentTotal || 0,
                    item.revenueRatio || ''
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO main_business_cost (period, category, customer_type, yearly_plan, current_total, revenue_ratio) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '主营业务成本结构与质量数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新主营业务成本结构与质量数据
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
        await pool.execute('DELETE FROM main_business_cost WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.currentTotal || 0,
                    item.revenueRatio || ''
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
                    item.yearlyPlan || '',
                    item.currentTotal || 0,
                    item.revenueRatio || ''
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
                    item.yearlyPlan || '',
                    item.currentTotal || 0,
                    item.revenueRatio || ''
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO main_business_cost (period, category, customer_type, yearly_plan, current_total, revenue_ratio) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '主营业务成本结构与质量数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除主营业务成本结构与质量数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM main_business_cost WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '主营业务成本结构与质量数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;