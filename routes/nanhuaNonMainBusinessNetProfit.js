const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华非主营业务净利润贡献情况数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的财务科目列表
    const fixedData = {
      items: [
        { financialSubject: '处置固废收入', annualPlan: 5.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '车辆租金收入', annualPlan: 30.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '利息收入', annualPlan: 0.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '设备外服收入', annualPlan: 11.78, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '政府补贴收入', annualPlan: 50.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '派遣补贴收入', annualPlan: 20.71, current: 0, accumulated: 0, executionProgress: 0 }
      ],
      assessment: ''
    };
    
    // 从数据库获取数据
    const [rows] = await pool.execute(
      'SELECT financial_subject, annual_plan, current_amount, accumulated, execution_progress FROM nanhua_non_main_business_net_profit WHERE period = ?',
      [period]
    );

    // 获取分公司评估意见
    const [assessmentRows] = await pool.execute(
      'SELECT assessment FROM nanhua_non_main_business_net_profit_assessment WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      items: fixedData.items.map(item => {
        const dbItem = rows.find(row => row.financial_subject === item.financialSubject);
        return {
          financialSubject: item.financialSubject,
          annualPlan: item.annualPlan,
          current: dbItem ? parseFloat(dbItem.current_amount) : 0,
          accumulated: dbItem ? parseFloat(dbItem.accumulated) : 0,
          executionProgress: dbItem ? parseFloat(dbItem.execution_progress) : 0
        };
      }),
      assessment: assessmentRows.length > 0 ? assessmentRows[0].assessment : ''
    };

    res.json({
      success: true,
      data: result,
      period: period
    });
  } catch (error) {
    console.error('获取南华非主营业务净利润贡献情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 保存南华非主营业务净利润贡献情况数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;
    
    if (!period || !data || !data.items) {
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
      await connection.execute('DELETE FROM nanhua_non_main_business_net_profit WHERE period = ?', [period]);
      await connection.execute('DELETE FROM nanhua_non_main_business_net_profit_assessment WHERE period = ?', [period]);
      
      // 准备批量插入数据
      const insertQuery = `
        INSERT INTO nanhua_non_main_business_net_profit 
        (period, financial_subject, annual_plan, current_amount, accumulated, execution_progress) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      // 处理财务科目数据
      for (const item of data.items) {
        await connection.execute(insertQuery, [
          period,
          item.financialSubject,
          item.annualPlan || 0,
          item.current || 0,
          item.accumulated || 0,
          item.executionProgress || 0
        ]);
      }
      
      // 保存分公司评估意见
      if (data.assessment) {
        await connection.execute(
          'INSERT INTO nanhua_non_main_business_net_profit_assessment (period, assessment) VALUES (?, ?)',
          [period, data.assessment]
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
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('保存南华非主营业务净利润贡献情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

module.exports = router;