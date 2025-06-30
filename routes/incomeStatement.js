const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const moment = require('moment');

// 保存利润表数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;
    console.log('保存请求 - 期间:', period, '数据类型:', typeof data);
    
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据不能为空' });
    }

    // 处理期间格式，支持 YYYY-MM 或 YYYY-MM-DD
    let formattedPeriod;
    if (period.length === 7) { // YYYY-MM 格式
      formattedPeriod = `${period}-01`; // 转换为当月第一天
    } else {
      formattedPeriod = moment(period).format('YYYY-MM-DD');
    }
    
    console.log('格式化后的期间:', formattedPeriod);
    
    // 将数据转换为JSON字符串存储
    const dataJson = typeof data === 'string' ? data : JSON.stringify(data);

    // 检查是否已存在该期间的数据
    const [existing] = await pool.query(
      'SELECT id FROM income_statement WHERE period = ?',
      [formattedPeriod]
    );

    if (existing.length > 0) {
      // 更新现有数据
      await pool.query(
        'UPDATE income_statement SET data = ?, updated_at = NOW() WHERE period = ?',
        [dataJson, formattedPeriod]
      );
      console.log('数据更新成功，期间:', formattedPeriod);
      res.json({ success: true, message: '利润表数据更新成功', action: 'updated' });
    } else {
      // 插入新数据
      await pool.query(
        'INSERT INTO income_statement (period, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [formattedPeriod, dataJson]
      );
      console.log('数据保存成功，期间:', formattedPeriod);
      res.json({ success: true, message: '利润表数据保存成功', action: 'created' });
    }
  } catch (error) {
    console.error('保存利润表数据时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取指定年份的利润表数据（用于图表显示）- 必须放在/:period之前避免路由冲突
router.get('/annual/:year', async (req, res) => {
  try {
    const year = req.params.year;
    
    // 验证年份格式
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: '无效的年份格式，请使用 YYYY 格式。' });
    }
    
    // 构造查询日期范围 - 整年
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const [rows] = await pool.query(
      'SELECT period, data FROM income_statement WHERE period >= ? AND period <= ? ORDER BY period ASC',
      [startDate, endDate]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '指定年份的数据不存在' });
    }

    // 处理查询结果，提取所需数据
    const annualData = rows.map(row => {
      const period = moment(row.period).format('YYYY-MM');
      let parsedData;
      
      try {
        parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (error) {
        console.error(`解析${period}的数据时出错:`, error);
        parsedData = {};
      }
      
      // 只提取主营业务收入和净利润
      const extractedData = {
        main_business_revenue: parsedData.main_business_revenue || { current_amount: null, year_amount: null },
        net_profit: parsedData.net_profit || { current_amount: null, year_amount: null }
      };
      
      // 转换为JSON字符串
      return {
        period,
        data: JSON.stringify(extractedData)
      };
    });

    res.json({ year, data: annualData });
  } catch (error) {
    console.error('获取全年利润表数据时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取指定期间的利润表数据
router.get('/:period', async (req, res) => {
  try {
    const period = req.params.period;
    console.log('=== 收到期间查询请求 ===');
    console.log('请求的期间:', period);
    
    // 处理期间格式，支持 YYYY-MM 或 YYYY-MM-DD
    let formattedPeriod;
    if (period.length === 7) { // YYYY-MM 格式
      formattedPeriod = `${period}-01`; // 转换为当月第一天
    } else if (period.length === 10) { // YYYY-MM-DD 格式
      formattedPeriod = period;
    } else {
      return res.status(400).json({ error: '无效的期间格式' });
    }
    
    console.log('格式化后的期间:', formattedPeriod);
    
    // 检查数据库连接
    if (!pool) {
      console.error('数据库连接池未初始化');
      return res.status(500).json({ error: '数据库连接错误' });
    }
    
    console.log('开始数据库查询...');
    const [rows] = await pool.query(
      'SELECT period, data FROM income_statement WHERE period = ?',
      [formattedPeriod]
    );
    console.log('查询结果行数:', rows.length);

    if (rows.length === 0) {
      console.log('未找到数据，期间:', formattedPeriod);
      return res.status(404).json({ error: '指定期间的数据不存在' });
    }

    const row = rows[0];
    console.log('找到数据，原始数据类型:', typeof row.data);
    let parsedData;
    
    try {
      parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      console.log('数据解析成功');
    } catch (parseError) {
      console.error('解析数据时出错:', parseError);
      parsedData = {};
    }

    console.log('=== 返回成功响应 ===');
    res.json({ 
      success: true, 
      data: parsedData,
      period: formattedPeriod
    });
  } catch (error) {
    console.error('=== 发生未捕获错误 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: '服务器内部错误', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;