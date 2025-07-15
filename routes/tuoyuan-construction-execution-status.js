const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取施工执行情况数据
router.get('/:period', createBudgetMiddleware('施工执行情况'), async (req, res) => {
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
                yearly_plan_production_value,
                self_construction,
                semi_self_subcontract,
                outsource_transfer,
                self_construction_percentage
            FROM tuoyuan_construction_execution_status 
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
                    WHEN '自行施工率%' THEN 7
                    ELSE 8
                END
        `;

        const [rows] = await pool.execute(query, [period]);
        
        let items = [];
        
        if (rows.length === 0) {
            // 如果没有数据，返回默认结构
            items = [
                { segmentAttribute: '设备', customerAttribute: '电业项目', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理工程', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设计', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
                { segmentAttribute: '', customerAttribute: '自行施工率%', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 }
            ];
        } else {
            items = rows.map(row => ({
                segmentAttribute: row.segment_attribute,
                customerAttribute: row.customer_attribute,
                yearlyPlanProductionValue: Number(row.yearly_plan_production_value),
                selfConstruction: Number(row.self_construction),
                semiSelfSubcontract: Number(row.semi_self_subcontract),
                outsourceTransfer: Number(row.outsource_transfer),
                selfConstructionPercentage: Number(row.self_construction_percentage)
            }));
        }

        res.json({
            success: true,
            data: { items },
            period: period
        });

    } catch (error) {
        console.error('获取施工执行情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败' 
        });
    }
});

// 保存施工执行情况数据
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
            'DELETE FROM tuoyuan_construction_execution_status WHERE period = ?',
            [period]
        );

        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_construction_execution_status (
                period, 
                segment_attribute, 
                customer_attribute, 
                yearly_plan_production_value, 
                self_construction, 
                semi_self_subcontract, 
                outsource_transfer, 
                self_construction_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.segmentAttribute,
                item.customerAttribute,
                item.yearlyPlanProductionValue || 0,
                item.selfConstruction || 0,
                item.semiSelfSubcontract || 0,
                item.outsourceTransfer || 0,
                item.selfConstructionPercentage || 0
            ]);
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: '施工执行情况数据保存成功',
            period: period
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('保存施工执行情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '保存数据失败' 
        });
    }
});

// 更新施工执行情况数据
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
            'DELETE FROM tuoyuan_construction_execution_status WHERE period = ?',
            [period]
        );

        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_construction_execution_status (
                period, 
                segment_attribute, 
                customer_attribute, 
                yearly_plan_production_value, 
                self_construction, 
                semi_self_subcontract, 
                outsource_transfer, 
                self_construction_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.segmentAttribute,
                item.customerAttribute,
                item.yearlyPlanProductionValue || 0,
                item.selfConstruction || 0,
                item.semiSelfSubcontract || 0,
                item.outsourceTransfer || 0,
                item.selfConstructionPercentage || 0
            ]);
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: '施工执行情况数据更新成功',
            period: period
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('更新施工执行情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '更新数据失败' 
        });
    }
});

// 删除施工执行情况数据
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
            'DELETE FROM tuoyuan_construction_execution_status WHERE period = ?',
            [period]
        );

        res.json({
            success: true,
            message: '施工执行情况数据删除成功',
            period: period
        });

    } catch (error) {
        console.error('删除施工执行情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '删除数据失败' 
        });
    }
});

module.exports = router;