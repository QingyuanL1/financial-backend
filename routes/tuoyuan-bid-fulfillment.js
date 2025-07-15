const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源中标未履约情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT segment_attribute, customer_attribute, initial_balance, 
                   current_period_value, current_balance, volatility_rate
            FROM tuoyuan_bid_fulfillment 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { segmentAttribute: '设备', customerAttribute: '电业项目', initialBalance: 4200.00, currentPeriodValue: 0, currentBalance: 4200.00, volatilityRate: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', initialBalance: 0.00, currentPeriodValue: 0, currentBalance: 0.00, volatilityRate: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', initialBalance: 0.00, currentPeriodValue: 0, currentBalance: 0.00, volatilityRate: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', initialBalance: 2800.00, currentPeriodValue: 0, currentBalance: 2800.00, volatilityRate: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理工程', initialBalance: 0.00, currentPeriodValue: 0, currentBalance: 0.00, volatilityRate: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设计', initialBalance: 200.00, currentPeriodValue: 0, currentBalance: 200.00, volatilityRate: 0 }
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
            initialBalance: parseFloat(row.initial_balance) || 0,
            currentPeriodValue: parseFloat(row.current_period_value) || 0,
            currentBalance: parseFloat(row.current_balance) || 0,
            volatilityRate: parseFloat(row.volatility_rate) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取拓源中标未履约情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存拓源中标未履约情况数据
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
            await connection.execute('DELETE FROM tuoyuan_bid_fulfillment WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO tuoyuan_bid_fulfillment 
                    (period, segment_attribute, customer_attribute, initial_balance, 
                     current_period_value, current_balance, volatility_rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.initialBalance || 0,
                    item.currentPeriodValue || 0,
                    item.currentBalance || 0,
                    item.volatilityRate || 0
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
        console.error('保存拓源中标未履约情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;