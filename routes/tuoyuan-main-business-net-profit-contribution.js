const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取主营业务净利润贡献情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源主营业务净利润贡献情况数据 - 期间: ${period}`);

        // 解析期间，获取年份
        const [year, month] = period.split('-');
        const currentYear = parseInt(year);
        
        // 获取当前期间数据
        const currentQuery = `
            SELECT 
                business_type,
                customer_attribute,
                annual_budget,
                current_period
            FROM tuoyuan_main_business_net_profit_contribution 
            WHERE period = ?
            ORDER BY 
                CASE business_type
                    WHEN '主营业务' THEN 1
                    WHEN '非主营业务' THEN 2
                    ELSE 99
                END,
                CASE customer_attribute
                    WHEN '电业项目' THEN 1
                    WHEN '用户项目' THEN 2
                    WHEN '贸易' THEN 3
                    WHEN '代理设备' THEN 4
                    WHEN '代理工程' THEN 5
                    WHEN '代理设计' THEN 6
                    WHEN '其他' THEN 7
                    ELSE 99
                END
        `;

        const [currentRows] = await pool.execute(currentQuery, [period]);
        
        // 获取当年1月到当前月的所有数据来计算累计
        const cumulativeQuery = `
            SELECT 
                business_type,
                customer_attribute,
                SUM(current_period) as cumulative_sum
            FROM tuoyuan_main_business_net_profit_contribution 
            WHERE period >= ? AND period <= ?
            GROUP BY business_type, customer_attribute
        `;
        
        const yearStart = `${currentYear}-01`;
        const [cumulativeRows] = await pool.execute(cumulativeQuery, [yearStart, period]);

        // 创建累计数据映射
        const cumulativeMap = {};
        cumulativeRows.forEach(row => {
            const key = `${row.business_type}-${row.customer_attribute}`;
            cumulativeMap[key] = parseFloat(row.cumulative_sum) || 0;
        });

        // 创建默认的业务类型和客户属性列表
        const defaultItems = [
            { businessType: '主营业务', customerAttribute: '电业项目', annualBudget: 0 },
            { businessType: '主营业务', customerAttribute: '用户项目', annualBudget: 0 },
            { businessType: '主营业务', customerAttribute: '贸易', annualBudget: 0 },
            { businessType: '主营业务', customerAttribute: '代理设备', annualBudget: 0 },
            { businessType: '主营业务', customerAttribute: '代理工程', annualBudget: 0 },
            { businessType: '主营业务', customerAttribute: '代理设计', annualBudget: 0 },
            { businessType: '非主营业务', customerAttribute: '其他', annualBudget: 0 }
        ];

        // 如果没有当前期间数据，返回默认数据，但仍然计算累计值
        if (currentRows.length === 0) {
            console.log('没有找到当前期间数据，返回默认数据但计算累计值');
            const defaultData = {
                items: defaultItems.map(item => {
                    const key = `${item.businessType}-${item.customerAttribute}`;
                    const cumulative = cumulativeMap[key] || 0;
                    
                    return {
                        businessType: item.businessType,
                        customerAttribute: item.customerAttribute,
                        annualBudget: item.annualBudget,
                        currentPeriod: 0,
                        cumulative: cumulative,
                        contributionRatio: 0.00
                    };
                })
            };
            return res.json({ success: true, data: defaultData });
        }

        // 确保所有业务类型都有数据，合并当前期间数据和累计数据
        const items = defaultItems.map(item => {
            const currentRow = currentRows.find(row => 
                row.business_type === item.businessType && 
                row.customer_attribute === item.customerAttribute
            );
            const currentPeriod = currentRow ? parseFloat(currentRow.current_period) || 0 : 0;
            const annualBudget = currentRow ? parseFloat(currentRow.annual_budget) || 0 : item.annualBudget;
            const key = `${item.businessType}-${item.customerAttribute}`;
            const cumulative = cumulativeMap[key] || 0;
            
            return {
                businessType: item.businessType,
                customerAttribute: item.customerAttribute,
                annualBudget: annualBudget,
                currentPeriod: currentPeriod,
                cumulative: cumulative,
                contributionRatio: 0.00
            };
        });

        const data = { items };
        res.json({ success: true, data });

    } catch (error) {
        console.error('获取拓源主营业务净利润贡献情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败', 
            error: error.message 
        });
    }
});

// 保存主营业务净利润贡献情况数据
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
        
        console.log(`保存拓源主营业务净利润贡献情况数据 - 期间: ${period}, 项目数量: ${data.items.length}`);
        
        await connection.beginTransaction();
        
        // 删除指定期间的现有数据
        await connection.execute(
            'DELETE FROM tuoyuan_main_business_net_profit_contribution WHERE period = ?',
            [period]
        );
        
        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_main_business_net_profit_contribution (
                period, 
                business_type, 
                customer_attribute,
                annual_budget,
                current_period,
                cumulative,
                execution_progress,
                budget_vs_plan_ratio,
                actual_vs_current_ratio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.businessType,
                item.customerAttribute,
                item.annualBudget || 0,
                item.currentPeriod || 0,
                0, // cumulative 不保存，由后端计算
                0, // executionProgress 不保存，由后端计算
                0, // budgetVsPlanRatio 固定为0
                0  // actualVsCurrentRatio 固定为0
            ]);
        }
        
        await connection.commit();
        console.log('拓源主营业务净利润贡献情况数据保存成功');
        
        res.json({ 
            success: true, 
            message: '数据保存成功',
            period: period,
            count: data.items.length
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('保存拓源主营业务净利润贡献情况数据失败:', error);
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