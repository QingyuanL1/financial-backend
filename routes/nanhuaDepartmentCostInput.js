const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华部门成本中心计入损益情况数据
router.get('/:period', createBudgetMiddleware('部门成本中心'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const query = `
            SELECT * FROM nanhua_department_cost_input 
            WHERE period = ?
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
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
                    { departmentName: '营销部', yearlyBudget: 1048.86, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 }
                ]
            };
            
            return res.json({
                success: true,
                data: fixedData,
                message: '使用默认数据'
            });
        }
        
        // 整理数据格式
        const departmentData = {
            departments: []
        };
        
        rows.forEach(row => {
            const currentAmount = parseFloat(row.current_amount) || 0;
            const yearlyBudget = parseFloat(row.yearly_budget) || 0;
            const accumulatedAmount = parseFloat(row.accumulated_amount) || 0;
            const executionProgress = yearlyBudget > 0 ? (accumulatedAmount / yearlyBudget * 100) : 0;
            
            departmentData.departments.push({
                departmentName: row.department_name,
                yearlyBudget: yearlyBudget,
                currentAmount: currentAmount,
                accumulatedAmount: accumulatedAmount,
                executionProgress: executionProgress,
                actualRatio: parseFloat(row.actual_ratio) || 0
            });
        });
        
        res.json({
            success: true,
            data: departmentData
        });
        
    } catch (error) {
        console.error('获取南华部门成本中心计入损益情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存南华部门成本中心计入损益情况数据
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
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            // 删除该期间的旧数据
            await connection.execute('DELETE FROM nanhua_department_cost_input WHERE period = ?', [period]);
            
            // 准备插入数据
            const insertQuery = `
                INSERT INTO nanhua_department_cost_input 
                (period, department_name, yearly_budget, current_amount, accumulated_amount, execution_progress, actual_ratio)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            // 插入部门数据
            if (data.departments && Array.isArray(data.departments)) {
                for (const department of data.departments) {
                    // 计算累计数据（简单累加当前月份数据）
                    const currentAmount = department.currentAmount || 0;
                    const yearlyBudget = department.yearlyBudget || 0;
                    
                    // 获取历史累计数据
                    let accumulatedAmount = currentAmount;
                    try {
                        const [year] = period.split('-');
                        const historyQuery = `
                            SELECT SUM(current_amount) as total_accumulated 
                            FROM nanhua_department_cost_input 
                            WHERE department_name = ? 
                            AND period < ? 
                            AND period LIKE ?
                        `;
                        const [historyRows] = await pool.execute(historyQuery, [
                            department.departmentName,
                            period,
                            `${year}-%`
                        ]);
                        
                        if (historyRows.length > 0 && historyRows[0].total_accumulated) {
                            accumulatedAmount = parseFloat(historyRows[0].total_accumulated) + currentAmount;
                        }
                    } catch (error) {
                        console.warn('计算历史累计数据失败:', error);
                    }
                    
                    const executionProgress = yearlyBudget > 0 ? (accumulatedAmount / yearlyBudget * 100) : 0;
                    
                    await connection.execute(insertQuery, [
                        period,
                        department.departmentName,
                        yearlyBudget,
                        currentAmount,
                        accumulatedAmount,
                        executionProgress,
                        department.actualRatio || 0
                    ]);
                }
            }
            
            // 提交事务
            await connection.commit();
            connection.release();
            
            res.json({
                success: true,
                message: '数据保存成功'
            });
            
        } catch (error) {
            // 回滚事务
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('保存南华部门成本中心计入损益情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;