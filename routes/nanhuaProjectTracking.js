const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华项目跟踪数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的项目列表和年度计划
    const fixedData = {
      projects: [
        { projectName: '一包项目', yearlyPlan: 7000.00 },
        { projectName: '二包项目', yearlyPlan: 2000.00 },
        { projectName: '域内合作项目', yearlyPlan: 6000.00 },
        { projectName: '域外合作项目', yearlyPlan: 2000.00 },
        { projectName: '新能源项目', yearlyPlan: 4000.00 },
        { projectName: '苏州项目', yearlyPlan: 1000.00 },
        { projectName: '自建项目', yearlyPlan: 0.00 }
      ]
    };

    // 获取当前期间的年份
    const currentYear = period.substring(0, 4);
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT project_name, current_amount FROM nanhua_project_tracking WHERE period = ?',
      [period]
    );

    // 从数据库获取当年所有之前月份的累计数据
    const [accumulatedRows] = await pool.execute(
      'SELECT project_name, SUM(current_amount) as total_accumulated FROM nanhua_project_tracking WHERE period LIKE ? AND period <= ? GROUP BY project_name',
      [`${currentYear}%`, period]
    );

    // 合并数据
    const result = {
      projects: fixedData.projects.map(item => {
        const currentItem = currentRows.find(row => row.project_name === item.projectName);
        const accumulatedItem = accumulatedRows.find(row => row.project_name === item.projectName);
        
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
    console.error('获取南华项目跟踪数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华项目跟踪数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.projects) {
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
      'DELETE FROM nanhua_project_tracking WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.projects) {
      if (item.current && item.current > 0) {
        await connection.execute(
          `INSERT INTO nanhua_project_tracking 
           (period, project_name, yearly_plan, current_amount, accumulated, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            period,
            item.projectName,
            item.yearlyPlan || 0,
            item.current || 0,
            item.accumulated || 0,
            '项目'
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
    console.error('保存南华项目跟踪数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;