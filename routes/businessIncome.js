const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();
const { attachBusinessIncomeBudget } = require('../middleware/budgetMiddleware');

// 获取指定期间的营业收入结构与质量数据
router.get('/:period', attachBusinessIncomeBudget, async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 转换为日期格式 (YYYY-MM-01)
    const periodDate = `${period}-01`;
    
    const [rows] = await pool.execute(
      'SELECT * FROM business_income_structure WHERE period = ?',
      [periodDate]
    );

    if (rows.length === 0) {
      // 当没有数据时，返回预算数据
      try {
        const year = period.split('-')[0];
        console.log(`正在查询营业收入预算数据: period=${year}`);
        
        const [budgetRows] = await pool.execute(
          'SELECT category, customer, yearly_budget FROM budget_planning WHERE table_key = ? AND period = ?',
          ['business_income_structure_quality', year]
        );
        
        console.log('预算数据查询结果:', budgetRows);
        
        // 构建预算数据结构
        const budgetData = [
          { id: 1, category: '主营业务', yearlyPlan: 0, currentTotal: 0 },
          { id: 2, category: '非主营业务', yearlyPlan: 0, currentTotal: 0 }
        ];
        
        // 填充预算数据
        budgetRows.forEach(row => {
          const item = budgetData.find(item => item.category === row.customer || item.category === row.category);
          if (item) {
            item.yearlyPlan = parseFloat(row.yearly_budget);
          }
        });
        
        return res.json({
          success: true,
          data: budgetData,
          period: period,
          isDefault: true
        });
      } catch (budgetError) {
        console.error('获取预算数据失败:', budgetError);
        return res.status(404).json({ error: '该期间的营业收入结构与质量数据不存在' });
      }
    }

    res.json({
      success: true,
      data: rows[0].data,
      period: rows[0].period,
      updated_at: rows[0].updated_at
    });
  } catch (error) {
    console.error('获取营业收入结构与质量数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存/更新营业收入结构与质量数据
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
      `INSERT INTO business_income_structure (period, data) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data), 
       updated_at = CURRENT_TIMESTAMP`,
      [periodDate, jsonData]
    );

    res.json({
      success: true,
      message: result.insertId ? '营业收入结构与质量数据创建成功' : '营业收入结构与质量数据更新成功',
      id: result.insertId || result.insertId,
      period: periodDate
    });
  } catch (error) {
    console.error('保存营业收入结构与质量数据失败:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// 获取所有营业收入结构与质量数据列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, period, created_at, updated_at FROM business_income_structure ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('获取营业收入结构与质量数据列表失败:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// 删除指定期间的营业收入结构与质量数据
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    const periodDate = `${period}-01`;
    
    const [result] = await pool.execute(
      'DELETE FROM business_income_structure WHERE period = ?',
      [periodDate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '该期间的营业收入结构与质量数据不存在' });
    }

    res.json({
      success: true,
      message: '营业收入结构与质量数据删除成功'
    });
  } catch (error) {
    console.error('删除营业收入结构与质量数据失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;