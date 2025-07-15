const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源存量结构与质量数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源存量结构与质量数据 - 期间: ${period}`);

        const query = `
            SELECT 
                segment_attribute,
                customer_attribute,
                year_beginning_amount,
                current_period_amount,
                current_period_cumulative,
                fluctuation_rate
            FROM tuoyuan_inventory_structure 
            WHERE period = ?
            ORDER BY 
                CASE segment_attribute
                    WHEN '设备' THEN 1
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

        const [rows] = await pool.execute(query, [period]);
        console.log(`查询结果数量: ${rows.length}`);

        // 如果没有数据，返回默认数据
        if (rows.length === 0) {
            console.log('没有找到数据，返回默认数据');
            const defaultData = {
                items: [
                    { segmentAttribute: '设备', customerAttribute: '电业项目', yearBeginningAmount: 5304.53, currentPeriodAmount: 0, currentPeriodCumulative: 0, fluctuationRate: 0 },
                    { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningAmount: 374.66, currentPeriodAmount: 0, currentPeriodCumulative: 0, fluctuationRate: 0 },
                    { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningAmount: 0.00, currentPeriodAmount: 0, currentPeriodCumulative: 0, fluctuationRate: 0 },
                    { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningAmount: 3661.89, currentPeriodAmount: 0, currentPeriodCumulative: 0, fluctuationRate: 0 },
                    { segmentAttribute: '设备', customerAttribute: '代理工程', yearBeginningAmount: 0.00, currentPeriodAmount: 0, currentPeriodCumulative: 0, fluctuationRate: 0 },
                    { segmentAttribute: '设备', customerAttribute: '代理设计', yearBeginningAmount: 200.00, currentPeriodAmount: 0, currentPeriodCumulative: 0, fluctuationRate: 0 }
                ]
            };
            return res.json({ success: true, data: defaultData });
        }

        const items = rows.map(row => ({
            segmentAttribute: row.segment_attribute,
            customerAttribute: row.customer_attribute,
            yearBeginningAmount: parseFloat(row.year_beginning_amount) || 0,
            currentPeriodAmount: parseFloat(row.current_period_amount) || 0,
            currentPeriodCumulative: parseFloat(row.current_period_cumulative) || 0,
            fluctuationRate: parseFloat(row.fluctuation_rate) || 0
        }));

        const data = { items };
        res.json({ success: true, data });

    } catch (error) {
        console.error('获取拓源存量结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败', 
            error: error.message 
        });
    }
});

// 保存拓源存量结构与质量数据
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
        
        console.log(`保存拓源存量结构与质量数据 - 期间: ${period}, 项目数量: ${data.items.length}`);
        
        await connection.beginTransaction();
        
        // 删除指定期间的现有数据
        await connection.execute(
            'DELETE FROM tuoyuan_inventory_structure WHERE period = ?',
            [period]
        );
        
        // 插入新数据 - 只保存当期金额，其他字段由前端计算
        const insertQuery = `
            INSERT INTO tuoyuan_inventory_structure (
                period, 
                segment_attribute, 
                customer_attribute,
                year_beginning_amount,
                current_period_amount,
                current_period_cumulative,
                fluctuation_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.segmentAttribute,
                item.customerAttribute,
                item.yearBeginningAmount || 0,
                item.currentPeriodAmount || 0,
                0, // 不保存累计值，由前端计算
                0  // 不保存波动率，由前端计算
            ]);
        }
        
        await connection.commit();
        console.log('拓源存量结构与质量数据保存成功');
        
        res.json({ 
            success: true, 
            message: '数据保存成功',
            period: period,
            count: data.items.length
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('保存拓源存量结构与质量数据失败:', error);
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