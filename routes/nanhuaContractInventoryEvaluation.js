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

// 获取在建工程（合同存量）评估数据
router.get('/:period', async (req, res) => {
    const { period } = req.params;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute(
            'SELECT * FROM nanhua_contract_inventory_evaluation WHERE period = ? ORDER BY id',
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
            yearBeginning: parseFloat(row.year_beginning) || 0,
            currentEvaluation: parseFloat(row.current_evaluation) || 0,
            fluctuationRate: parseFloat(row.fluctuation_rate) || 0
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

// 保存在建工程（合同存量）评估数据
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
            'DELETE FROM nanhua_contract_inventory_evaluation WHERE period = ?',
            [period]
        );
        
        // 插入新数据
        for (const customer of data.customers) {
            // 计算波动率
            let fluctuationRate = 0;
            if (customer.yearBeginning > 0) {
                const change = customer.currentEvaluation - customer.yearBeginning;
                fluctuationRate = (change / customer.yearBeginning) * 100;
            }
            
            await connection.execute(
                `INSERT INTO nanhua_contract_inventory_evaluation 
                (period, customer_name, year_beginning, current_evaluation, fluctuation_rate, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    period,
                    customer.customerName,
                    customer.yearBeginning,
                    customer.currentEvaluation,
                    fluctuationRate
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
