const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取新签订单数据 - 年度计划 vs 当期累计
router.get('/new-orders/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取月度数据 - 按类别分组
    const [monthlyRows] = await pool.execute(`
      SELECT 
        period,
        category,
        SUM(yearly_plan) as yearly_plan,
        SUM(current_total) as current_total
      FROM new_orders 
      WHERE YEAR(CONCAT(period, '-01')) = ?
      GROUP BY period, category
      ORDER BY period, category
    `, [year]);

    // 获取年度汇总数据
    const [summaryRows] = await pool.execute(`
      SELECT 
        category,
        SUM(yearly_plan) as total_yearly_plan,
        SUM(current_total) as total_current
      FROM new_orders 
      WHERE YEAR(CONCAT(period, '-01')) = ?
      GROUP BY category
      ORDER BY category
    `, [year]);

    // 获取每个类别的年度计划固定值（按类别汇总所有yearly_plan）
    const [planRows] = await pool.execute(`
      SELECT 
        category,
        SUM(DISTINCT yearly_plan) as total_yearly_plan
      FROM new_orders 
      WHERE YEAR(CONCAT(period, '-01')) = ? AND period = (
        SELECT MIN(period) FROM new_orders 
        WHERE YEAR(CONCAT(period, '-01')) = ? AND category = new_orders.category
      )
      GROUP BY category
      ORDER BY category
    `, [year, year]);

    // 整理数据结构
    const categories = ['设备', '元件', '工程'];
    const months = [];
    const data = {};
    
    // 初始化数据结构
    categories.forEach(category => {
      const planData = planRows.find(row => row.category === category);
      data[category] = {
        yearly_plan: planData ? Number(planData.total_yearly_plan) : 0,
        current_total: []
      };
    });

    // 获取所有月份
    const allPeriods = [...new Set(monthlyRows.map(row => row.period))].sort();
    
    // 为每个月份和类别准备数据
    allPeriods.forEach(period => {
      const monthLabel = period.split('-')[1] + '月';
      if (!months.includes(monthLabel)) {
        months.push(monthLabel);
      }
      
      categories.forEach(category => {
        const found = monthlyRows.find(row => row.period === period && row.category === category);
        data[category].current_total.push(found ? Number(found.current_total) : 0);
      });
    });

    res.json({
      success: true,
      data: {
        months,
        categories,
        monthlyData: data,
        summary: summaryRows.reduce((acc, row) => {
          acc[row.category] = {
            yearly_plan: Number(row.total_yearly_plan),
            current_total: Number(row.total_current),
            completion_rate: row.total_yearly_plan > 0 ? 
              Math.round((row.total_current / row.total_yearly_plan) * 100) : 0
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('获取新签订单数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新签订单数据失败',
      error: error.message
    });
  }
});

// 获取新签订单分项占比数据
router.get('/new-orders-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        category,
        SUM(current_total) as total_amount
      FROM new_orders 
      WHERE YEAR(CONCAT(period, '-01')) = ? AND current_total > 0
      GROUP BY category
      ORDER BY total_amount DESC
    `, [year]);

    const total = rows.reduce((sum, row) => sum + Number(row.total_amount), 0);
    
    const pieData = rows.map(row => ({
      name: row.category,
      value: Number(row.total_amount),
      percentage: total > 0 ? Number(((row.total_amount / total) * 100).toFixed(1)) : 0
    }));

    res.json({
      success: true,
      data: pieData
    });

  } catch (error) {
    console.error('获取新签订单分项数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新签订单分项数据失败',
      error: error.message
    });
  }
});

// 获取成本中心数据 - 年度分析
router.get('/cost-center/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取该年度所有月份的成本中心数据
    const [rows] = await pool.execute(`
      SELECT period, data 
      FROM cost_center_structure 
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的成本中心数据'
      });
    }

    // 处理数据
    const months = [];
    const monthlyData = {
      equipment: { currentPeriodTotal: [], cumulativeIncome: [] },
      component: { currentPeriodTotal: [], cumulativeIncome: [] },
      engineering: { currentPeriodTotal: [], cumulativeIncome: [] },
      nonMainBusiness: { currentPeriodTotal: [], cumulativeIncome: [] }
    };

    let yearSummary = {
      equipment: { currentPeriodTotal: 0, cumulativeIncome: 0 },
      component: { currentPeriodTotal: 0, cumulativeIncome: 0 },
      engineering: { currentPeriodTotal: 0, cumulativeIncome: 0 },
      nonMainBusiness: { currentPeriodTotal: 0, cumulativeIncome: 0 }
    };

    rows.forEach(row => {
      const monthLabel = row.period.split('-')[1] + '月';
      months.push(monthLabel);
      
      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.error('JSON解析错误:', e, 'data:', row.data);
        return;
      }
      
      // 汇总设备数据
      const equipmentTotal = data.equipmentData.reduce((sum, item) => ({
        currentPeriodTotal: sum.currentPeriodTotal + item.currentPeriodTotal,
        cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
      }), { currentPeriodTotal: 0, cumulativeIncome: 0 });
      
      monthlyData.equipment.currentPeriodTotal.push(Number(equipmentTotal.currentPeriodTotal));
      monthlyData.equipment.cumulativeIncome.push(Number(equipmentTotal.cumulativeIncome));
      
      // 汇总元件数据
      const componentTotal = data.componentData.reduce((sum, item) => ({
        currentPeriodTotal: sum.currentPeriodTotal + item.currentPeriodTotal,
        cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
      }), { currentPeriodTotal: 0, cumulativeIncome: 0 });
      
      monthlyData.component.currentPeriodTotal.push(Number(componentTotal.currentPeriodTotal));
      monthlyData.component.cumulativeIncome.push(Number(componentTotal.cumulativeIncome));
      
      // 汇总工程数据
      const engineeringTotal = data.engineeringData.reduce((sum, item) => ({
        currentPeriodTotal: sum.currentPeriodTotal + item.currentPeriodTotal,
        cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
      }), { currentPeriodTotal: 0, cumulativeIncome: 0 });
      
      monthlyData.engineering.currentPeriodTotal.push(Number(engineeringTotal.currentPeriodTotal));
      monthlyData.engineering.cumulativeIncome.push(Number(engineeringTotal.cumulativeIncome));
      
      // 非主营业务数据
      monthlyData.nonMainBusiness.currentPeriodTotal.push(Number(data.nonMainBusiness.currentPeriodTotal));
      monthlyData.nonMainBusiness.cumulativeIncome.push(Number(data.nonMainBusiness.cumulativeIncome));
      
      // 累加年度汇总
      yearSummary.equipment.currentPeriodTotal += equipmentTotal.currentPeriodTotal;
      yearSummary.equipment.cumulativeIncome += equipmentTotal.cumulativeIncome;
      yearSummary.component.currentPeriodTotal += componentTotal.currentPeriodTotal;
      yearSummary.component.cumulativeIncome += componentTotal.cumulativeIncome;
      yearSummary.engineering.currentPeriodTotal += engineeringTotal.currentPeriodTotal;
      yearSummary.engineering.cumulativeIncome += engineeringTotal.cumulativeIncome;
      yearSummary.nonMainBusiness.currentPeriodTotal += data.nonMainBusiness.currentPeriodTotal;
      yearSummary.nonMainBusiness.cumulativeIncome += data.nonMainBusiness.cumulativeIncome;
    });

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary: yearSummary
      }
    });

  } catch (error) {
    console.error('获取成本中心分析数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取成本中心分析数据失败',
      error: error.message
    });
  }
});

// 获取成本中心分项占比数据
router.get('/cost-center-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取最新一个月的数据用于占比分析
    const [rows] = await pool.execute(`
      SELECT data 
      FROM cost_center_structure 
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period DESC
      LIMIT 1
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的成本中心数据'
      });
    }

    let data;
    try {
      data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    } catch (e) {
      console.error('JSON解析错误:', e);
      return res.status(500).json({
        success: false,
        message: 'JSON数据解析失败'
      });
    }
    
    // 计算各板块的当期计入损益累计
    const equipmentTotal = data.equipmentData.reduce((sum, item) => sum + item.currentPeriodTotal, 0);
    const componentTotal = data.componentData.reduce((sum, item) => sum + item.currentPeriodTotal, 0);
    const engineeringTotal = data.engineeringData.reduce((sum, item) => sum + item.currentPeriodTotal, 0);
    const nonMainTotal = data.nonMainBusiness.currentPeriodTotal;
    
    const totalAmount = equipmentTotal + componentTotal + engineeringTotal + nonMainTotal;
    
    const pieData = [
      {
        name: '设备',
        value: Number(equipmentTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((equipmentTotal / totalAmount) * 100).toFixed(1)) : 0
      },
      {
        name: '元件',
        value: Number(componentTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((componentTotal / totalAmount) * 100).toFixed(1)) : 0
      },
      {
        name: '工程',
        value: Number(engineeringTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((engineeringTotal / totalAmount) * 100).toFixed(1)) : 0
      },
      {
        name: '非主营业务',
        value: Number(nonMainTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((nonMainTotal / totalAmount) * 100).toFixed(1)) : 0
      }
    ].filter(item => item.value > 0); // 过滤掉为0的项

    res.json({
      success: true,
      data: pieData
    });

  } catch (error) {
    console.error('获取成本中心分项数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取成本中心分项数据失败',
      error: error.message
    });
  }
});

// 获取营业收入数据 - 年度分析
router.get('/business-income/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取该年度所有月份的营业收入数据
    const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(period, '%Y-%m') as period, data 
      FROM business_income_structure 
      WHERE YEAR(period) = ?
      ORDER BY period
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的营业收入数据'
      });
    }

    // 处理数据
    const months = [];
    const monthlyData = {
      main: { yearlyPlan: 0, currentTotal: [] },
      nonMain: { yearlyPlan: 0, currentTotal: [] }
    };

    let yearSummary = {
      main: { yearlyPlan: 0, currentTotal: 0, completion_rate: 0 },
      nonMain: { yearlyPlan: 0, currentTotal: 0, completion_rate: 0 }
    };

    rows.forEach(row => {
      const monthLabel = row.period.split('-')[1] + '月';
      months.push(monthLabel);
      
      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.error('JSON解析错误:', e, 'data:', row.data);
        return;
      }

      // 查找主营业务和非主营业务数据
      const mainBusiness = data.find(item => item.category === '主营业务') || {};
      const nonMainBusiness = data.find(item => item.category === '非主营业务') || {};
      
      // 设置年度计划（使用第一个月的数据）
      if (months.length === 1) {
        monthlyData.main.yearlyPlan = mainBusiness.yearlyPlan || 0;
        monthlyData.nonMain.yearlyPlan = nonMainBusiness.yearlyPlan || 0;
      }
      
      // 添加当期累计数据
      monthlyData.main.currentTotal.push(Number(mainBusiness.currentTotal || 0));
      monthlyData.nonMain.currentTotal.push(Number(nonMainBusiness.currentTotal || 0));
      
      // 累加年度汇总
      yearSummary.main.currentTotal += Number(mainBusiness.currentTotal || 0);
      yearSummary.nonMain.currentTotal += Number(nonMainBusiness.currentTotal || 0);
    });

    // 设置年度计划和完成率
    yearSummary.main.yearlyPlan = monthlyData.main.yearlyPlan;
    yearSummary.nonMain.yearlyPlan = monthlyData.nonMain.yearlyPlan;
    
    yearSummary.main.completion_rate = yearSummary.main.yearlyPlan > 0 ? 
      Math.round((yearSummary.main.currentTotal / yearSummary.main.yearlyPlan) * 100) : 0;
    yearSummary.nonMain.completion_rate = yearSummary.nonMain.yearlyPlan > 0 ? 
      Math.round((yearSummary.nonMain.currentTotal / yearSummary.nonMain.yearlyPlan) * 100) : 0;

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary: yearSummary
      }
    });

  } catch (error) {
    console.error('获取营业收入分析数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取营业收入分析数据失败',
      error: error.message
    });
  }
});

// 获取营业收入分项占比数据
router.get('/business-income-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取最新一个月的数据用于占比分析
    const [rows] = await pool.execute(`
      SELECT data 
      FROM business_income_structure 
      WHERE YEAR(period) = ?
      ORDER BY period DESC
      LIMIT 1
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的营业收入数据'
      });
    }

    let data;
    try {
      data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    } catch (e) {
      console.error('JSON解析错误:', e);
      return res.status(500).json({
        success: false,
        message: 'JSON数据解析失败'
      });
    }
    
    // 计算各分项的占比
    const totalAmount = data.reduce((sum, item) => sum + (item.currentTotal || 0), 0);
    
    const pieData = data
      .filter(item => item.currentTotal > 0)
      .map(item => ({
        name: item.category,
        value: Number(item.currentTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((item.currentTotal / totalAmount) * 100).toFixed(1)) : 0
      }));

    res.json({
      success: true,
      data: pieData
    });

  } catch (error) {
    console.error('获取营业收入分项数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取营业收入分项数据失败',
      error: error.message
    });
  }
});

module.exports = router;