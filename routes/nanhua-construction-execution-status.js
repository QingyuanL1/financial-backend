const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取施工执行情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT customer_attribute, annual_planned_output, self_construction, 
                   semi_self_subcontract, outsourced_subcontract
            FROM nanhua_construction_execution_status 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { customerAttribute: '一包项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '二包项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '域内合作项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '域外合作项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '新能源项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '苏州项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '抢修项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
                { customerAttribute: '运检项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 }
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
            annualPlannedOutput: parseFloat(row.annual_planned_output) || 0,
            selfConstruction: parseFloat(row.self_construction) || 0,
            semiSelfSubcontract: parseFloat(row.semi_self_subcontract) || 0,
            outsourcedSubcontract: parseFloat(row.outsourced_subcontract) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取施工执行情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存施工执行情况数据
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
            await connection.execute('DELETE FROM nanhua_construction_execution_status WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO nanhua_construction_execution_status 
                    (period, customer_attribute, annual_planned_output, self_construction, 
                     semi_self_subcontract, outsourced_subcontract)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.customerAttribute,
                    item.annualPlannedOutput || 0,
                    item.selfConstruction || 0,
                    item.semiSelfSubcontract || 0,
                    item.outsourcedSubcontract || 0
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
        console.error('保存施工执行情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;