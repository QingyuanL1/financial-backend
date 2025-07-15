const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取成本中心计入损益情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源成本中心计入损益情况数据 - 期间: ${period}`);

        // 解析期间，获取年份
        const [year, month] = period.split('-');
        const currentYear = parseInt(year);
        
        // 获取当前期间数据
        const currentQuery = `
            SELECT 
                department_attribute,
                annual_budget,
                current_period
            FROM tuoyuan_cost_center_profit_loss 
            WHERE period = ?
            ORDER BY 
                CASE department_attribute
                    WHEN '总经理室' THEN 1
                    WHEN '企管部' THEN 2
                    WHEN '财务部' THEN 3
                    WHEN '市场部' THEN 4
                    WHEN '技术部' THEN 5
                    WHEN '品质部' THEN 6
                    WHEN '生产部' THEN 7
                    ELSE 99
                END
        `;

        const [currentRows] = await pool.execute(currentQuery, [period]);
        
        // 获取当年1月到当前月的所有数据来计算累计
        const cumulativeQuery = `
            SELECT 
                department_attribute,
                SUM(current_period) as cumulative_sum
            FROM tuoyuan_cost_center_profit_loss 
            WHERE period >= ? AND period <= ?
            GROUP BY department_attribute
        `;
        
        const yearStart = `${currentYear}-01`;
        const [cumulativeRows] = await pool.execute(cumulativeQuery, [yearStart, period]);

        // 创建累计数据映射
        const cumulativeMap = {};
        cumulativeRows.forEach(row => {
            cumulativeMap[row.department_attribute] = parseFloat(row.cumulative_sum) || 0;
        });

        // 创建默认的部门列表
        const defaultDepartments = [
            { departmentAttribute: '总经理室', annualBudget: 229.31 },
            { departmentAttribute: '企管部', annualBudget: 104.86 },
            { departmentAttribute: '财务部', annualBudget: 82.01 },
            { departmentAttribute: '市场部', annualBudget: 599.32 },
            { departmentAttribute: '技术部', annualBudget: 43.09 },
            { departmentAttribute: '品质部', annualBudget: 18.58 },
            { departmentAttribute: '生产部', annualBudget: 92.30 }
        ];

        // 如果没有当前期间数据，返回默认数据，但仍然计算累计值
        if (currentRows.length === 0) {
            console.log('没有找到当前期间数据，返回默认数据但计算累计值');
            const defaultData = {
                items: defaultDepartments.map(dept => {
                    const cumulative = cumulativeMap[dept.departmentAttribute] || 0;
                    const executionProgress = dept.annualBudget > 0 ? (cumulative / dept.annualBudget) * 100 : 0;
                    
                    return {
                        departmentAttribute: dept.departmentAttribute,
                        annualBudget: dept.annualBudget,
                        currentPeriod: 0,
                        cumulative: cumulative,
                        executionProgress: executionProgress,
                        budgetVsPlanRatio: 0.00,
                        actualVsCurrentRatio: 0.00
                    };
                })
            };
            return res.json({ success: true, data: defaultData });
        }

        // 确保所有部门都有数据，合并当前期间数据和累计数据
        const items = defaultDepartments.map(dept => {
            const currentRow = currentRows.find(row => row.department_attribute === dept.departmentAttribute);
            const currentPeriod = currentRow ? parseFloat(currentRow.current_period) || 0 : 0;
            const cumulative = cumulativeMap[dept.departmentAttribute] || 0;
            const annualBudget = dept.annualBudget;
            const executionProgress = annualBudget > 0 ? (cumulative / annualBudget) * 100 : 0;
            
            return {
                departmentAttribute: dept.departmentAttribute,
                annualBudget: annualBudget,
                currentPeriod: currentPeriod,
                cumulative: cumulative,
                executionProgress: executionProgress,
                budgetVsPlanRatio: 0.00,
                actualVsCurrentRatio: 0.00
            };
        });

        const data = { items };
        res.json({ success: true, data });

    } catch (error) {
        console.error('获取拓源成本中心计入损益情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败', 
            error: error.message 
        });
    }
});

// 保存成本中心计入损益情况数据
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { period, data } = req.body;
        
        if (!period || !data || !Array.isArray(data.items)) {
            return res.status(400).json({ 
                success: false, 
                message: '期间和数据项是必需的' 
            });
        }
        
        console.log(`保存拓源成本中心计入损益情况数据 - 期间: ${period}, 项目数量: ${data.items.length}`);
        
        await connection.beginTransaction();
        
        // 删除指定期间的现有数据
        await connection.execute(
            'DELETE FROM tuoyuan_cost_center_profit_loss WHERE period = ?',
            [period]
        );
        
        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_cost_center_profit_loss (
                period, 
                department_attribute, 
                annual_budget,
                current_period,
                cumulative,
                execution_progress,
                budget_vs_plan_ratio,
                actual_vs_current_ratio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.departmentAttribute,
                item.annualBudget || 0,
                item.currentPeriod || 0,
                0, // cumulative 不保存，由后端计算
                0, // executionProgress 不保存，由后端计算
                0, // budgetVsPlanRatio 固定为0
                0  // actualVsCurrentRatio 固定为0
            ]);
        }
        
        await connection.commit();
        console.log('拓源成本中心计入损益情况数据保存成功');
        
        res.json({ 
            success: true, 
            message: '数据保存成功',
            period: period,
            count: data.items.length
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('保存拓源成本中心计入损益情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '保存数据失败', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

module.exports = router;