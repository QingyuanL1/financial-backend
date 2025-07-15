const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源主营业务收入分解情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT segment_attribute, customer_attribute, annual_plan, 
                   current_period, current_cumulative, execution_progress
            FROM tuoyuan_main_business_income_breakdown 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { segmentAttribute: '设备', customerAttribute: '电业项目', annualPlan: 6017.70, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', annualPlan: 0.00, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', annualPlan: 707.96, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', annualPlan: 2654.87, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理工程', annualPlan: 0.00, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设计', annualPlan: 73.58, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 }
            ]
        };

        if (rows.length === 0) {
            // 如果没有数据，返回默认数据
            return res.json({
                success: true,
                data: defaultData
            });
        }

        // 处理数据库数据
        const items = rows.map(row => ({
            segmentAttribute: row.segment_attribute,
            customerAttribute: row.customer_attribute,
            annualPlan: parseFloat(row.annual_plan) || 0,
            currentPeriod: parseFloat(row.current_period) || 0,
            currentCumulative: parseFloat(row.current_cumulative) || 0,
            executionProgress: parseFloat(row.execution_progress) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取拓源主营业务收入分解情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存拓源主营业务收入分解情况数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data || !data.items) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的期间和数据'
            });
        }

        // 开始事务
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 删除现有数据
            await connection.execute('DELETE FROM tuoyuan_main_business_income_breakdown WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO tuoyuan_main_business_income_breakdown 
                    (period, segment_attribute, customer_attribute, annual_plan, 
                     current_period, current_cumulative, execution_progress)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.annualPlan || 0,
                    item.currentPeriod || 0,
                    item.currentCumulative || 0,
                    item.executionProgress || 0
                ]);
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: '数据保存成功'
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('保存拓源主营业务收入分解情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;