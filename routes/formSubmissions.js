const express = require('express');
const mysql = require('mysql2/promise');
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

// 提交表单数据 (系统级别)
router.post('/submit', async (req, res) => {
  try {
    const { userId, moduleId, period, formData, remarks, suggestions } = req.body;
    
    // 验证必填字段
    if (!userId || !moduleId || !period) {
      return res.status(400).json({
        success: false,
        error: '用户ID、模块ID和期间都是必填项'
      });
    }
    
    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        success: false,
        error: '期间格式错误，应为YYYY-MM格式'
      });
    }
    
    // 验证用户是否有该模块的写权限
    const [permissionCheck] = await pool.execute(`
      SELECT 1 FROM role_permissions rp
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ? AND rp.module_id = ? AND rp.permission_type = 'write'
    `, [userId, moduleId]);
    
    if (permissionCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: '您没有提交此表单的权限'
      });
    }
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 检查系统级别的提交记录是否已存在
      const [existingSubmission] = await connection.execute(`
        SELECT id, submission_count FROM form_submissions 
        WHERE module_id = ? AND period = ?
      `, [moduleId, period]);
      
      let submissionId;
      let action;
      
      if (existingSubmission.length > 0) {
        // 更新现有记录
        submissionId = existingSubmission[0].id;
        const newCount = existingSubmission[0].submission_count + 1;
        
        await connection.execute(`
          UPDATE form_submissions 
          SET submission_data = ?, last_submitted_by = ?, updated_at = NOW(), submission_count = ?, remarks = ?, suggestions = ?
          WHERE module_id = ? AND period = ?
        `, [JSON.stringify(formData), userId, newCount, remarks || null, suggestions || null, moduleId, period]);
        
        action = 'update';
      } else {
        // 插入新记录
        const [result] = await connection.execute(`
          INSERT INTO form_submissions (module_id, period, submission_data, last_submitted_by, submission_count, remarks, suggestions)
          VALUES (?, ?, ?, ?, 1, ?, ?)
        `, [moduleId, period, JSON.stringify(formData), userId, remarks || null, suggestions || null]);
        
        submissionId = result.insertId;
        action = 'create';
      }
      
      // 记录历史
      await connection.execute(`
        INSERT INTO form_submission_history (module_id, period, submitted_by, submission_data, action_type, remarks, suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [moduleId, period, userId, JSON.stringify(formData), action, remarks || null, suggestions || null]);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: action === 'create' ? '表单提交成功' : '表单更新成功',
        data: {
          submission_id: submissionId,
          action: action
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('提交表单失败:', error);
    res.status(500).json({
      success: false,
      error: '提交表单失败，请重试'
    });
  }
});

// 获取表单提交详情 (系统级别)
router.get('/submission/:moduleId/:period', async (req, res) => {
  try {
    const { moduleId, period } = req.params;
    
    const [submissions] = await pool.execute(`
      SELECT fs.*, fm.module_name, fm.module_key, u.username as last_submitted_by_name
      FROM form_submissions fs
      JOIN form_modules fm ON fs.module_id = fm.id
      LEFT JOIN users u ON fs.last_submitted_by = u.id
      WHERE fs.module_id = ? AND fs.period = ?
    `, [moduleId, period]);
    
    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到提交记录'
      });
    }
    
    const submission = submissions[0];
    // 解析JSON数据
    if (submission.submission_data) {
      try {
        // 如果已经是对象就不需要解析
        if (typeof submission.submission_data === 'string') {
          submission.submission_data = JSON.parse(submission.submission_data);
        }
      } catch (e) {
        console.warn('解析submission_data失败:', e);
        // 如果解析失败，设置为空对象
        submission.submission_data = {};
      }
    }
    
    res.json({
      success: true,
      data: submission
    });
    
  } catch (error) {
    console.error('获取提交详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取提交详情失败'
    });
  }
});

// 删除表单提交记录 (系统级别)
router.delete('/submission/:moduleId/:period', async (req, res) => {
  try {
    const { moduleId, period } = req.params;
    const { userId } = req.body; // 从请求体获取用户ID
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '用户ID是必填项'
      });
    }
    
    // 验证用户权限
    const [permissionCheck] = await pool.execute(`
      SELECT 1 FROM role_permissions rp
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ? AND rp.module_id = ? AND rp.permission_type = 'write'
    `, [userId, moduleId]);
    
    if (permissionCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: '您没有删除此表单的权限'
      });
    }
    
    const [result] = await pool.execute(`
      DELETE FROM form_submissions 
      WHERE module_id = ? AND period = ?
    `, [moduleId, period]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到要删除的提交记录'
      });
    }
    
    res.json({
      success: true,
      message: '提交记录删除成功'
    });
    
  } catch (error) {
    console.error('删除提交记录失败:', error);
    res.status(500).json({
      success: false,
      error: '删除提交记录失败'
    });
  }
});

// 批量获取某期间的所有提交状态 (系统级别)
router.get('/status/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { userId } = req.query; // 从查询参数获取用户ID，用于权限过滤
    
    let userModulesQuery = `
      SELECT fm.id, fm.module_name, fm.module_category, 'read' as permission_type
      FROM form_modules fm
      ORDER BY fm.module_category, fm.module_name
    `;
    let userModulesParams = [];
    
    // 如果提供了用户ID，则只返回用户有权限的模块
    if (userId) {
      userModulesQuery = `
        SELECT fm.id, fm.module_name, fm.module_category, rp.permission_type
        FROM form_modules fm
        JOIN role_permissions rp ON fm.id = rp.module_id
        JOIN users u ON u.role_id = rp.role_id
        WHERE u.id = ?
        ORDER BY fm.module_category, fm.module_name
      `;
      userModulesParams = [userId];
    }
    
    // 获取模块列表
    const [userModules] = await pool.execute(userModulesQuery, userModulesParams);
    
    // 获取该期间的系统级提交记录
    const [submissions] = await pool.execute(`
      SELECT fs.module_id, fs.submitted_at, fs.updated_at, fs.submission_count, 
             u.username as last_submitted_by_name
      FROM form_submissions fs
      LEFT JOIN users u ON fs.last_submitted_by = u.id
      WHERE fs.period = ?
    `, [period]);
    
    const submissionMap = new Map();
    submissions.forEach(sub => {
      submissionMap.set(sub.module_id, {
        submitted_at: sub.submitted_at,
        updated_at: sub.updated_at,
        submission_count: sub.submission_count,
        last_submitted_by: sub.last_submitted_by_name,
        status: 'submitted'
      });
    });
    
    // 组合数据
    const moduleStatus = userModules.map(module => ({
      module_id: module.id,
      module_name: module.module_name,
      module_category: module.module_category,
      permission_type: module.permission_type,
      submission_status: submissionMap.get(module.id) || { status: 'pending' }
    }));
    
    res.json({
      success: true,
      data: {
        period,
        modules: moduleStatus
      }
    });
    
  } catch (error) {
    console.error('获取提交状态失败:', error);
    res.status(500).json({
      success: false,
      error: '获取提交状态失败'
    });
  }
});

module.exports = router;