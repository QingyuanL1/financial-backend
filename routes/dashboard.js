const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取用户首页仪表板数据 (适应系统级别提交)
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

    // 获取当月系统级提交情况
    const [currentMonthStats] = await pool.execute(`
      SELECT 
        COUNT(fs.id) as submitted_count,
        COUNT(fm.id) as total_writable_current
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id AND fs.period = ?
      WHERE u.id = ? AND rp.permission_type = 'write'
    `, [currentPeriod, userId]);

    // 获取未填写的表单列表 (系统级别)
    const [pendingForms] = await pool.execute(`
      SELECT fm.id, fm.module_name, fm.module_category, fm.route_path
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id AND fs.period = ?
      WHERE u.id = ? AND rp.permission_type = 'write' AND fs.id IS NULL
      ORDER BY fm.module_category, fm.module_name
      LIMIT 10
    `, [currentPeriod, userId]);

    // 获取按分类的提交统计 (系统级别)
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
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id AND fs.period = ?
      WHERE u.id = ?
      GROUP BY fm.module_category
      ORDER BY completion_rate DESC
    `, [currentPeriod, userId]);

    // 获取最近提交历史 (只显示用户有权限查看的模块)
    const [recentSubmissions] = await pool.execute(`
      SELECT 
        fs.period,
        fm.module_name,
        fm.module_category,
        fs.submitted_at
      FROM form_submissions fs
      JOIN form_modules fm ON fs.module_id = fm.id
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ?
      ORDER BY fs.submitted_at DESC
      LIMIT 10
    `, [userId]);

    // 获取最近6个月的提交趋势 (系统级别，但只计算用户有权限的模块)
    const [submissionTrend] = await pool.execute(`
      SELECT 
        fs.period,
        COUNT(fs.id) as submission_count,
        COUNT(DISTINCT fm.module_category) as categories_count
      FROM form_submissions fs
      JOIN form_modules fm ON fs.module_id = fm.id
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ? AND fs.period >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 6 MONTH), '%Y-%m')
      GROUP BY fs.period
      ORDER BY fs.period DESC
    `, [userId]);

    // 计算统计数据
    const stats = permissionStats[0] || { total_readable: 0, total_writable: 0 };
    const currentStats = currentMonthStats[0] || { submitted_count: 0, total_writable_current: 0 };
    
    const completionRate = currentStats.total_writable_current > 0 
      ? Math.round((currentStats.submitted_count / currentStats.total_writable_current) * 100)
      : 0;

    const pendingCount = currentStats.total_writable_current - currentStats.submitted_count;

    res.json({
      success: true,
      data: {
        user: userInfo[0],
        current_period: currentPeriod,
        overview: {
          total_readable_modules: stats.total_readable,
          total_writable_modules: stats.total_writable,
          current_month_submitted: currentStats.submitted_count,
          current_month_pending: Math.max(0, pendingCount),
          completion_rate: completionRate
        },
        pending_forms: pendingForms,
        category_statistics: categoryStats,
        recent_submissions: recentSubmissions,
        submission_trend: submissionTrend
      }
    });

  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.status(500).json({ error: '获取仪表板数据失败' });
  }
});

// 获取系统公告
router.get('/announcements', async (req, res) => {
  try {
    // 模拟公告数据 - 在实际应用中应该从数据库获取
    const announcements = [
     
      {
        id: 1,
        title: '月度报表提醒',
        content: '请及时完成本月度的各项表单填报工作。',
        type: 'warning',
        created_at: new Date(Date.now() - 24*60*60*1000).toISOString()
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