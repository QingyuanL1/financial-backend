const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取年度重大投资情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT sequence_no, project_name, annual_plan, current_execution, 
                   current_execution_cumulative, execution_progress
            FROM tuoyuan_major_investment 
            WHERE period = ?
            ORDER BY sequence_no ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { sequenceNo: 1, projectName: '固定资产重建、购置', annualPlan: 60.41, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 2, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 3, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 4, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 5, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 6, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 7, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 8, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 9, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
                { sequenceNo: 10, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 }
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
            sequenceNo: row.sequence_no,
            projectName: row.project_name || '',
            annualPlan: parseFloat(row.annual_plan) || 0,
            currentExecution: parseFloat(row.current_execution) || 0,
            currentExecutionCumulative: parseFloat(row.current_execution_cumulative) || 0,
            executionProgress: parseFloat(row.execution_progress) || 0
        }));

        // 补充默认数据到10行
        while (items.length < 10) {
            items.push({
                sequenceNo: items.length + 1,
                projectName: '',
                annualPlan: 0,
                currentExecution: 0,
                currentExecutionCumulative: 0,
                executionProgress: 0
            });
        }

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取年度重大投资情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存年度重大投资情况数据
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
            await connection.execute('DELETE FROM tuoyuan_major_investment WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                // 只保存有项目名称或有数据的行
                if (item.projectName || item.annualPlan || item.currentExecution || item.currentExecutionCumulative) {
                    await connection.execute(`
                        INSERT INTO tuoyuan_major_investment 
                        (period, sequence_no, project_name, annual_plan, current_execution, 
                         current_execution_cumulative, execution_progress)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        period,
                        item.sequenceNo,
                        item.projectName || '',
                        item.annualPlan || 0,
                        item.currentExecution || 0,
                        item.currentExecutionCumulative || 0,
                        item.executionProgress || 0
                    ]);
                }
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
        console.error('保存年度重大投资情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;