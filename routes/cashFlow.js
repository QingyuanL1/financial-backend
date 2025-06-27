const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取指定期间的现金流量表
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 转换为日期格式 (YYYY-MM-01)
    const periodDate = `${period}-01`;
    
    const [rows] = await pool.execute(
      'SELECT * FROM cash_flow WHERE period = ?',
      [periodDate]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '该期间的现金流量表数据不存在' });
    }

    res.json({
      success: true,
      data: rows[0].data,
      period: rows[0].period,
      updated_at: rows[0].updated_at
    });
  } catch (error) {
    console.error('获取现金流量表失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存/更新现金流量表
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;

    // 验证输入
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据都是必需的' });
    }

    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 转换为日期格式
    const periodDate = `${period}-01`;
    
    // 将数据转换为JSON字符串
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

    // 使用 ON DUPLICATE KEY UPDATE 语法进行插入或更新
    const [result] = await pool.execute(
      `INSERT INTO cash_flow (period, data) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data), 
       updated_at = CURRENT_TIMESTAMP`,
      [periodDate, jsonData]
    );

    res.json({
      success: true,
      message: result.insertId ? '现金流量表创建成功' : '现金流量表更新成功',
      id: result.insertId || result.insertId,
      period: periodDate
    });
  } catch (error) {
    console.error('保存现金流量表失败:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// 获取所有现金流量表列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, period, created_at, updated_at FROM cash_flow ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('获取现金流量表列表失败:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// 删除指定期间的现金流量表
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    const periodDate = `${period}-01`;
    
    const [result] = await pool.execute(
      'DELETE FROM cash_flow WHERE period = ?',
      [periodDate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '该期间的现金流量表不存在' });
    }

    res.json({
      success: true,
      message: '现金流量表删除成功'
    });
  } catch (error) {
    console.error('删除现金流量表失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;