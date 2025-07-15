const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取净利润结构数据（含累计计算）
router.get('/:period', createBudgetMiddleware('net_profit_structure_quality'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        // 获取当前期间的数据
        const [currentRows] = await pool.execute(
            'SELECT * FROM net_profit_structure WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        // 获取预算数据
        const year = period.split('-')[0];
        const [budgetRows] = await pool.execute(
            'SELECT category, customer, yearly_budget FROM budget_planning WHERE table_key = ? AND period = ?',
            ['net_profit_structure_quality', year]
        );
        
        let mainBusinessPlan = '0';
        let nonMainBusinessPlan = '0';
        
        budgetRows.forEach(row => {
            if (row.customer === '主营业务') {
                mainBusinessPlan = row.yearly_budget.toString();
            } else if (row.customer === '非主营业务') {
                nonMainBusinessPlan = row.yearly_budget.toString();
            }
        });
        
        // 计算累计值：获取从年初到当前期间的所有数据
        const [cumulativeRows] = await pool.execute(
            'SELECT period, data FROM net_profit_structure WHERE period >= ? AND period <= ? ORDER BY period',
            [`${year}-01`, period]
        );
        
        let mainBusinessCumulative = 0;
        let nonMainBusinessCumulative = 0;
        
        cumulativeRows.forEach(row => {
            try {
                const periodData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                if (periodData) {
                    mainBusinessCumulative += parseFloat(periodData.mainBusiness?.current || periodData.mainBusiness?.actual || 0);
                    nonMainBusinessCumulative += parseFloat(periodData.nonMainBusiness?.current || periodData.nonMainBusiness?.actual || 0);
                }
            } catch (e) {
                console.error('累计计算时JSON解析失败:', e);
            }
        });
        
        // 构建响应数据
        let responseData;
        if (currentRows.length === 0) {
            // 没有当前期间数据，返回默认结构
            responseData = {
                mainBusiness: { 
                    plan: mainBusinessPlan, 
                    current: '0', 
                    cumulative: mainBusinessCumulative.toFixed(2),
                    progress: '0.00%' 
                },
                nonMainBusiness: { 
                    plan: nonMainBusinessPlan, 
                    current: '0', 
                    cumulative: nonMainBusinessCumulative.toFixed(2),
                    progress: '0.00%' 
                },
                total: { 
                    plan: (parseFloat(mainBusinessPlan) + parseFloat(nonMainBusinessPlan)).toFixed(2), 
                    current: '0', 
                    cumulative: (mainBusinessCumulative + nonMainBusinessCumulative).toFixed(2),
                    progress: '0.00%' 
                }
            };
        } else {
            // 有当前期间数据，合并当前期间和累计数据
            let currentData = currentRows[0].data;
            if (typeof currentData === 'string') {
                try {
                    currentData = JSON.parse(currentData);
                } catch (e) {
                    console.error('JSON解析失败:', e);
                    currentData = {};
                }
            }
            
            responseData = {
                mainBusiness: {
                    plan: mainBusinessPlan,
                    current: currentData.mainBusiness?.current || currentData.mainBusiness?.actual || '0',
                    cumulative: mainBusinessCumulative.toFixed(2),
                    progress: currentData.mainBusiness?.progress || '0.00%'
                },
                nonMainBusiness: {
                    plan: nonMainBusinessPlan,
                    current: currentData.nonMainBusiness?.current || currentData.nonMainBusiness?.actual || '0',
                    cumulative: nonMainBusinessCumulative.toFixed(2),
                    progress: currentData.nonMainBusiness?.progress || '0.00%'
                },
                total: {
                    plan: (parseFloat(mainBusinessPlan) + parseFloat(nonMainBusinessPlan)).toFixed(2),
                    current: currentData.total?.current || currentData.total?.actual || '0',
                    cumulative: (mainBusinessCumulative + nonMainBusinessCumulative).toFixed(2),
                    progress: currentData.total?.progress || '0.00%'
                }
            };
        }
        
        res.json({
            success: true,
            data: responseData,
            period: period,
            updated_at: currentRows.length > 0 ? currentRows[0].updated_at : null
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