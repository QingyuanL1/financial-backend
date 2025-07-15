const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取指定期间的部门成本中心实际发生情况
router.get('/:period', createBudgetMiddleware('department_cost_center_actual'), async (req, res) => {
  try {
    const { period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM department_cost_center WHERE period = ?',
      [period]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '未找到指定期间的数据' });
    }

    res.json({
      success: true,
      data: rows[0].data,
      period: rows[0].period
    });
  } catch (error) {
    console.error('获取部门成本中心数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存或更新部门成本中心实际发生情况
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    if (!data) {
      return res.status(400).json({ error: '数据不能为空' });
    }

    await pool.execute(
      `INSERT INTO department_cost_center (period, data)
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data),
       updated_at = CURRENT_TIMESTAMP`,
      [period, JSON.stringify(data)]
    );

    res.json({
      success: true,
      message: '部门成本中心数据保存成功',
      period
    });
  } catch (error) {
    console.error('保存部门成本中心数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 更新部门成本中心实际发生情况
router.put('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { data } = req.body;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    if (!data) {
      return res.status(400).json({ error: '数据不能为空' });
    }

    const [result] = await pool.execute(
      `UPDATE department_cost_center 
       SET data = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE period = ?`,
      [JSON.stringify(data), period]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '未找到指定期间的数据' });
    }

    res.json({
      success: true,
      message: '部门成本中心数据更新成功',
      period
    });
  } catch (error) {
    console.error('更新部门成本中心数据失败:', error);
    res.status(500).json({ error: '更新数据失败' });
  }
});

// 获取所有部门成本中心实际发生情况数据
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT period, data, created_at, updated_at FROM department_cost_center ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取所有部门成本中心数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 删除指定期间的部门成本中心实际发生情况
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    const [result] = await pool.execute(
      'DELETE FROM department_cost_center WHERE period = ?',
      [period]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '未找到指定期间的数据' });
    }

    res.json({
      success: true,
      message: '部门成本中心数据删除成功',
      period
    });
  } catch (error) {
    console.error('删除部门成本中心数据失败:', error);
    res.status(500).json({ error: '删除数据失败' });
  }
});

module.exports = router;