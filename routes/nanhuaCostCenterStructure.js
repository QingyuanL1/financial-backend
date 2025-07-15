const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华成本中心结构与质量（年度口径分解）数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年计划收入
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlannedIncome: 284.22, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '二包项目', yearlyPlannedIncome: 106.53, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '域内合作项目', yearlyPlannedIncome: 41.41, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '域外合作项目', yearlyPlannedIncome: 17.07, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '新能源项目', yearlyPlannedIncome: 157.09, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '苏州项目', yearlyPlannedIncome: 12.88, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '投标项目', yearlyPlannedIncome: 41.77, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '运检项目', yearlyPlannedIncome: 68.06, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '自建项目', yearlyPlannedIncome: 0.00, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 }
      ],
      nonMainBusiness: [
        { customerName: '存货盘盈', yearlyPlannedIncome: 0.47, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '利息收入', yearlyPlannedIncome: 5.91, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, category, yearly_planned_income, current_income, accumulated_income, contribution_rate FROM nanhua_cost_center_structure WHERE period = ?',
      [period]
    );

    // 计算累计收入（从年初到当前月份的所有当期收入总和）
    const currentYear = period.split('-')[0];
    const [accumulatedRows] = await pool.execute(
      'SELECT customer_name, category, SUM(current_income) as total_accumulated FROM nanhua_cost_center_structure WHERE period LIKE ? GROUP BY customer_name, category',
      [`${currentYear}-%`]
    );

    // 合并工程数据
    const engineeringResult = fixedData.customers.map(item => {
      const currentItem = currentRows.find(row => row.customer_name === item.customerName && row.category === '工程');
      const accumulatedItem = accumulatedRows.find(row => row.customer_name === item.customerName && row.category === '工程');
      
      const currentIncome = currentItem ? parseFloat(currentItem.current_income) : 0;
      const accumulatedIncome = accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0;
      
      // 计算分摊损益占比
      const contributionRate = item.yearlyPlannedIncome > 0 ? (accumulatedIncome / item.yearlyPlannedIncome * 100) : 0;
      
      return {
        customerName: item.customerName,
        yearlyPlannedIncome: item.yearlyPlannedIncome,
        currentIncome: currentIncome,
        accumulatedIncome: accumulatedIncome,
        contributionRate: parseFloat(contributionRate.toFixed(2))
      };
    });

    // 合并非主营业务数据
    const nonMainBusinessResult = fixedData.nonMainBusiness.map(item => {
      const currentItem = currentRows.find(row => row.customer_name === item.customerName && row.category === '非主营业务');
      const accumulatedItem = accumulatedRows.find(row => row.customer_name === item.customerName && row.category === '非主营业务');
      
      const currentIncome = currentItem ? parseFloat(currentItem.current_income) : 0;
      const accumulatedIncome = accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0;
      
      // 计算分摊损益占比
      const contributionRate = item.yearlyPlannedIncome > 0 ? (accumulatedIncome / item.yearlyPlannedIncome * 100) : 0;
      
      return {
        customerName: item.customerName,
        yearlyPlannedIncome: item.yearlyPlannedIncome,
        currentIncome: currentIncome,
        accumulatedIncome: accumulatedIncome,
        contributionRate: parseFloat(contributionRate.toFixed(2))
      };
    });

    const result = {
      engineering: engineeringResult,
      nonMainBusiness: nonMainBusinessResult
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华成本中心结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华成本中心结构与质量数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || (!data.engineering && !data.nonMainBusiness)) {
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
      'DELETE FROM nanhua_cost_center_structure WHERE period = ?',
      [period]
    );

    // 插入工程数据
    if (data.engineering) {
      for (const item of data.engineering) {
        if (item.currentIncome > 0) {
          await connection.execute(
            `INSERT INTO nanhua_cost_center_structure 
             (period, customer_name, category, yearly_planned_income, current_income) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              period,
              item.customerName,
              '工程',
              item.yearlyPlannedIncome || 0,
              item.currentIncome || 0
            ]
          );
        }
      }
    }

    // 插入非主营业务数据
    if (data.nonMainBusiness) {
      for (const item of data.nonMainBusiness) {
        if (item.currentIncome > 0) {
          await connection.execute(
            `INSERT INTO nanhua_cost_center_structure 
             (period, customer_name, category, yearly_planned_income, current_income) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              period,
              item.customerName,
              '非主营业务',
              item.yearlyPlannedIncome || 0,
              item.currentIncome || 0
            ]
          );
        }
      }
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '数据保存成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存南华成本中心结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;