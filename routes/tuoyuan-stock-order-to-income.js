const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源存量订单转收入数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT segment_attribute, customer_attribute, initial_stock_order_balance, 
                   current_period_income, current_income_cumulative, stock_order_income_ratio
            FROM tuoyuan_stock_order_to_income 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { segmentAttribute: '设备', customerAttribute: '电业项目', initialStockOrderBalance: 1104.53, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', initialStockOrderBalance: 374.66, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', initialStockOrderBalance: 861.89, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理工程', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设计', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 }
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
            initialStockOrderBalance: parseFloat(row.initial_stock_order_balance) || 0,
            currentPeriodIncome: parseFloat(row.current_period_income) || 0,
            currentIncomeCumulative: parseFloat(row.current_income_cumulative) || 0,
            stockOrderIncomeRatio: parseFloat(row.stock_order_income_ratio) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取拓源存量订单转收入数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存拓源存量订单转收入数据
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
            await connection.execute('DELETE FROM tuoyuan_stock_order_to_income WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO tuoyuan_stock_order_to_income 
                    (period, segment_attribute, customer_attribute, initial_stock_order_balance, 
                     current_period_income, current_income_cumulative, stock_order_income_ratio)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.initialStockOrderBalance || 0,
                    item.currentPeriodIncome || 0,
                    item.currentIncomeCumulative || 0,
                    item.stockOrderIncomeRatio || 0
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
        console.error('保存拓源存量订单转收入数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;