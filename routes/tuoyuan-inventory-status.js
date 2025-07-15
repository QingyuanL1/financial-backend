const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取库存情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源库存情况数据 - 期间: ${period}`);

        const query = `
            SELECT 
                segment_attribute,
                customer_attribute,
                initial_balance,
                current_amount,
                balance,
                fluctuation_rate
            FROM tuoyuan_inventory_status 
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
                    { segmentAttribute: '设备', customerAttribute: '电业项目', initialBalance: 614.32, currentAmount: -614.32, balance: 0.00, fluctuationRate: -100.00 },
                    { segmentAttribute: '设备', customerAttribute: '用户项目', initialBalance: 0.00, currentAmount: 14.45, balance: 14.45, fluctuationRate: 0.00 },
                    { segmentAttribute: '设备', customerAttribute: '贸易', initialBalance: 0.00, currentAmount: 0.00, balance: 0.00, fluctuationRate: 0.00 },
                    { segmentAttribute: '设备', customerAttribute: '代理设备', initialBalance: 225.08, currentAmount: 319.75, balance: 544.83, fluctuationRate: 142.06 },
                    { segmentAttribute: '设备', customerAttribute: '代理工程', initialBalance: 0.00, currentAmount: 0.00, balance: 0.00, fluctuationRate: 0.00 },
                    { segmentAttribute: '设备', customerAttribute: '代理设计', initialBalance: 0.00, currentAmount: 0.00, balance: 0.00, fluctuationRate: 0.00 }
                ]
            };
            return res.json({ success: true, data: defaultData });
        }

        const items = rows.map(row => ({
            segmentAttribute: row.segment_attribute,
            customerAttribute: row.customer_attribute,
            initialBalance: parseFloat(row.initial_balance) || 0,
            currentAmount: parseFloat(row.current_amount) || 0,
            balance: parseFloat(row.balance) || 0,
            fluctuationRate: parseFloat(row.fluctuation_rate) || 0
        }));

        const data = { items };
        res.json({ success: true, data });

    } catch (error) {
        console.error('获取拓源库存情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取数据失败', 
            error: error.message 
        });
    }
});

// 保存库存情况数据
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
        
        console.log(`保存拓源库存情况数据 - 期间: ${period}, 项目数量: ${data.items.length}`);
        
        await connection.beginTransaction();
        
        // 删除指定期间的现有数据
        await connection.execute(
            'DELETE FROM tuoyuan_inventory_status WHERE period = ?',
            [period]
        );
        
        // 插入新数据
        const insertQuery = `
            INSERT INTO tuoyuan_inventory_status (
                period, 
                segment_attribute, 
                customer_attribute,
                initial_balance,
                current_amount,
                balance,
                fluctuation_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const item of data.items) {
            await connection.execute(insertQuery, [
                period,
                item.segmentAttribute,
                item.customerAttribute,
                item.initialBalance || 0,
                item.currentAmount || 0,
                item.balance || 0,
                item.fluctuationRate || 0
            ]);
        }
        
        await connection.commit();
        console.log('拓源库存情况数据保存成功');
        
        res.json({ 
            success: true, 
            message: '数据保存成功',
            period: period,
            count: data.items.length
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('保存拓源库存情况数据失败:', error);
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