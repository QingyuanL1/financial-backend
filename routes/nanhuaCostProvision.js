const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华成本计提情况数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearBeginBalance: 1164.76, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '二包项目', yearBeginBalance: 426.90, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域内合作项目', yearBeginBalance: 474.41, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域外合作项目', yearBeginBalance: 661.56, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '新能源项目', yearBeginBalance: 730.12, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '苏州项目', yearBeginBalance: 93.99, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '抢修项目', yearBeginBalance: 0.00, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '运检项目', yearBeginBalance: 242.66, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '派遣', yearBeginBalance: 19.50, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '自建', yearBeginBalance: 0.00, monthlyIncrease: 0, yearlyAccumulated: 0, provisionRate: 0 }
      ]
    };
    
    // 从数据库获取数据
    const [rows] = await pool.execute(
      'SELECT customer_name, year_begin_balance, monthly_increase, yearly_accumulated, provision_rate FROM nanhua_cost_provision WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const dbItem = rows.find(row => row.customer_name === item.customerName);
        return {
          customerName: item.customerName,
          yearBeginBalance: item.yearBeginBalance,
          monthlyIncrease: dbItem ? parseFloat(dbItem.monthly_increase) : 0,
          yearlyAccumulated: dbItem ? parseFloat(dbItem.yearly_accumulated) : 0,
          provisionRate: dbItem ? parseFloat(dbItem.provision_rate) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result,
      period: period
    });
  } catch (error) {
    console.error('获取南华成本计提情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 保存南华成本计提情况数据
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
      await connection.execute('DELETE FROM nanhua_cost_provision WHERE period = ?', [period]);
      
      // 准备批量插入数据
      const insertQuery = `
        INSERT INTO nanhua_cost_provision 
        (period, customer_name, year_begin_balance, monthly_increase, yearly_accumulated, provision_rate) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      // 处理客户数据
      for (const item of data.customers) {
        await connection.execute(insertQuery, [
          period,
          item.customerName,
          item.yearBeginBalance || 0,
          item.monthlyIncrease || 0,
          item.yearlyAccumulated || 0,
          item.provisionRate || 0
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
    console.error('保存南华成本计提情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

module.exports = router;
