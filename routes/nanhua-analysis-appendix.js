const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取依据分析附表数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT customer_attribute, year_beginning_balance, current_period_new_invoicing, 
                   current_period_accumulated_collection, current_period_receivable_balance
            FROM nanhua_analysis_appendix 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { customerAttribute: '一包项目', yearBeginningBalance: 1.08, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '二包项目', yearBeginningBalance: 396.72, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '域内合作项目', yearBeginningBalance: 1121.48, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '域外合作项目', yearBeginningBalance: 2009.38, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '设备外服', yearBeginningBalance: 0.00, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '新能源项目', yearBeginningBalance: 297.69, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '苏州项目', yearBeginningBalance: 295.75, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '抢修项目', yearBeginningBalance: 22.96, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 },
                { customerAttribute: '运检项目', yearBeginningBalance: 101.12, currentPeriodNewInvoicing: 0, currentPeriodAccumulatedCollection: 0, currentPeriodReceivableBalance: 0 }
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
            customerAttribute: row.customer_attribute,
            yearBeginningBalance: parseFloat(row.year_beginning_balance) || 0,
            currentPeriodNewInvoicing: parseFloat(row.current_period_new_invoicing) || 0,
            currentPeriodAccumulatedCollection: parseFloat(row.current_period_accumulated_collection) || 0,
            currentPeriodReceivableBalance: parseFloat(row.current_period_receivable_balance) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取依据分析附表数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存依据分析附表数据
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
            await connection.execute('DELETE FROM nanhua_analysis_appendix WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO nanhua_analysis_appendix 
                    (period, customer_attribute, year_beginning_balance, current_period_new_invoicing, 
                     current_period_accumulated_collection, current_period_receivable_balance)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.customerAttribute,
                    item.yearBeginningBalance || 0,
                    item.currentPeriodNewInvoicing || 0,
                    item.currentPeriodAccumulatedCollection || 0,
                    item.currentPeriodReceivableBalance || 0
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
        console.error('保存依据分析附表数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;