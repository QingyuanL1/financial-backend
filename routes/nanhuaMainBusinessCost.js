const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华主营业务成本结构与质量数据
router.get('/:period', createBudgetMiddleware('nanhua_main_business_cost_structure'), async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT customer_name, yearly_plan, current_period, accumulated, revenue_ratio 
            FROM nanhua_main_business_cost 
            WHERE period = ? 
            ORDER BY id
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        // 格式化数据
        const data = {
            customers: rows.map(row => ({
                customerName: row.customer_name,
                yearlyPlan: parseFloat(row.yearly_plan),
                current: parseFloat(row.current_period),
                accumulated: 0, // 累计数据由前端计算
                revenueRatio: parseFloat(row.revenue_ratio)
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取南华主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存南华主营业务成本结构与质量数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data || !data.customers) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM nanhua_main_business_cost WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理客户数据
        data.customers.forEach(item => {
            insertData.push([
                period,
                item.customerName,
                item.yearlyPlan || 0,
                item.current || 0,
                0, // 不再保存累计数据
                item.revenueRatio || 0
            ]);
        });
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO nanhua_main_business_cost (period, customer_name, yearly_plan, current_period, accumulated, revenue_ratio) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '南华主营业务成本结构与质量数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存南华主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新南华主营业务成本结构与质量数据
router.put('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const { data } = req.body;
        
        if (!data || !data.customers) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少数据参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM nanhua_main_business_cost WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理客户数据
        data.customers.forEach(item => {
            insertData.push([
                period,
                item.customerName,
                item.yearlyPlan || 0,
                item.current || 0,
                0, // 不再保存累计数据
                item.revenueRatio || 0
            ]);
        });
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO nanhua_main_business_cost (period, customer_name, yearly_plan, current_period, accumulated, revenue_ratio) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '南华主营业务成本结构与质量数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新南华主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除南华主营业务成本结构与质量数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM nanhua_main_business_cost WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '南华主营业务成本结构与质量数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除南华主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;
