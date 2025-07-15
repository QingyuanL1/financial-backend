const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取收款结构与质量数据
router.get('/:period', createBudgetMiddleware('收款结构与质量'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ 
                success: false, 
                message: '期间格式错误，应为YYYY-MM' 
            });
        }

        const query = `
            SELECT 
                segment_attribute,
                customer_attribute,
                yearly_plan,
                missing_data,
                current_accumulated,
                execution_progress
            FROM tuoyuan_payment_structure_quality 
            WHERE period = ?
            ORDER BY 
                CASE segment_attribute
                    WHEN '设备' THEN 1
                    ELSE 2
                END,
                CASE customer_attribute
                    WHEN '电业项目' THEN 1
                    WHEN '用户项目' THEN 2
                    WHEN '贸易' THEN 3
                    WHEN '代理设备' THEN 4
                    WHEN '代理工程' THEN 5
                    WHEN '代理设计' THEN 6
                    ELSE 7
                END
        `;

        const [rows] = await pool.execute(query, [period]);
        
        let items = [];
        
        if (rows.length === 0) {
            // 如果没有数据，返回默认结构
            items = [
                { segmentAttribute: '设备', customerAttribute: '电业项目', yearlyPlan: 0, missingData: 0, currentAccumulated: 476.92, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlan: 0, missingData: 0, currentAccumulated: 458.11, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理工程', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设计', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 }
            ];
        } else {
            items = rows.map(row => ({
                segmentAttribute: row.segment_attribute,
                customerAttribute: row.customer_attribute,
                yearlyPlan: Number(row.yearly_plan),
                missingData: Number(row.missing_data),
                currentAccumulated: Number(row.current_accumulated),
                executionProgress: Number(row.execution_progress)
            }));
        }

        res.json({
            success: true,
            data: { items },
            period: period
        });

    } catch (error) {
        console.error('获取收款结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败' 
        });
    }
});

// 保存收款结构与质量数据
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { period, data } = req.body;
        
        // 验证请求数据
        if (!period || !data || !Array.isArray(data.items)) {
            return res.status(400).json({ 
                success: false, 
                message: '请求数据格式错误' 
            });
        }

        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ 
                success: false, 
                message: '期间格式错误，应为YYYY-MM' 
            });
        }

        await connection.beginTransaction();

        // 删除该期间的旧数据
        await connection.execute(
            'DELETE FROM tuoyuan_payment_structure_quality WHERE period = ?',
            [period]
        );

        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_payment_structure_quality (
                period, 
                segment_attribute, 
                customer_attribute, 
                yearly_plan, 
                missing_data, 
                current_accumulated, 
                execution_progress
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.segmentAttribute,
                item.customerAttribute,
                item.yearlyPlan || 0,
                item.missingData || 0,
                item.currentAccumulated || 0,
                item.executionProgress || 0
            ]);
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: '收款结构与质量数据保存成功',
            period: period
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('保存收款结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '保存数据失败' 
        });
    }
});

// 更新收款结构与质量数据
router.put('/:period', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { period } = req.params;
        const { data } = req.body;
        
        // 验证请求数据
        if (!data || !Array.isArray(data.items)) {
            return res.status(400).json({ 
                success: false, 
                message: '请求数据格式错误' 
            });
        }

        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ 
                success: false, 
                message: '期间格式错误，应为YYYY-MM' 
            });
        }

        await connection.beginTransaction();

        // 删除该期间的旧数据
        await connection.execute(
            'DELETE FROM tuoyuan_payment_structure_quality WHERE period = ?',
            [period]
        );

        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_payment_structure_quality (
                period, 
                segment_attribute, 
                customer_attribute, 
                yearly_plan, 
                missing_data, 
                current_accumulated, 
                execution_progress
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.segmentAttribute,
                item.customerAttribute,
                item.yearlyPlan || 0,
                item.missingData || 0,
                item.currentAccumulated || 0,
                item.executionProgress || 0
            ]);
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: '收款结构与质量数据更新成功',
            period: period
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('更新收款结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '更新数据失败' 
        });
    }
});

// 删除收款结构与质量数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ 
                success: false, 
                message: '期间格式错误，应为YYYY-MM' 
            });
        }

        await pool.execute(
            'DELETE FROM tuoyuan_payment_structure_quality WHERE period = ?',
            [period]
        );

        res.json({
            success: true,
            message: '收款结构与质量数据删除成功',
            period: period
        });

    } catch (error) {
        console.error('删除收款结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '删除数据失败' 
        });
    }
});

module.exports = router;