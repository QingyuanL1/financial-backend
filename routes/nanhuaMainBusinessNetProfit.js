const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华主营业务净利润贡献情况数据
router.get('/:period', createBudgetMiddleware('南华主营业务净利润贡献'), async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '二包项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '域内合作项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '域外合作项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '新能源项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '苏州项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '抢修项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '运检项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '派遣', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '自建', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 }
      ]
    };
    
    // 从数据库获取数据
    const [rows] = await pool.execute(
      'SELECT customer_name, yearly_plan, current_period, cumulative, decomposition_ratio, annual_ratio FROM nanhua_main_business_net_profit WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const dbItem = rows.find(row => row.customer_name === item.customerName);
        return {
          customerName: item.customerName,
          yearlyPlan: dbItem ? parseFloat(dbItem.yearly_plan) : item.yearlyPlan,
          currentPeriod: dbItem ? parseFloat(dbItem.current_period) : 0,
          cumulative: dbItem ? parseFloat(dbItem.cumulative) : 0,
          decompositionRatio: dbItem ? parseFloat(dbItem.decomposition_ratio) : 0,
          annualRatio: dbItem ? parseFloat(dbItem.annual_ratio) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result,
      period: period
    });
  } catch (error) {
    console.error('获取南华主营业务净利润贡献情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 保存南华主营业务净利润贡献情况数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;
    
    if (!period || !data || !data.customers) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 删除该期间的现有数据
      await connection.execute('DELETE FROM nanhua_main_business_net_profit WHERE period = ?', [period]);
      
      // 准备批量插入数据
      const insertQuery = `
        INSERT INTO nanhua_main_business_net_profit 
        (period, customer_name, yearly_plan, current_period, cumulative, decomposition_ratio, annual_ratio) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // 处理客户数据
      for (const item of data.customers) {
        await connection.execute(insertQuery, [
          period,
          item.customerName,
          item.yearlyPlan || 0,
          item.currentPeriod || 0,
          item.cumulative || 0,
          item.decompositionRatio || 0,
          item.annualRatio || 0
        ]);
      }
      
      // 提交事务
      await connection.commit();
      
      res.json({ 
        success: true, 
        message: '保存成功' 
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('保存南华主营业务净利润贡献情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

module.exports = router;