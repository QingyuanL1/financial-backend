const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取净利润结构数据
router.get('/:period', createBudgetMiddleware('net_profit_structure_quality'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM net_profit_structure WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        if (rows.length === 0) {
            // 没有数据时，获取预算数据并返回默认结构
            try {
                const year = period.split('-')[0];
                console.log(`正在查询预算数据: table_key=net_profit_structure_quality, period=${year}`);
                
                const [budgetRows] = await pool.execute(
                    'SELECT category, customer, yearly_budget FROM budget_planning WHERE table_key = ? AND period = ?',
                    ['net_profit_structure_quality', year]
                );
                
                console.log('预算数据查询结果:', budgetRows);
                
                let mainBusinessPlan = '0';
                let nonMainBusinessPlan = '0';
                
                budgetRows.forEach(row => {
                    console.log(`处理预算行: customer=${row.customer}, yearly_budget=${row.yearly_budget}`);
                    if (row.customer === '主营业务') {
                        mainBusinessPlan = row.yearly_budget.toString();
                    } else if (row.customer === '非主营业务') {
                        nonMainBusinessPlan = row.yearly_budget.toString();
                    }
                });
                
                // 计算总计划
                const totalPlan = (parseFloat(mainBusinessPlan) + parseFloat(nonMainBusinessPlan)).toFixed(2);
                
                const budgetData = {
                    mainBusiness: { plan: mainBusinessPlan, actual: '0', progress: '0.00%' },
                    nonMainBusiness: { plan: nonMainBusinessPlan, actual: '0', progress: '0.00%' },
                    total: { plan: totalPlan, actual: '0', progress: '0.00%' }
                };
                
                console.log('最终预算数据:', budgetData);
                
                return res.json({
                    success: true,
                    data: budgetData,
                    period: period,
                    isDefault: true
                });
            } catch (budgetError) {
                console.error('获取预算数据失败:', budgetError);
                // 即使预算数据查询失败，也返回默认结构而不是404
                const defaultBudgetData = {
                    mainBusiness: { plan: '0', actual: '0', progress: '0.00%' },
                    nonMainBusiness: { plan: '0', actual: '0', progress: '0.00%' },
                    total: { plan: '0', actual: '0', progress: '0.00%' }
                };
                
                return res.json({
                    success: true,
                    data: defaultBudgetData,
                    period: period,
                    isDefault: true
                });
            }
        }
        
        // 有数据时，也需要确保预算数据被包含
        let responseData = rows[0].data;
        
        // 如果是字符串，先解析
        if (typeof responseData === 'string') {
            try {
                responseData = JSON.parse(responseData);
            } catch (e) {
                console.error('JSON解析失败:', e);
            }
        }
        
        // 确保预算数据存在，如果不存在则从数据库获取
        if (!responseData.mainBusiness?.plan || responseData.mainBusiness.plan === '0') {
            try {
                const year = period.split('-')[0];
                const [budgetRows] = await pool.execute(
                    'SELECT category, customer, yearly_budget FROM budget_planning WHERE table_key = ? AND period = ?',
                    ['net_profit_structure_quality', year]
                );
                
                budgetRows.forEach(row => {
                    if (row.customer === '主营业务' && responseData.mainBusiness) {
                        responseData.mainBusiness.plan = row.yearly_budget.toString();
                    } else if (row.customer === '非主营业务' && responseData.nonMainBusiness) {
                        responseData.nonMainBusiness.plan = row.yearly_budget.toString();
                    }
                });
            } catch (budgetError) {
                console.error('获取预算数据失败:', budgetError);
            }
        }
        
        res.json({
            success: true,
            data: responseData,
            period: rows[0].period,
            updated_at: rows[0].updated_at
        });
        
    } catch (error) {
        console.error('获取数据失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 保存净利润结构数据
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
            'SELECT id FROM net_profit_structure WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE net_profit_structure SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO net_profit_structure (period, data) VALUES (?, ?)',
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
            'DELETE FROM net_profit_structure WHERE period = ?',
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
            'SELECT period, created_at, updated_at FROM net_profit_structure ORDER BY period DESC'
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