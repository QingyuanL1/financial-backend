const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取部门成本中心实际发生情况数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的部门列表和年度预算
    const fixedData = {
      departments: [
        { departmentName: '总经理室', yearlyBudget: 361.36 },
        { departmentName: '综合部', yearlyBudget: 461.45 },
        { departmentName: '财务部', yearlyBudget: 93.07 },
        { departmentName: '安质部', yearlyBudget: 116.00 },
        { departmentName: '工程部', yearlyBudget: 821.07 },
        { departmentName: '运检部', yearlyBudget: 569.90 },
        { departmentName: '营销部-销售', yearlyBudget: 125.13 },
        { departmentName: '营销部-商务', yearlyBudget: 53.37 },
        { departmentName: '营销部-设备', yearlyBudget: 1048.86 },
        { departmentName: '营销部-采购', yearlyBudget: 0.47 },
        { departmentName: '营销部-后勤', yearlyBudget: 200.0 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT department_name, yearly_budget, current_amount, accumulated_amount, execution_progress, actual_ratio FROM department_cost_center_actual WHERE period = ?',
      [period]
    );

    // 计算累计数据（当前年份所有月份的当期总和）
    const currentYear = period.split('-')[0];
    const [accumulatedRows] = await pool.execute(
      'SELECT department_name, SUM(current_amount) as total_accumulated FROM department_cost_center_actual WHERE period LIKE ? GROUP BY department_name',
      [`${currentYear}-%`]
    );

    // 合并数据
    const result = {
      departments: fixedData.departments.map(item => {
        const currentItem = currentRows.find(row => row.department_name === item.departmentName);
        const accumulatedItem = accumulatedRows.find(row => row.department_name === item.departmentName);
        
        const currentAmount = currentItem ? parseFloat(currentItem.current_amount) : 0;
        const accumulatedAmount = accumulatedItem ? parseFloat(accumulatedItem.total_accumulated) : 0;
        
        // 计算执行进度
        const executionProgress = item.yearlyBudget > 0 ? (accumulatedAmount / item.yearlyBudget * 100) : 0;
        
        // 计算实际占产值比（这里先设为0，需要根据实际业务逻辑调整）
        const actualRatio = 0;
        
        return {
          departmentName: item.departmentName,
          yearlyBudget: item.yearlyBudget,
          currentAmount: currentAmount,
          accumulatedAmount: accumulatedAmount,
          executionProgress: parseFloat(executionProgress.toFixed(2)),
          actualRatio: parseFloat(actualRatio.toFixed(2))
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取部门成本中心实际发生情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存部门成本中心实际发生情况数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.departments) {
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
      'DELETE FROM department_cost_center_actual WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.departments) {
      if (item.currentAmount > 0) {
        await connection.execute(
          `INSERT INTO department_cost_center_actual 
           (period, department_name, yearly_budget, current_amount) 
           VALUES (?, ?, ?, ?)`,
          [
            period,
            item.departmentName,
            item.yearlyBudget || 0,
            item.currentAmount || 0
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
    console.error('保存部门成本中心实际发生情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;