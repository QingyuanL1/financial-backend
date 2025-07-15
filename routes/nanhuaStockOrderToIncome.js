const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华存量订单转收入数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年初存量订单余额
    const fixedData = {
      customers: [
        { customerName: '一包项目', stockBalance: 10000.00 },
        { customerName: '二包项目', stockBalance: 4400.00 },
        { customerName: '域内合作项目', stockBalance: 8600.00 },
        { customerName: '域外合作项目', stockBalance: 4900.00 },
        { customerName: '新能源项目', stockBalance: 1900.00 },
        { customerName: '苏州项目', stockBalance: 4200.00 },
        { customerName: '投标项目', stockBalance: 0.00 },
        { customerName: '运检项目', stockBalance: 0.00 },
        { customerName: '自建项目', stockBalance: 0.00 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, stock_balance, current_amount, accumulated_amount, conversion_rate FROM nanhua_stock_order_to_income WHERE period = ?',
      [period]
    );

    // 计算累计数据（所有历史期间的当期总和）
    const [accumulatedRows] = await pool.execute(
      'SELECT customer_name, SUM(current_amount) as total_accumulated FROM nanhua_stock_order_to_income WHERE period <= ? GROUP BY customer_name',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const currentItem = currentRows.find(row => row.customer_name === item.customerName);
        const accumulatedItem = accumulatedRows.find(row => row.customer_name === item.customerName);
        
        const accumulated = accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0;
        const conversionRate = item.stockBalance > 0 ? (accumulated / item.stockBalance * 100) : 0;
        
        return {
          customerName: item.customerName,
          stockBalance: item.stockBalance,
          current: currentItem ? parseFloat(currentItem.current_amount) : 0,
          accumulated: accumulated,
          conversionRate: parseFloat(conversionRate.toFixed(2))
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华存量订单转收入数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华存量订单转收入数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.customers) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的参数'
    });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 删除该期间的旧数据
    await connection.execute(
      'DELETE FROM nanhua_stock_order_to_income WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.customers) {
      if (item.current > 0) {
        await connection.execute(
          `INSERT INTO nanhua_stock_order_to_income 
           (period, customer_name, stock_balance, current_amount, category) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            period,
            item.customerName,
            item.stockBalance || 0,
            item.current || 0,
            '工程'
          ]
        );
      }
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '数据保存成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存南华存量订单转收入数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;