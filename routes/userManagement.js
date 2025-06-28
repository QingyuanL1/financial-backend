const express = require('express');
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const router = express.Router();

// 获取所有用户列表
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const offsetNum = (page - 1) * limitNum;
    const search = req.query.search;

    let sql, params;
    
    // 构建基本 SQL
    let baseCountSQL = "SELECT COUNT(*) as total FROM users u LEFT JOIN user_roles ur ON u.role_id = ur.id";
    let baseSelectSQL = `
      SELECT u.id, u.username, u.email, u.created_at, u.updated_at,
             u.role_id, ur.role_name, ur.role_description
      FROM users u 
      LEFT JOIN user_roles ur ON u.role_id = ur.id`;
    
    // 根据是否有搜索条件构建不同的 SQL
    if (search && search.trim() !== '') {
      const whereClause = "WHERE u.username LIKE ? OR u.email LIKE ?";
      const searchParams = [`%${search}%`, `%${search}%`];
      
      // 获取用户总数
      const [countRows] = await pool.execute(`${baseCountSQL} ${whereClause}`, searchParams);
      
      // 获取用户列表
      const [userRows] = await pool.execute(
        `${baseSelectSQL} ${whereClause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`, 
        [...searchParams, limitNum, offsetNum]
      );
      
      return res.json({
        success: true,
        data: {
          users: userRows,
          pagination: {
            current_page: page,
            per_page: limitNum,
            total: countRows[0].total,
            total_pages: Math.ceil(countRows[0].total / limitNum)
          }
        }
      });
    } else {
      // 没有搜索条件时的简单查询
      // 获取用户总数
      const [countRows] = await pool.execute(baseCountSQL);
      
      // 获取用户列表 - 为避免参数问题，将参数直接嵌入到 SQL 中
      const [userRows] = await pool.execute(
        `${baseSelectSQL} ORDER BY u.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`
      );
      
      return res.json({
        success: true,
        data: {
          users: userRows,
          pagination: {
            current_page: page,
            per_page: limitNum,
            total: countRows[0].total,
            total_pages: Math.ceil(countRows[0].total / limitNum)
          }
        }
      });
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取单个用户详情
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [userRows] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.created_at, u.updated_at,
             ur.id as role_id, ur.role_name, ur.role_description
      FROM users u 
      LEFT JOIN user_roles ur ON u.role_id = ur.id 
      WHERE u.id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户权限统计
    const [permissionStats] = await pool.execute(`
      SELECT 
        fm.module_category,
        COUNT(CASE WHEN rp.permission_type = 'read' THEN 1 END) as read_count,
        COUNT(CASE WHEN rp.permission_type = 'write' THEN 1 END) as write_count
      FROM role_permissions rp
      JOIN form_modules fm ON rp.module_id = fm.id
      WHERE rp.role_id = ?
      GROUP BY fm.module_category
      ORDER BY fm.module_category
    `, [userRows[0].role_id]);

    res.json({
      success: true,
      data: {
        user: userRows[0],
        permission_stats: permissionStats
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 创建新用户
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
    }

    // 检查用户名和邮箱是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role_id || null]
    );

    res.json({
      success: true,
      message: '用户创建成功',
      data: {
        user_id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
});

// 更新用户信息
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role_id } = req.body;

    // 检查用户是否存在
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 检查用户名和邮箱是否被其他用户使用
    if (username || email) {
      const [conflictUsers] = await pool.execute(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', userId]
      );

      if (conflictUsers.length > 0) {
        return res.status(400).json({ error: '用户名或邮箱已被其他用户使用' });
      }
    }

    // 构建更新语句
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (role_id !== undefined) {
      updateFields.push('role_id = ?');
      updateValues.push(role_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
});

// 删除用户
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 检查是否为超级管理员（假设ID为1的用户不能删除）
    if (userId === '1') {
      return res.status(403).json({ error: '不能删除超级管理员账户' });
    }

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 重置用户密码
router.post('/:userId/reset-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: '新密码不能为空' });
    }

    // 对新密码进行哈希处理
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

// 批量更新用户角色
router.post('/batch-update-role', async (req, res) => {
  try {
    const { userIds, role_id } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: '用户ID列表不能为空' });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const [result] = await pool.execute(
      `UPDATE users SET role_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [role_id, ...userIds]
    );

    res.json({
      success: true,
      message: `成功更新 ${result.affectedRows} 个用户的角色`
    });
  } catch (error) {
    console.error('批量更新用户角色失败:', error);
    res.status(500).json({ error: '批量更新失败' });
  }
});

// 获取用户活动统计
router.get('/:userId/activity-stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { months = 6 } = req.query;

    // 获取最近几个月的提交统计
    const [submissionStats] = await pool.execute(`
      SELECT 
        fs.period,
        COUNT(fs.id) as submission_count,
        COUNT(DISTINCT fm.module_category) as categories_submitted
      FROM form_submissions fs
      JOIN form_modules fm ON fs.module_id = fm.id
      WHERE fs.user_id = ? 
        AND fs.period >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m')
      GROUP BY fs.period
      ORDER BY fs.period DESC
    `, [userId, months]);

    // 获取用户权限模块总数
    const [totalModules] = await pool.execute(`
      SELECT COUNT(*) as total_writable
      FROM role_permissions rp
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ? AND rp.permission_type = 'write'
    `, [userId]);

    res.json({
      success: true,
      data: {
        submission_history: submissionStats,
        total_writable_modules: totalModules[0].total_writable
      }
    });
  } catch (error) {
    console.error('获取用户活动统计失败:', error);
    res.status(500).json({ error: '获取活动统计失败' });
  }
});

module.exports = router;