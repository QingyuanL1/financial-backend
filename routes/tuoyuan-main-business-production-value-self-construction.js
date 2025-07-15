const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取主营业务产值--自行施工情况分析数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源主营业务产值--自行施工情况分析数据 - 期间: ${period}`);

        // 解析期间，获取年份
        const [year, month] = period.split('-');
        const currentYear = parseInt(year);
        
        // 获取当前期间数据
        const currentQuery = `
            SELECT 
                business_type,
                customer_attribute,
                company_design_capacity,
                annual_capacity_plan,
                current_capacity_cumulative,
                plan_execution_progress,
                capacity_utilization_rate
            FROM tuoyuan_main_business_production_value_self_construction 
            WHERE period = ?
            ORDER BY 
                CASE business_type
                    WHEN '主营业务产值' THEN 1
                    ELSE 99
                END,
                CASE customer_attribute
                    WHEN '电业项目' THEN 1
                    WHEN '用户项目' THEN 2
                    WHEN '贸易' THEN 3
                    WHEN '代理设备' THEN 4
                    WHEN '代理工程' THEN 5
                    WHEN '代理设计' THEN 6
                    ELSE 99
                END
        `;

        const [currentRows] = await pool.execute(currentQuery, [period]);
        
        // 创建默认的业务类型和客户属性列表
        const defaultItems = [
            { businessType: '主营业务产值', customerAttribute: '电业项目' },
            { businessType: '主营业务产值', customerAttribute: '用户项目' },
            { businessType: '主营业务产值', customerAttribute: '贸易' },
            { businessType: '主营业务产值', customerAttribute: '代理设备' },
            { businessType: '主营业务产值', customerAttribute: '代理工程' },
            { businessType: '主营业务产值', customerAttribute: '代理设计' }
        ];


        // 如果没有当前期间数据，返回默认数据
        if (currentRows.length === 0) {
            console.log('没有找到当前期间数据，返回默认数据');
            const defaultData = {
                items: defaultItems.map(item => ({
                    businessType: item.businessType,
                    customerAttribute: item.customerAttribute,
                    companyDesignCapacity: 0,
                    annualCapacityPlan: 0,
                    currentCapacityCumulative: 0,
                    planExecutionProgress: 0,
                    capacityUtilizationRate: 0
                }))
            };
            return res.json({ success: true, data: defaultData });
        }

        // 确保所有业务类型都有数据，合并当前期间数据
        const items = defaultItems.map(item => {
            const currentRow = currentRows.find(row => 
                row.business_type === item.businessType && 
                row.customer_attribute === item.customerAttribute
            );
            
            if (currentRow) {
                const companyDesignCapacity = parseFloat(currentRow.company_design_capacity) || 0;
                const annualCapacityPlan = parseFloat(currentRow.annual_capacity_plan) || 0;
                const currentCapacityCumulative = parseFloat(currentRow.current_capacity_cumulative) || 0;
                
                // 计算比例
                const planExecutionProgress = annualCapacityPlan > 0 ? (currentCapacityCumulative / annualCapacityPlan) * 100 : 0;
                const capacityUtilizationRate = companyDesignCapacity > 0 ? (currentCapacityCumulative / companyDesignCapacity) * 100 : 0;
                
                return {
                    businessType: item.businessType,
                    customerAttribute: item.customerAttribute,
                    companyDesignCapacity: companyDesignCapacity,
                    annualCapacityPlan: annualCapacityPlan,
                    currentCapacityCumulative: currentCapacityCumulative,
                    planExecutionProgress: planExecutionProgress,
                    capacityUtilizationRate: capacityUtilizationRate
                };
            } else {
                return {
                    businessType: item.businessType,
                    customerAttribute: item.customerAttribute,
                    companyDesignCapacity: 0,
                    annualCapacityPlan: 0,
                    currentCapacityCumulative: 0,
                    planExecutionProgress: 0,
                    capacityUtilizationRate: 0
                };
            }
        });

        const data = { items };
        res.json({ success: true, data });

    } catch (error) {
        console.error('获取拓源主营业务产值--自行施工情况分析数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败', 
            error: error.message 
        });
    }
});

// 保存主营业务产值--自行施工情况分析数据
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
        
        console.log(`保存拓源主营业务产值--自行施工情况分析数据 - 期间: ${period}, 项目数量: ${data.items.length}`);
        
        await connection.beginTransaction();
        
        // 删除指定期间的现有数据
        await connection.execute(
            'DELETE FROM tuoyuan_main_business_production_value_self_construction WHERE period = ?',
            [period]
        );
        
        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_main_business_production_value_self_construction (
                period, 
                business_type, 
                customer_attribute,
                company_design_capacity,
                annual_capacity_plan,
                current_capacity_cumulative,
                plan_execution_progress,
                capacity_utilization_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const item of data.items) {
            const companyDesignCapacity = item.companyDesignCapacity || 0;
            const annualCapacityPlan = item.annualCapacityPlan || 0;
            const currentCapacityCumulative = item.currentCapacityCumulative || 0;
            
            // 计算比例
            const planExecutionProgress = annualCapacityPlan > 0 ? (currentCapacityCumulative / annualCapacityPlan) * 100 : 0;
            const capacityUtilizationRate = companyDesignCapacity > 0 ? (currentCapacityCumulative / companyDesignCapacity) * 100 : 0;
            
            await connection.execute(insertQuery, [
                period,
                item.businessType,
                item.customerAttribute,
                companyDesignCapacity,
                annualCapacityPlan,
                currentCapacityCumulative,
                planExecutionProgress,
                capacityUtilizationRate
            ]);
        }
        
        await connection.commit();
        console.log('拓源主营业务产值--自行施工情况分析数据保存成功');
        
        res.json({ 
            success: true, 
            message: '数据保存成功',
            period: period,
            count: data.items.length
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('保存拓源主营业务产值--自行施工情况分析数据失败:', error);
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