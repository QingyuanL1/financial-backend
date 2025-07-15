const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华主营业务边际贡献率结构与质量数据（含自建项目）
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年度计划 (根据实际截图数据，百分比格式)
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 26.52 },
        { customerName: '二包项目', yearlyPlan: 18.00 },
        { customerName: '域内合作项目', yearlyPlan: 8.00 },
        { customerName: '域外合作项目', yearlyPlan: 5.48 },
        { customerName: '新能源项目', yearlyPlan: 25.00 },
        { customerName: '苏州项目', yearlyPlan: 6.00 },
        { customerName: '抢修', yearlyPlan: 100.00 },
        { customerName: '运检', yearlyPlan: 30.00 },
        { customerName: '自建项目', yearlyPlan: 0 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, yearly_plan, current_amount, deviation FROM nanhua_business_contribution_with_self_built WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const currentItem = currentRows.find(row => row.customer_name === item.customerName);
        
        return {
          customerName: item.customerName,
          yearlyPlan: item.yearlyPlan,
          current: currentItem ? parseFloat(currentItem.current_amount) : 0,
          deviation: currentItem ? parseFloat(currentItem.deviation) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华主营业务边际贡献率结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华主营业务边际贡献率结构与质量数据（含自建项目）
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
      'DELETE FROM nanhua_business_contribution_with_self_built WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.customers) {
      if (item.current > 0) {
        const deviation = (item.current || 0) - (item.yearlyPlan || 0);
        
        await connection.execute(
          `INSERT INTO nanhua_business_contribution_with_self_built 
           (period, customer_name, yearly_plan, current_amount, deviation, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            period,
            item.customerName,
            item.yearlyPlan || 0,
            item.current || 0,
            deviation,
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
    console.error('保存南华主营业务边际贡献率结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;