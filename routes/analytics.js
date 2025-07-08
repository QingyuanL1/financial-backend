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

    // 获取每个类别的年度计划固定值（使用固定的年度计划值）
    let planRows = [];
    if (year === '2025') {
      planRows = [
        { category: '设备', total_yearly_plan: 62000 },
        { category: '元件', total_yearly_plan: 4000 },
        { category: '工程', total_yearly_plan: 14000 }
      ];
    } else if (year === '2024') {
      planRows = [
        { category: '设备', total_yearly_plan: 43000 },
        { category: '元件', total_yearly_plan: 20000 },
        { category: '工程', total_yearly_plan: 25000 }
      ];
    } else {
      // 对于其他年份，使用数据库查询
      const [dbPlanRows] = await pool.execute(`
        SELECT 
          category,
          SUM(yearly_plan) as total_yearly_plan
        FROM new_orders 
        WHERE YEAR(CONCAT(period, '-01')) = ? AND period = (
          SELECT MAX(period) FROM new_orders 
          WHERE YEAR(CONCAT(period, '-01')) = ?
        )
        GROUP BY category
        ORDER BY category
      `, [year, year]);
      planRows = dbPlanRows;
    }

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
        summary: categories.reduce((acc, category) => {
          const planData = planRows.find(row => row.category === category);
          const summaryData = summaryRows.find(row => row.category === category);
          const yearlyPlan = planData ? Number(planData.total_yearly_plan) : 0;
          const currentTotal = summaryData ? Number(summaryData.total_current) : 0;
          
          acc[category] = {
            yearly_plan: yearlyPlan,
            current_total: currentTotal,
            completion_rate: yearlyPlan > 0 ? 
              Math.round((currentTotal / yearlyPlan) * 100) : 0
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

    // 添加年度计划信息
    let yearlyPlan = 0;
    if (year === '2025') {
      yearlyPlan = 8343.71; // 2025年固定年度计划
    }

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary: yearSummary,
        yearlyPlan: yearlyPlan
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

// 获取净利润数据
router.get('/net-profit/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentMonth = new Date().getMonth() + 1;
    const availableMonths = months.slice(0, currentMonth);
    
    console.log(`Fetching net profit data for year: ${year}`);
    
    // 获取该年度的利润表数据 - 注意日期格式调整
    // 在数据库中，期间存储为 DATE 类型 (例如 2025-06-01)，而不是年月格式
    const query = `
      SELECT DATE_FORMAT(period, '%Y-%m') as period_ym, data 
      FROM income_statement 
      WHERE (YEAR(period) = ? OR YEAR(period) = ?)
      ORDER BY period ASC
    `;
    
    const [rows] = await pool.execute(query, [year, parseInt(year)-1]);
    console.log(`Found ${rows.length} income statement records`);
    
    if (rows.length === 0) {
      // 如果没有数据，返回默认值
      return res.json({
        success: true,
        data: {
          months: availableMonths.map(month => `${month}月`),
          monthlyData: {
            currentTotal: availableMonths.map((_, i) => 5000 * (i + 1)),
            previousYear: availableMonths.map((_, i) => 4500 * (i + 1)),
            yearlyPlan: 40000
          },
          summary: {
            yearlyPlan: 40000,
            currentTotal: 30000,
            previousYearSame: 27000,
            growth_amount: 3000,
            growth_rate: 11.11,
            completion_rate: 75
          }
        }
      });
    }
    
    // 处理数据
    const monthlyData = {
      currentTotal: Array(availableMonths.length).fill(0),
      previousYear: Array(availableMonths.length).fill(0),
      yearlyPlan: 40000 // 设置默认值为4000万
    };
    
    // 提取当前年度和上一年度数据
    for (const row of rows) {
      const [rowYear, rowMonth] = row.period_ym.split('-');
      const monthIndex = parseInt(rowMonth) - 1;
      
      try {
        const parsedData = typeof row.data === 'string' ? 
          JSON.parse(row.data) : row.data;
        
        // 获取利润总额数据
        const profitValue = parsedData.total_profit && 
          parsedData.total_profit.current_amount !== null ? 
          Number(parsedData.total_profit.current_amount) : 0;
        
        console.log(`Period: ${row.period_ym}, Total profit: ${profitValue}`);
          
        // 根据年份分配数据
        if (rowYear === year) {
          // 如果月份在可用月份范围内
          if (monthIndex < availableMonths.length) {
            monthlyData.currentTotal[monthIndex] = profitValue;
          }
        } else if (rowYear === (parseInt(year) - 1).toString()) {
          // 如果月份在可用月份范围内
          if (monthIndex < availableMonths.length) {
            monthlyData.previousYear[monthIndex] = profitValue;
          }
        }
      } catch (error) {
        console.error(`解析数据失败: ${row.period_ym}`, error);
      }
    }
    
    // 计算汇总数据
    const currentTotal = monthlyData.currentTotal.reduce((sum, value) => sum + value, 0);
    const previousYearSame = monthlyData.previousYear.reduce((sum, value) => sum + value, 0);
    const growthAmount = currentTotal - previousYearSame;
    const growthRate = previousYearSame !== 0 ? 
      parseFloat(((growthAmount / Math.abs(previousYearSame)) * 100).toFixed(2)) : 0;
    const completionRate = parseFloat(((currentTotal / monthlyData.yearlyPlan) * 100).toFixed(2));
    
    // 返回结果
    res.json({
      success: true,
      data: {
        months: availableMonths.map(month => `${month}月`),
        monthlyData,
        summary: {
          yearlyPlan: monthlyData.yearlyPlan,
          currentTotal,
          previousYearSame,
          growth_amount: growthAmount,
          growth_rate: growthRate,
          completion_rate: completionRate
        }
      }
    });
    
  } catch (error) {
    console.error('获取净利润数据失败:', error);
    res.status(500).json({ success: false, message: '获取净利润数据失败', error: error.message });
  }
});

// 获取净利润结构占比
router.get('/net-profit-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const period = `${year}-${currentMonthStr}`;
    
    // 查询利润表中的最新数据
    const [rows] = await pool.execute(
      'SELECT data FROM income_statement WHERE period = ?',
      [period]
    );
    
    if (rows.length === 0) {
      // 如果当前期间没有数据，尝试获取最近的一期数据
      const [latestRows] = await pool.execute(
        'SELECT data FROM income_statement WHERE period LIKE ? ORDER BY period DESC LIMIT 1',
        [`${year}%`]
      );
      
      if (latestRows.length === 0) {
        return res.json({
          success: true,
          data: [
            { name: '营业利润', value: 30000, percentage: 75 },
            { name: '营业外收入', value: 12000, percentage: 30 },
            { name: '营业外支出', value: -2000, percentage: 5 },
            { name: '所得税费用', value: -2000, percentage: 5 }
          ] // 返回示例数据
        });
      }
      
      rows[0] = latestRows[0]; // 使用最近一期数据
    }
    
    // 解析数据
    let rawData;
    try {
      rawData = typeof rows[0].data === 'string' ? 
        JSON.parse(rows[0].data) : rows[0].data;
    } catch (e) {
      console.error('解析利润表数据失败:', e);
      return res.status(500).json({ 
        success: false, 
        message: '解析利润表数据失败' 
      });
    }
    
    // 提取与净利润相关的主要组成部分
    const components = [
      { 
        name: '营业利润', 
        value: rawData.operating_profit && rawData.operating_profit.current_amount ? 
          Number(rawData.operating_profit.current_amount) : 0 
      },
      { 
        name: '营业外收入', 
        value: rawData.non_operating_income && rawData.non_operating_income.current_amount ? 
          Number(rawData.non_operating_income.current_amount) : 0 
      },
      { 
        name: '营业外支出', 
        value: rawData.non_operating_expenses && rawData.non_operating_expenses.current_amount ? 
          -Math.abs(Number(rawData.non_operating_expenses.current_amount)) : 0 
      },
      { 
        name: '所得税费用', 
        value: rawData.income_tax_expense && rawData.income_tax_expense.current_amount ? 
          -Math.abs(Number(rawData.income_tax_expense.current_amount)) : 0 
      }
    ];
    
    // 计算总和和百分比
    const totalAbsValue = components.reduce((sum, item) => sum + Math.abs(item.value), 0);
    const result = components.map(item => ({
      name: item.name,
      value: item.value,
      percentage: totalAbsValue !== 0 ? 
        parseFloat(((Math.abs(item.value) / totalAbsValue) * 100).toFixed(1)) : 0
    }));
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('获取净利润结构占比失败:', error);
    res.status(500).json({ success: false, message: '获取净利润结构占比失败', error: error.message });
  }
});

// 获取所有分析模块的完成率汇总
router.get('/completion-rates/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const completionRates = {};
    
    // 1. 获取新签订单完成率
    try {
      const [newOrdersRows] = await pool.execute(`
        SELECT 
          category,
          SUM(yearly_plan) as total_yearly_plan,
          SUM(current_total) as total_current
        FROM new_orders 
        WHERE YEAR(CONCAT(period, '-01')) = ?
        GROUP BY category
        ORDER BY category
      `, [year]);

      // 使用固定的年度计划值
      let planRows = [];
      if (year === '2025') {
        planRows = [
          { category: '设备', total_yearly_plan: 62000 },
          { category: '元件', total_yearly_plan: 4000 },
          { category: '工程', total_yearly_plan: 14000 }
        ];
      } else if (year === '2024') {
        planRows = [
          { category: '设备', total_yearly_plan: 43000 },
          { category: '元件', total_yearly_plan: 20000 },
          { category: '工程', total_yearly_plan: 25000 }
        ];
      }

      let totalPlan = 0;
      let totalCurrent = 0;
      
      ['设备', '元件', '工程'].forEach(category => {
        const planData = planRows.find(row => row.category === category);
        const currentData = newOrdersRows.find(row => row.category === category);
        
        totalPlan += planData ? Number(planData.total_yearly_plan) : 0;
        totalCurrent += currentData ? Number(currentData.total_current) : 0;
      });
      
      completionRates.newOrders = totalPlan > 0 ? Math.round((totalCurrent / totalPlan) * 100) : 0;
    } catch (error) {
      console.error('获取新签订单完成率失败:', error);
      completionRates.newOrders = 0;
    }

    // 2. 获取成本中心完成率 - 直接调用现有API逻辑
    try {
      // 获取该年度所有月份的成本中心数据
      const [costCenterRows] = await pool.execute(`
        SELECT period, data 
        FROM cost_center_structure 
        WHERE YEAR(CONCAT(period, '-01')) = ?
        ORDER BY period
      `, [year]);

      if (costCenterRows.length > 0) {
        // 使用与 /cost-center/:year API 相同的逻辑
        let yearSummary = {
          equipment: { cumulativeIncome: 0 },
          component: { cumulativeIncome: 0 },
          engineering: { cumulativeIncome: 0 },
          nonMainBusiness: { cumulativeIncome: 0 }
        };

        costCenterRows.forEach(row => {
          let data;
          try {
            data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          } catch (e) {
            console.error('JSON解析错误:', e);
            return;
          }
          
          // 汇总设备数据
          const equipmentTotal = data.equipmentData.reduce((sum, item) => ({
            cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
          }), { cumulativeIncome: 0 });
          
          // 汇总元件数据
          const componentTotal = data.componentData.reduce((sum, item) => ({
            cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
          }), { cumulativeIncome: 0 });
          
          // 汇总工程数据
          const engineeringTotal = data.engineeringData.reduce((sum, item) => ({
            cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
          }), { cumulativeIncome: 0 });
          
          // 累加年度汇总
          yearSummary.equipment.cumulativeIncome += equipmentTotal.cumulativeIncome;
          yearSummary.component.cumulativeIncome += componentTotal.cumulativeIncome;
          yearSummary.engineering.cumulativeIncome += engineeringTotal.cumulativeIncome;
          yearSummary.nonMainBusiness.cumulativeIncome += data.nonMainBusiness.cumulativeIncome;
        });

        // 计算总累计收入
        const totalCumulativeIncome = 
          yearSummary.equipment.cumulativeIncome +
          yearSummary.component.cumulativeIncome +
          yearSummary.engineering.cumulativeIncome +
          yearSummary.nonMainBusiness.cumulativeIncome;

        // 年度计划
        const yearlyPlan = year === '2025' ? 8343.71 : 8000;
        
        // 计算完成率
        completionRates.costCenter = yearlyPlan > 0 ? 
          Math.round((totalCumulativeIncome / yearlyPlan) * 100) : 0;
      } else {
        completionRates.costCenter = 0;
      }
    } catch (error) {
      console.error('获取成本中心完成率失败:', error);
      completionRates.costCenter = 0;
    }

    // 3. 获取营业收入完成率
    try {
      const [businessIncomeRows] = await pool.execute(`
        SELECT data 
        FROM business_income_structure 
        WHERE YEAR(period) = ?
        ORDER BY period DESC
        LIMIT 1
      `, [year]);

      if (businessIncomeRows.length > 0) {
        const data = typeof businessIncomeRows[0].data === 'string' ? 
          JSON.parse(businessIncomeRows[0].data) : businessIncomeRows[0].data;
        
        const mainBusiness = data.find(item => item.category === '主营业务') || {};
        const yearlyPlan = mainBusiness.yearlyPlan || 0;
        const currentTotal = mainBusiness.currentTotal || 0;
        
        completionRates.businessIncome = yearlyPlan > 0 ? Math.round((currentTotal / yearlyPlan) * 100) : 0;
      } else {
        completionRates.businessIncome = 0;
      }
    } catch (error) {
      console.error('获取营业收入完成率失败:', error);
      completionRates.businessIncome = 0;
    }

    // 4. 获取净利润完成率
    try {
      const [netProfitRows] = await pool.execute(`
        SELECT data 
        FROM income_statement 
        WHERE YEAR(period) = ?
        ORDER BY period DESC
        LIMIT 1
      `, [year]);

      if (netProfitRows.length > 0) {
        const data = typeof netProfitRows[0].data === 'string' ? 
          JSON.parse(netProfitRows[0].data) : netProfitRows[0].data;
        
        const currentTotal = data.total_profit && data.total_profit.current_amount ? 
          Number(data.total_profit.current_amount) : 0;
        const yearlyPlan = 40000; // 默认年度计划
        
        completionRates.netProfit = yearlyPlan > 0 ? Math.round((currentTotal / yearlyPlan) * 100) : 0;
      } else {
        completionRates.netProfit = 0;
      }
    } catch (error) {
      console.error('获取净利润完成率失败:', error);
      completionRates.netProfit = 0;
    }

    res.json({
      success: true,
      data: completionRates
    });

  } catch (error) {
    console.error('获取分析模块完成率失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分析模块完成率失败',
      error: error.message
    });
  }
});

// 获取净资产收益率数据
router.get('/roe/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const currentMonth = new Date().getMonth() + 1;
    
    // 获取该年份所有月份的利润表数据
    const [incomeRows] = await pool.execute(`
      SELECT period, data 
      FROM income_statement 
      WHERE YEAR(period) = ?
      ORDER BY period ASC
    `, [year]);

    // 获取该年份所有月份的资产负债表数据
    const [balanceRows] = await pool.execute(`
      SELECT period, data 
      FROM balance_sheet 
      WHERE YEAR(period) = ?
      ORDER BY period ASC
    `, [year]);

    const months = [];
    const roeData = [];
    let latestROE = 0;
    let latestNetProfit = 0;
    let latestShareholderEquity = 0;
    let dataFound = false;

    // 生成月份标签
    for (let month = 1; month <= currentMonth; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const periodDate = `${year}-${monthStr}-01`;
      const monthLabel = `${month}月`;
      months.push(monthLabel);

      // 查找对应月份的数据
      const incomeData = incomeRows.find(row => {
        const rowMonth = row.period.getMonth() + 1;
        return rowMonth === month;
      });
      const balanceData = balanceRows.find(row => {
        const rowMonth = row.period.getMonth() + 1;
        return rowMonth === month;
      });

      let monthROE = 0;

      if (incomeData && balanceData) {
        try {
          const incomeJson = typeof incomeData.data === 'string' ? 
            JSON.parse(incomeData.data) : incomeData.data;
          const balanceJson = typeof balanceData.data === 'string' ? 
            JSON.parse(balanceData.data) : balanceData.data;

          const netProfit = incomeJson.total_profit && incomeJson.total_profit.current_amount ? 
            Number(incomeJson.total_profit.current_amount) : 0;
          const shareholderEquity = balanceJson.equityTotal && balanceJson.equityTotal.endBalance ? 
            Number(balanceJson.equityTotal.endBalance) : 0;

          if (shareholderEquity > 0 && netProfit !== 0) {
            monthROE = parseFloat(((netProfit / shareholderEquity) * 100).toFixed(2));
            latestROE = monthROE;
            latestNetProfit = netProfit;
            latestShareholderEquity = shareholderEquity;
            dataFound = true;
          }
        } catch (e) {
          console.error(`解析${month}月数据失败:`, e);
        }
      }

      roeData.push(monthROE);
    }

    // 如果没有找到任何数据，返回空数据
    if (!dataFound) {
      res.json({
        success: false,
        message: '未找到对应期间的财务数据',
        data: {
          months: [],
          monthlyData: {
            roe: []
          },
          summary: {
            currentROE: 0,
            targetROE: 21.18,
            completion_rate: 0,
            netProfit: 0,
            shareholderEquity: 0
          },
          year: parseInt(year),
          lastUpdated: new Date().toISOString(),
          isSimulated: false
        }
      });
      return;
    }

    // 计算完成率
    const completion_rate = latestROE > 0 ? parseFloat((latestROE / 21.18 * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        months,
        monthlyData: {
          roe: roeData
        },
        summary: {
          currentROE: latestROE,
          targetROE: 21.18,
          completion_rate,
          netProfit: latestNetProfit,
          shareholderEquity: latestShareholderEquity
        },
        year: parseInt(year),
        lastUpdated: new Date().toISOString(),
        isSimulated: false
      }
    });

  } catch (error) {
    console.error('获取净资产收益率失败:', error);
    res.status(500).json({
      success: false,
      message: '获取净资产收益率失败',
      error: error.message
    });
  }
});

module.exports = router;