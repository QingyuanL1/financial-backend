const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取自行施工情况分析数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT customer_attribute, company_design_capacity, annual_capacity_plan, 
                   current_period_capacity_accumulated, plan_execution_progress, capacity_utilization_rate
            FROM nanhua_self_construction_analysis 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { customerAttribute: '一包项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '二包项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '域内合作项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '域外合作项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '新能源项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '苏州项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '抢修项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
                { customerAttribute: '运检项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 }
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
            companyDesignCapacity: parseFloat(row.company_design_capacity) || 0,
            annualCapacityPlan: parseFloat(row.annual_capacity_plan) || 0,
            currentPeriodCapacityAccumulated: parseFloat(row.current_period_capacity_accumulated) || 0,
            planExecutionProgress: parseFloat(row.plan_execution_progress) || 0,
            capacityUtilizationRate: parseFloat(row.capacity_utilization_rate) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取自行施工情况分析数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存自行施工情况分析数据
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
            await connection.execute('DELETE FROM nanhua_self_construction_analysis WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO nanhua_self_construction_analysis 
                    (period, customer_attribute, company_design_capacity, annual_capacity_plan, 
                     current_period_capacity_accumulated, plan_execution_progress, capacity_utilization_rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.customerAttribute,
                    item.companyDesignCapacity || 0,
                    item.annualCapacityPlan || 0,
                    item.currentPeriodCapacityAccumulated || 0,
                    item.planExecutionProgress || 0,
                    item.capacityUtilizationRate || 0
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
        console.error('保存自行施工情况分析数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;