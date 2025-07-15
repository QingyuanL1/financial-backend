const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华非主营业务情况数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的财务科目列表和年度计划
    const fixedData = {
      items: [
        { financialSubject: '处置固废收入', annualPlan: 5.00 },
        { financialSubject: '车辆租金收入', annualPlan: 30.00 },
        { financialSubject: '利息收入', annualPlan: 5.00 },
        { financialSubject: '设备外服收入', annualPlan: 255.00 },
        { financialSubject: '政府补贴收入', annualPlan: 50.00 },
        { financialSubject: '派遣补贴收入', annualPlan: 227.78 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT financial_subject, annual_plan, current_cumulative, execution_progress FROM nanhua_non_main_business WHERE period = ?',
      [period]
    );

    // 计算累计数据（所有历史期间的当期总和）
    const [accumulatedRows] = await pool.execute(
      'SELECT financial_subject, SUM(current_cumulative) as total_accumulated FROM nanhua_non_main_business WHERE period <= ? GROUP BY financial_subject',
      [period]
    );

    // 合并数据
    const result = {
      items: fixedData.items.map(item => {
        const currentItem = currentRows.find(row => row.financial_subject === item.financialSubject);
        const accumulatedItem = accumulatedRows.find(row => row.financial_subject === item.financialSubject);

        const current = currentItem ? parseFloat(currentItem.current_cumulative) : 0;
        const accumulated = accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0;
        const executionProgress = item.annualPlan > 0 ? (accumulated / item.annualPlan * 100) : 0;

        return {
          financialSubject: item.financialSubject,
          annualPlan: item.annualPlan,
          current: current,
          accumulated: accumulated,
          executionProgress: parseFloat(executionProgress.toFixed(2))
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华非主营业务情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华非主营业务情况数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.items) {
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
      'DELETE FROM nanhua_non_main_business WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.items) {
      if (item.current > 0) {
        const executionProgress = item.annualPlan > 0 ? (item.accumulated / item.annualPlan * 100) : 0;

        await connection.execute(
          `INSERT INTO nanhua_non_main_business
           (period, financial_subject, annual_plan, current_cumulative, execution_progress)
           VALUES (?, ?, ?, ?, ?)`,
          [
            period,
            item.financialSubject,
            item.annualPlan || 0,
            item.current || 0,
            executionProgress
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
    console.error('保存南华非主营业务情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
