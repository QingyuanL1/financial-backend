const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华新签订单数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年度计划
    const fixedData = {
      engineering: [
        { customer: '一包项目', yearlyPlan: 7000.00 },
        { customer: '二包项目', yearlyPlan: 2000.00 },
        { customer: '域内合作项目', yearlyPlan: 6000.00 },
        { customer: '域外合作项目', yearlyPlan: 2000.00 },
        { customer: '新能源项目', yearlyPlan: 4000.00 },
        { customer: '苏州项目', yearlyPlan: 1000.00 },
        { customer: '自建项目', yearlyPlan: 0.00 },
      ]
    };

    // 获取当前期间的年份
    const currentYear = period.substring(0, 4);
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer, current_amount FROM nanhua_new_orders WHERE period = ?',
      [period]
    );

    // 从数据库获取当年所有之前月份的累计数据
    const [accumulatedRows] = await pool.execute(
      'SELECT customer, SUM(current_amount) as total_accumulated FROM nanhua_new_orders WHERE period LIKE ? AND period <= ? GROUP BY customer',
      [`${currentYear}%`, period]
    );

    // 合并数据
    const result = {
      engineering: fixedData.engineering.map(item => {
        const currentItem = currentRows.find(row => row.customer === item.customer);
        const accumulatedItem = accumulatedRows.find(row => row.customer === item.customer);
        
        return {
          ...item,
          current: currentItem ? parseFloat(currentItem.current_amount) : 0,
          accumulated: accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华新签订单数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华新签订单数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.engineering) {
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
      'DELETE FROM nanhua_new_orders WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.engineering) {
      if (item.current && item.current > 0) {
        await connection.execute(
          `INSERT INTO nanhua_new_orders 
           (period, customer, yearly_plan, current_amount, accumulated, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            period,
            item.customer,
            item.yearlyPlan || 0,
            item.current || 0,
            item.accumulated || 0,
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
    console.error('保存南华新签订单数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;