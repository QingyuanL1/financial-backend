const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华部门成本中心实际发生情况数据
router.get('/:period', createBudgetMiddleware('部门成本中心'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const query = `
            SELECT * FROM nanhua_department_cost_center_actual 
            WHERE period = ?
        `;
        
        const [rows] = await db.execute(query, [period]);
        
        if (rows.length === 0) {
            // 如果没有数据，返回固定结构
            const fixedData = {
                departments: [
                    { departmentName: '总经理室', yearlyBudget: 361.36, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '综合部', yearlyBudget: 461.45, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '财务部', yearlyBudget: 93.07, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '安质部', yearlyBudget: 116.00, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '工程部', yearlyBudget: 821.07, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '运检部', yearlyBudget: 569.90, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '营销部-销售', yearlyBudget: 125.13, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '营销部-商务', yearlyBudget: 53.37, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '营销部-设备', yearlyBudget: 1048.86, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '营销部-采购', yearlyBudget: 0.47, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
                    { departmentName: '营销部-后勤', yearlyBudget: 200.0, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 }
                ],
                selfBuiltData: {
                    departmentName: '自建项目',
                    yearlyBudget: 0,
                    currentAmount: 0,
                    accumulatedAmount: 0,
                    executionProgress: 0,
                    actualRatio: 0
                }
            };
            
            return res.json({
                success: true,
                data: fixedData,
                message: '使用默认数据'
            });
        }
        
        // 整理数据格式
        const departmentData = {
            departments: [],
            selfBuiltData: null
        };
        
        rows.forEach(row => {
            if (row.department_name === '自建项目') {
                departmentData.selfBuiltData = {
                    departmentName: row.department_name,
                    yearlyBudget: parseFloat(row.yearly_budget) || 0,
                    currentAmount: parseFloat(row.current_amount) || 0,
                    accumulatedAmount: parseFloat(row.accumulated_amount) || 0,
                    executionProgress: parseFloat(row.execution_progress) || 0,
                    actualRatio: parseFloat(row.actual_ratio) || 0
                };
            } else {
                departmentData.departments.push({
                    departmentName: row.department_name,
                    yearlyBudget: parseFloat(row.yearly_budget) || 0,
                    currentAmount: parseFloat(row.current_amount) || 0,
                    accumulatedAmount: parseFloat(row.accumulated_amount) || 0,
                    executionProgress: parseFloat(row.execution_progress) || 0,
                    actualRatio: parseFloat(row.actual_ratio) || 0
                });
            }
        });
        
        // 如果没有自建项目数据，创建默认的
        if (!departmentData.selfBuiltData) {
            departmentData.selfBuiltData = {
                departmentName: '自建项目',
                yearlyBudget: 0,
                currentAmount: 0,
                accumulatedAmount: 0,
                executionProgress: 0,
                actualRatio: 0
            };
        }
        
        res.json({
            success: true,
            data: departmentData
        });
        
    } catch (error) {
        console.error('获取南华部门成本中心实际发生情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存南华部门成本中心实际发生情况数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data) {
            return res.status(400).json({
                success: false,
                message: '期间和数据不能为空'
            });
        }
        
        // 开始事务
        await db.execute('START TRANSACTION');
        
        try {
            // 删除该期间的旧数据
            await db.execute('DELETE FROM nanhua_department_cost_center_actual WHERE period = ?', [period]);
            
            // 准备插入数据
            const insertQuery = `
                INSERT INTO nanhua_department_cost_center_actual 
                (period, department_name, yearly_budget, current_amount, accumulated_amount, execution_progress, actual_ratio)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            // 插入部门数据
            if (data.departments && Array.isArray(data.departments)) {
                for (const department of data.departments) {
                    await db.execute(insertQuery, [
                        period,
                        department.departmentName,
                        department.yearlyBudget || 0,
                        department.currentAmount || 0,
                        department.accumulatedAmount || 0,
                        department.executionProgress || 0,
                        department.actualRatio || 0
                    ]);
                }
            }
            
            // 插入自建项目数据
            if (data.selfBuiltData) {
                await db.execute(insertQuery, [
                    period,
                    data.selfBuiltData.departmentName,
                    data.selfBuiltData.yearlyBudget || 0,
                    data.selfBuiltData.currentAmount || 0,
                    data.selfBuiltData.accumulatedAmount || 0,
                    data.selfBuiltData.executionProgress || 0,
                    data.selfBuiltData.actualRatio || 0
                ]);
            }
            
            // 提交事务
            await db.execute('COMMIT');
            
            res.json({
                success: true,
                message: '数据保存成功'
            });
            
        } catch (error) {
            // 回滚事务
            await db.execute('ROLLBACK');
            throw error;
        }
        
    } catch (error) {
        console.error('保存南华部门成本中心实际发生情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;