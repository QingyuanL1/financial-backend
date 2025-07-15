const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取施工计划执行情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT customer_attribute, annual_target, on_time_completion_rate, 
                   acceptance_qualification_rate, plan_achievement_rate
            FROM nanhua_construction_plan_execution 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { customerAttribute: '一包项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '二包项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '域内合作项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '域外合作项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '新能源项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '苏州项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '抢修项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
                { customerAttribute: '运检项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 }
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
            annualTarget: parseFloat(row.annual_target) || 0,
            onTimeCompletionRate: parseFloat(row.on_time_completion_rate) || 0,
            acceptanceQualificationRate: parseFloat(row.acceptance_qualification_rate) || 0,
            planAchievementRate: parseFloat(row.plan_achievement_rate) || 0
        }));

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取施工计划执行情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存施工计划执行情况数据
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
            await connection.execute('DELETE FROM nanhua_construction_plan_execution WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO nanhua_construction_plan_execution 
                    (period, customer_attribute, annual_target, on_time_completion_rate, 
                     acceptance_qualification_rate, plan_achievement_rate)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.customerAttribute,
                    item.annualTarget || 0,
                    item.onTimeCompletionRate || 0,
                    item.acceptanceQualificationRate || 0,
                    item.planAchievementRate || 0
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
        console.error('保存施工计划执行情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;