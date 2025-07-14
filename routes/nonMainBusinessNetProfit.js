const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取非主营业务净利润贡献情况数据
router.get('/:period', createBudgetMiddleware('non_main_business_net_profit_contribution'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM non_main_business_net_profit WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        if (rows.length === 0) {
            // 当没有数据时，返回预算数据
            try {
                const year = period.split('-')[0];
                console.log(`正在查询非主营业务净利润预算数据: period=${year}`);
                
                const [budgetRows] = await pool.execute(
                    'SELECT category, customer, yearly_budget FROM budget_planning WHERE table_key = ? AND period = ?',
                    ['non_main_business_net_profit_contribution', year]
                );
                
                console.log('预算数据查询结果:', budgetRows);
                
                // 构建预算数据结构
                const budgetData = [
                    { id: 1, name: '固废收入', yearlyPlan: 0, actual: 0, progress: '0.00%' },
                    { id: 2, name: '房屋租金', yearlyPlan: 0, actual: 0, progress: '0.00%' },
                    { id: 3, name: '利息收入', yearlyPlan: 0, actual: 0, progress: '0.00%' },
                    { id: 4, name: '投资收益', yearlyPlan: 0, actual: 0, progress: '0.00%' },
                    { id: 5, name: '补贴收入', yearlyPlan: 0, actual: 0, progress: '0.00%' },
                    { id: 6, name: '其他', yearlyPlan: 0, actual: 0, progress: '0.00%' }
                ];
                
                // 填充预算数据
                budgetRows.forEach(row => {
                    const item = budgetData.find(item => item.name === row.customer);
                    if (item) {
                        item.yearlyPlan = parseFloat(row.yearly_budget);
                    }
                });
                
                return res.json({
                    success: true,
                    data: budgetData,
                    period: period,
                    isDefault: true
                });
            } catch (budgetError) {
                console.error('获取预算数据失败:', budgetError);
                return res.status(404).json({ error: '未找到指定期间的数据' });
            }
        }
        
        res.json({
            success: true,
            data: rows[0].data,
            period: rows[0].period,
            updated_at: rows[0].updated_at
        });
        
    } catch (error) {
        console.error('获取数据失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 保存非主营业务净利润贡献情况数据
router.post('/', async (req, res) => {
    const { period, data } = req.body;
    
    // 验证必填字段
    if (!period || !data) {
        return res.status(400).json({ error: '期间和数据不能为空' });
    }
    
    // 验证period格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        // 检查是否已存在该期间的数据
        const [existingRows] = await pool.execute(
            'SELECT id FROM non_main_business_net_profit WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE non_main_business_net_profit SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO non_main_business_net_profit (period, data) VALUES (?, ?)',
                [period, JSON.stringify(data)]
            );
        }
        
        res.json({
            success: true,
            message: '数据保存成功',
            period
        });
        
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

// 删除指定期间的数据
router.delete('/:period', async (req, res) => {
    const { period } = req.params;
    
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [result] = await pool.execute(
            'DELETE FROM non_main_business_net_profit WHERE period = ?',
            [period]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '未找到指定期间的数据' });
        }
        
        res.json({
            success: true,
            message: '数据删除成功'
        });
        
    } catch (error) {
        console.error('删除数据失败:', error);
        res.status(500).json({ error: '删除数据失败' });
    }
});

// 获取所有期间列表
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT period, created_at, updated_at FROM non_main_business_net_profit ORDER BY period DESC'
        );
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('获取期间列表失败:', error);
        res.status(500).json({ error: '获取期间列表失败' });
    }
});

module.exports = router;