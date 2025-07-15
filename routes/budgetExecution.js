const express = require('express');
const mysql = require('mysql2/promise');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 数据库连接池
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 创建预算执行表的SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS budget_execution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
  equipment_data JSON COMMENT '设备数据',
  components_data JSON COMMENT '元件数据', 
  engineering_data JSON COMMENT '工程数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算执行情况表';
`;

// 初始化表
(async () => {
  try {
    await pool.execute(createTableSQL);
    console.log('预算执行表初始化完成');
  } catch (error) {
    console.error('预算执行表初始化失败:', error);
  }
})();

// 保存预算执行数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;
    
    if (!period || !data) {
      return res.status(400).json({
        success: false,
        error: '期间和数据都是必填项'
      });
    }

    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        success: false,
        error: '期间格式错误，应为YYYY-MM格式'
      });
    }

    console.log('保存预算执行数据:', { period, data });

    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 语法
    await pool.execute(`
      INSERT INTO budget_execution (period, equipment_data, components_data, engineering_data)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        equipment_data = VALUES(equipment_data),
        components_data = VALUES(components_data),
        engineering_data = VALUES(engineering_data),
        updated_at = CURRENT_TIMESTAMP
    `, [
      period,
      JSON.stringify(data.equipment || []),
      JSON.stringify(data.components || []),
      JSON.stringify(data.engineering || [])
    ]);

    res.json({
      success: true,
      message: '预算执行数据保存成功'
    });

  } catch (error) {
    console.error('保存预算执行数据失败:', error);
    res.status(500).json({
      success: false,
      error: '保存失败，请重试'
    });
  }
});

// 获取预算执行数据
router.get('/:period', createBudgetMiddleware('budget_execution'), async (req, res) => {
  try {
    const { period } = req.params;

    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        success: false,
        error: '期间格式错误，应为YYYY-MM格式'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM budget_execution WHERE period = ?',
      [period]
    );

    if (rows.length === 0) {
      // 没有数据时返回空数据结构，让预算中间件附加预算信息
      return res.json({
        success: true,
        data: {
          equipment: [],
          components: [],
          engineering: []
        },
        period: period,
        message: '该期间暂无数据，已加载预算信息'
      });
    }

    const row = rows[0];
    
    // MySQL会自动解析JSON字段，无需手动解析
    const data = {
      equipment: row.equipment_data || [],
      components: row.components_data || [],
      engineering: row.engineering_data || []
    };

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('获取预算执行数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取数据失败'
    });
  }
});

// 删除预算执行数据
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM budget_execution WHERE period = ?',
      [period]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到要删除的数据'
      });
    }

    res.json({
      success: true,
      message: '数据删除成功'
    });

  } catch (error) {
    console.error('删除预算执行数据失败:', error);
    res.status(500).json({
      success: false,
      error: '删除失败'
    });
  }
});

module.exports = router;