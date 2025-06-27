const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取指定期间的产值结构与质量数据
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM production_structure WHERE period = ?',
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
    console.error('获取产值结构数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存或更新产值结构与质量数据
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
      `INSERT INTO production_structure (period, data)
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data),
       updated_at = CURRENT_TIMESTAMP`,
      [period, JSON.stringify(data)]
    );

    res.json({
      success: true,
      message: '产值结构数据保存成功',
      period
    });
  } catch (error) {
    console.error('保存产值结构数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 更新产值结构与质量数据
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
      `UPDATE production_structure 
       SET data = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE period = ?`,
      [JSON.stringify(data), period]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '未找到指定期间的数据' });
    }

    res.json({
      success: true,
      message: '产值结构数据更新成功',
      period
    });
  } catch (error) {
    console.error('更新产值结构数据失败:', error);
    res.status(500).json({ error: '更新数据失败' });
  }
});

// 获取所有产值结构与质量数据
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT period, data, created_at, updated_at FROM production_structure ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取所有产值结构数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 删除指定期间的产值结构与质量数据
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    const [result] = await pool.execute(
      'DELETE FROM production_structure WHERE period = ?',
      [period]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '未找到指定期间的数据' });
    }

    res.json({
      success: true,
      message: '产值结构数据删除成功',
      period
    });
  } catch (error) {
    console.error('删除产值结构数据失败:', error);
    res.status(500).json({ error: '删除数据失败' });
  }
});

module.exports = router;