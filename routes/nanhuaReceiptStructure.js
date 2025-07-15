const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'finance'
};

// 获取收款结构与质量数据
router.get('/:period', async (req, res) => {
    const { period } = req.params;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute(
            'SELECT * FROM nanhua_receipt_structure WHERE period = ? ORDER BY id',
            [period]
        );
        
        await connection.end();
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到数据'
            });
        }
        
        // 转换数据格式
        const customers = rows.map(row => ({
            customerName: row.customer_name,
            yearlyPlan: parseFloat(row.yearly_plan) || 0,
            current: parseFloat(row.current_amount) || 0,
            accumulated: parseFloat(row.accumulated_amount) || 0,
            executionProgress: parseFloat(row.execution_progress) || 0
        }));
        
        res.json({
            success: true,
            data: {
                customers: customers
            }
        });
        
    } catch (error) {
        console.error('获取数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存收款结构与质量数据
router.post('/', async (req, res) => {
    const { period, data } = req.body;
    
    if (!period || !data || !data.customers) {
        return res.status(400).json({
            success: false,
            message: '缺少必要参数'
        });
    }
    
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // 开始事务
        await connection.beginTransaction();
        
        // 删除该期间的现有数据
        await connection.execute(
            'DELETE FROM nanhua_receipt_structure WHERE period = ?',
            [period]
        );
        
        // 插入新数据
        for (const customer of data.customers) {
            // 计算累计数据（从年初到当前月份）
            const [year, month] = period.split('-');
            const currentMonth = parseInt(month);
            let accumulated = 0;
            
            // 从1月累计到当前月份
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                
                if (m === currentMonth) {
                    // 当前月份使用输入的数据
                    accumulated += parseFloat(customer.current) || 0;
                } else {
                    // 其他月份从数据库获取
                    const [monthRows] = await connection.execute(
                        'SELECT current_amount FROM nanhua_receipt_structure WHERE period = ? AND customer_name = ?',
                        [monthPeriod, customer.customerName]
                    );
                    
                    if (monthRows.length > 0) {
                        accumulated += parseFloat(monthRows[0].current_amount) || 0;
                    }
                }
            }
            
            // 计算执行进度
            const executionProgress = customer.yearlyPlan > 0 ? (accumulated / customer.yearlyPlan) * 100 : 0;
            
            await connection.execute(
                `INSERT INTO nanhua_receipt_structure 
                (period, customer_name, yearly_plan, current_amount, accumulated_amount, execution_progress, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    period,
                    customer.customerName,
                    customer.yearlyPlan,
                    customer.current,
                    accumulated,
                    executionProgress
                ]
            );
        }
        
        // 提交事务
        await connection.commit();
        
        res.json({
            success: true,
            message: '保存成功'
        });
        
    } catch (error) {
        // 回滚事务
        if (connection) {
            await connection.rollback();
        }
        
        console.error('保存数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;
