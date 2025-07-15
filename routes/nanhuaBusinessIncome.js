const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华营业收入结构与质量数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年度计划 (根据实际截图数据)
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 5355.05 },
        { customerName: '二包项目', yearlyPlan: 2889.91 },
        { customerName: '域内合作项目', yearlyPlan: 4165.14 },
        { customerName: '域外合作项目', yearlyPlan: 2550.46 },
        { customerName: '新能源项目', yearlyPlan: 3744.54 },
        { customerName: '苏州项目', yearlyPlan: 752.29 },
        { customerName: '抢修', yearlyPlan: 137.61 },
        { customerName: '运检', yearlyPlan: 1238.54 },
        { customerName: '自建项目', yearlyPlan: 0 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, yearly_plan, current_amount, accumulated_amount, completion_rate FROM nanhua_business_income WHERE period = ?',
      [period]
    );

    // 计算累计数据（所有历史期间的当期总和）
    const [accumulatedRows] = await pool.execute(
      'SELECT customer_name, SUM(current_amount) as total_accumulated FROM nanhua_business_income WHERE period <= ? GROUP BY customer_name',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const currentItem = currentRows.find(row => row.customer_name === item.customerName);
        const accumulatedItem = accumulatedRows.find(row => row.customer_name === item.customerName);
        
        const accumulated = accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0;
        const completionRate = item.yearlyPlan > 0 ? (accumulated / item.yearlyPlan * 100) : 0;
        
        return {
          customerName: item.customerName,
          yearlyPlan: item.yearlyPlan,
          current: currentItem ? parseFloat(currentItem.current_amount) : 0,
          accumulated: accumulated,
          completionRate: parseFloat(completionRate.toFixed(2))
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华营业收入结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华营业收入结构与质量数据
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
      'DELETE FROM nanhua_business_income WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.customers) {
      if (item.current > 0) {
        await connection.execute(
          `INSERT INTO nanhua_business_income 
           (period, customer_name, yearly_plan, current_amount, category) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            period,
            item.customerName,
            item.yearlyPlan || 0,
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
    console.error('保存南华营业收入结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;