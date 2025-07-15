const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取非主营业务情况数据（含累计计算）
router.get('/:period', createBudgetMiddleware('non_main_business'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        // 获取当前期间的数据
        const [currentRows] = await pool.execute(
            'SELECT * FROM non_main_business WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        // 解析当前期间数据
        let currentData = [];
        if (currentRows.length > 0) {
            try {
                currentData = typeof currentRows[0].data === 'string' ? JSON.parse(currentRows[0].data) : currentRows[0].data;
            } catch (e) {
                console.error('JSON解析失败:', e);
                currentData = currentRows[0].data;
            }
        }
        
        // 计算累计值：获取从年初到当前期间的所有数据
        const [year] = period.split('-');
        const [cumulativeRows] = await pool.execute(
            'SELECT period, data FROM non_main_business WHERE period >= ? AND period <= ? ORDER BY period',
            [`${year}-01`, period]
        );
        
        // 计算累计值
        const cumulativeData = {};
        cumulativeRows.forEach(row => {
            try {
                const periodData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                if (Array.isArray(periodData)) {
                    periodData.forEach(item => {
                        const key = `${item.category}-${item.id}`;
                        if (!cumulativeData[key]) {
                            cumulativeData[key] = {
                                id: item.id,
                                category: item.category,
                                yearlyPlan: item.yearlyPlan || 0,
                                currentPeriod: 0,
                                cumulative: 0
                            };
                        }
                        cumulativeData[key].cumulative += Number(item.currentPeriod || item.currentTotal || 0);
                    });
                }
            } catch (e) {
                console.error('累计计算时JSON解析失败:', e);
            }
        });
        
        // 合并当前期间数据和累计数据
        const finalData = currentData.map(item => {
            const key = `${item.category}-${item.id}`;
            const cumulativeItem = cumulativeData[key];
            
            return {
                id: item.id,
                category: item.category,
                yearlyPlan: item.yearlyPlan || 0,
                currentPeriod: Number(item.currentPeriod || item.currentTotal || 0),
                cumulative: cumulativeItem ? cumulativeItem.cumulative : Number(item.currentPeriod || item.currentTotal || 0)
            };
        });
        
        if (finalData.length === 0) {
            return res.status(404).json({ error: '未找到指定期间的数据' });
        }
        
        res.json({
            success: true,
            data: finalData,
            period: period,
            updated_at: currentRows.length > 0 ? currentRows[0].updated_at : null
        });
        
    } catch (error) {
        console.error('获取数据失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 保存非主营业务情况数据
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
            'SELECT id FROM non_main_business WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE non_main_business SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO non_main_business (period, data) VALUES (?, ?)',
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
            'DELETE FROM non_main_business WHERE period = ?',
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
            'SELECT period, created_at, updated_at FROM non_main_business ORDER BY period DESC'
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