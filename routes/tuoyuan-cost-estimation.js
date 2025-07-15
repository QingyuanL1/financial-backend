const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源成本暂估入库和计提情况数据
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    const query = `
      SELECT 
        segment_attribute,
        customer_attribute,
        year_beginning_amount,
        current_period_new_amount,
        current_year_cumulative,
        provision_rate
      FROM tuoyuan_cost_estimation 
      WHERE period = ?
      ORDER BY 
        CASE segment_attribute 
          WHEN '设备' THEN 1
          ELSE 2
        END,
        CASE customer_attribute 
          WHEN '电业项目' THEN 1
          WHEN '用户项目' THEN 2
          WHEN '贸易' THEN 3
          WHEN '代理设备' THEN 4
          WHEN '代理工程' THEN 5
          WHEN '代理设计' THEN 6
          ELSE 7
        END
    `;
    
    const [rows] = await pool.execute(query, [period]);
    
    res.json({
      success: true,
      data: {
        items: rows
      }
    });
  } catch (error) {
    console.error('获取拓源成本暂估入库和计提情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存拓源成本暂估入库和计提情况数据
router.post('/', async (req, res) => {
  let connection;
  try {
    const { period, data } = req.body;
    
    if (!period || !data || !data.items) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 删除该期间的现有数据
    await connection.execute(
      'DELETE FROM tuoyuan_cost_estimation WHERE period = ?',
      [period]
    );

    // 插入新数据
    const insertQuery = `
      INSERT INTO tuoyuan_cost_estimation (
        period,
        segment_attribute,
        customer_attribute,
        year_beginning_amount,
        current_period_new_amount,
        current_year_cumulative,
        provision_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of data.items) {
      await connection.execute(insertQuery, [
        period,
        item.segmentAttribute,
        item.customerAttribute,
        item.yearBeginningAmount || 0,
        item.currentPeriodNewAmount || 0,
        item.currentYearCumulative || 0,
        item.provisionRate || 0
      ]);
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '数据保存成功'
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('保存拓源成本暂估入库和计提情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;