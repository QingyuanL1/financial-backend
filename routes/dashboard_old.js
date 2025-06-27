const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取用户首页仪表板数据
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

    // 获取用户基本信息
    const [userInfo] = await pool.execute(`
      SELECT u.username, u.email, ur.role_name, ur.role_description
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.id = ?
    `, [userId]);

    if (userInfo.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户权限统计
    const [permissionStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN permission_type = 'read' THEN 1 END) as total_readable,
        COUNT(CASE WHEN permission_type = 'write' THEN 1 END) as total_writable
      FROM role_permissions rp
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ?
    `, [userId]);

    // 获取当月提交情况
    const [currentMonthStats] = await pool.execute(`
      SELECT 
        COUNT(fs.id) as submitted_count,
        COUNT(CASE WHEN rp.permission_type = 'write' THEN 1 END) as total_writable_current
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id 
        AND fs.user_id = ? AND fs.period = ?
      WHERE u.id = ? AND rp.permission_type = 'write'
    `, [userId, currentPeriod, userId]);

    // 获取未填写的表单列表
    const [pendingForms] = await pool.execute(`
      SELECT fm.id, fm.module_name, fm.module_category, fm.route_path
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id 
        AND fs.user_id = ? AND fs.period = ?
      WHERE u.id = ? AND rp.permission_type = 'write' AND fs.id IS NULL
      ORDER BY fm.module_category, fm.module_name
      LIMIT 10
    `, [userId, currentPeriod, userId]);

    // 获取按分类的提交统计
    const [categoryStats] = await pool.execute(`
      SELECT 
        fm.module_category,
        COUNT(CASE WHEN rp.permission_type = 'write' THEN 1 END) as total_writable,
        COUNT(fs.id) as submitted_count,
        ROUND(
          COUNT(fs.id) * 100.0 / NULLIF(COUNT(CASE WHEN rp.permission_type = 'write' THEN 1 END), 0), 
          1
        ) as completion_rate
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id 
        AND fs.user_id = ? AND fs.period = ?
      WHERE u.id = ?
      GROUP BY fm.module_category
      ORDER BY completion_rate DESC
    `, [userId, currentPeriod, userId]);

    // 获取最近提交历史
    const [recentSubmissions] = await pool.execute(`
      SELECT 
        fs.period,
        fm.module_name,
        fm.module_category,
        fs.submitted_at
      FROM form_submissions fs
      JOIN form_modules fm ON fs.module_id = fm.id
      WHERE fs.user_id = ?
      ORDER BY fs.submitted_at DESC
      LIMIT 10
    `, [userId]);

    // 获取最近6个月的提交趋势
    const [submissionTrend] = await pool.execute(`
      SELECT 
        fs.period,
        COUNT(fs.id) as submission_count,
        COUNT(DISTINCT fm.module_category) as categories_count
      FROM form_submissions fs
      JOIN form_modules fm ON fs.module_id = fm.id
      WHERE fs.user_id = ? 
        AND fs.period >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 6 MONTH), '%Y-%m')
      GROUP BY fs.period
      ORDER BY fs.period ASC
    `, [userId]);

    const currentStats = currentMonthStats[0] || { submitted_count: 0, total_writable_current: 0 };
    const permStats = permissionStats[0] || { total_readable: 0, total_writable: 0 };

    const dashboardData = {
      user: userInfo[0],
      current_period: currentPeriod,
      overview: {
        total_readable_modules: permStats.total_readable,
        total_writable_modules: permStats.total_writable,
        current_month_submitted: currentStats.submitted_count,
        current_month_pending: currentStats.total_writable_current - currentStats.submitted_count,
        completion_rate: currentStats.total_writable_current > 0 
          ? Math.round((currentStats.submitted_count / currentStats.total_writable_current) * 100)
          : 0
      },
      pending_forms: pendingForms,
      category_statistics: categoryStats,
      recent_submissions: recentSubmissions,
      submission_trend: submissionTrend
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.status(500).json({ error: '获取仪表板数据失败' });
  }
});

// 获取系统整体统计（管理员用）
router.get('/admin/overview', async (req, res) => {
  try {
    // 获取用户统计
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN ur.role_name LIKE '%manager%' THEN 1 END) as managers_count,
        COUNT(CASE WHEN ur.role_name LIKE '%staff%' THEN 1 END) as staff_count,
        COUNT(CASE WHEN ur.role_name = 'leader' THEN 1 END) as leaders_count
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
    `);

    // 获取当月全员提交统计
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const [submissionStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as active_users,
        COUNT(fs.id) as total_submissions,
        AVG(user_submissions.submission_count) as avg_submissions_per_user
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as submission_count
        FROM form_submissions
        WHERE period = ?
        GROUP BY user_id
      ) user_submissions ON u.id = user_submissions.user_id
      LEFT JOIN form_submissions fs ON u.id = fs.user_id AND fs.period = ?
    `, [currentPeriod, currentPeriod]);

    // 获取各分类模块的完成情况
    const [categoryCompletion] = await pool.execute(`
      SELECT 
        fm.module_category,
        COUNT(DISTINCT fm.id) as total_modules,
        COUNT(DISTINCT fs.module_id) as completed_modules,
        ROUND(
          COUNT(DISTINCT fs.module_id) * 100.0 / COUNT(DISTINCT fm.id),
          1
        ) as completion_rate
      FROM form_modules fm
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id AND fs.period = ?
      GROUP BY fm.module_category
      ORDER BY completion_rate DESC
    `, [currentPeriod]);

    // 获取最活跃用户
    const [activeUsers] = await pool.execute(`
      SELECT 
        u.username,
        ur.role_name,
        COUNT(fs.id) as submission_count,
        COUNT(DISTINCT fs.period) as active_periods
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      LEFT JOIN form_submissions fs ON u.id = fs.user_id
      WHERE fs.submitted_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY u.id, u.username, ur.role_name
      ORDER BY submission_count DESC
      LIMIT 10
    `);

    // 获取提交趋势（最近12个月）
    const [monthlyTrend] = await pool.execute(`
      SELECT 
        period,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_submissions
      FROM form_submissions
      WHERE period >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 12 MONTH), '%Y-%m')
      GROUP BY period
      ORDER BY period ASC
    `);

    res.json({
      success: true,
      data: {
        current_period: currentPeriod,
        user_statistics: userStats[0],
        submission_statistics: submissionStats[0],
        category_completion: categoryCompletion,
        active_users: activeUsers,
        monthly_trend: monthlyTrend
      }
    });

  } catch (error) {
    console.error('获取管理员概览数据失败:', error);
    res.status(500).json({ error: '获取概览数据失败' });
  }
});

// 获取系统公告（可扩展功能）
router.get('/announcements', async (req, res) => {
  try {
    // 模拟公告数据，实际可以创建公告表
    const announcements = [
      {
        id: 1,
        title: '系统维护通知',
        content: '系统将于本周末进行维护升级，请及时保存数据。',
        type: 'warning',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '月度报表提醒',
        content: '请各部门在月底前完成当月财务报表的填写。',
        type: 'info',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('获取公告失败:', error);
    res.status(500).json({ error: '获取公告失败' });
  }
});

module.exports = router;