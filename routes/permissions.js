const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取用户权限信息
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [userRows] = await pool.execute(`
      SELECT u.id, u.username, u.email, ur.role_name, ur.role_description 
      FROM users u 
      LEFT JOIN user_roles ur ON u.role_id = ur.id 
      WHERE u.id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = userRows[0];

    // 获取用户权限 - 包含描述字段
    const [permissionRows] = await pool.execute(`
      SELECT fm.id, fm.module_name, fm.module_key, fm.module_category, 
             fm.route_path, fm.description, rp.permission_type
      FROM role_permissions rp
      JOIN form_modules fm ON rp.module_id = fm.id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ?
      ORDER BY fm.module_category, fm.module_name
    `, [userId]);

    // 构建扁平的可访问模块列表，每个模块包含权限类型
    const accessibleModules = [];
    const permissions = {
      read: [],
      write: []
    };

    permissionRows.forEach(row => {
      const moduleInfo = {
        id: row.id,
        module_name: row.module_name,
        module_key: row.module_key,
        module_category: row.module_category,
        route_path: row.route_path,
        description: row.description,
        permission_type: row.permission_type
      };

      // 添加到可访问模块列表
      accessibleModules.push(moduleInfo);

      // 同时添加到权限分类中
      if (row.permission_type === 'write') {
        permissions.write.push(moduleInfo);
        // 写权限包含读权限
        if (!permissions.read.find(p => p.id === row.id)) {
          permissions.read.push({...moduleInfo, permission_type: 'read'});
        }
      } else if (row.permission_type === 'read') {
        if (!permissions.read.find(p => p.id === row.id)) {
          permissions.read.push(moduleInfo);
        }
      }
    });

    // 计算当月未填写的表单（系统级别）
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    const [pendingForms] = await pool.execute(`
      SELECT fm.id, fm.module_name, fm.module_key, fm.module_category, fm.route_path, fm.description
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id AND fs.period = ?
      WHERE u.id = ? AND rp.permission_type = 'write' AND fs.id IS NULL
      ORDER BY fm.module_category, fm.module_name
    `, [currentPeriod, userId]);

    res.json({
      success: true,
      data: {
        user,
        accessible_modules: accessibleModules,
        permissions,
        pending_forms: pendingForms,
        current_period: currentPeriod
      }
    });
  } catch (error) {
    console.error('获取用户权限失败:', error);
    res.status(500).json({ error: '获取权限失败' });
  }
});

// 获取所有角色列表
router.get('/roles', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, role_name, role_description FROM user_roles ORDER BY id'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({ error: '获取角色列表失败' });
  }
});

// 获取所有表单模块列表
router.get('/modules', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, module_name, module_key, module_category, route_path, description
      FROM form_modules 
      ORDER BY module_category, module_name
    `);

    // 按分类分组
    const groupedModules = rows.reduce((acc, module) => {
      if (!acc[module.module_category]) {
        acc[module.module_category] = [];
      }
      acc[module.module_category].push(module);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        modules: rows,
        grouped: groupedModules
      }
    });
  } catch (error) {
    console.error('获取模块列表失败:', error);
    res.status(500).json({ error: '获取模块列表失败' });
  }
});

// 获取角色权限配置
router.get('/role/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;

    // 获取角色信息
    const [roleRows] = await pool.execute(
      'SELECT id, role_name, role_description FROM user_roles WHERE id = ?',
      [roleId]
    );

    if (roleRows.length === 0) {
      return res.status(404).json({ error: '角色不存在' });
    }

    // 获取角色权限
    const [permissionRows] = await pool.execute(`
      SELECT rp.id, rp.module_id, rp.permission_type, 
             fm.module_name, fm.module_key, fm.module_category
      FROM role_permissions rp
      JOIN form_modules fm ON rp.module_id = fm.id
      WHERE rp.role_id = ?
      ORDER BY fm.module_category, fm.module_name
    `, [roleId]);

    res.json({
      success: true,
      data: {
        role: roleRows[0],
        permissions: permissionRows
      }
    });
  } catch (error) {
    console.error('获取角色权限失败:', error);
    res.status(500).json({ error: '获取角色权限失败' });
  }
});

// 更新角色权限
router.put('/role/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body; // { moduleId: 'read'|'write'|null }

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 删除现有权限
      await connection.execute(
        'DELETE FROM role_permissions WHERE role_id = ?',
        [roleId]
      );

      // 插入新权限
      for (const [moduleId, permissionType] of Object.entries(permissions)) {
        if (permissionType && (permissionType === 'read' || permissionType === 'write')) {
          await connection.execute(
            'INSERT INTO role_permissions (role_id, module_id, permission_type) VALUES (?, ?, ?)',
            [roleId, moduleId, permissionType]
          );
        }
      }

      await connection.commit();
      res.json({
        success: true,
        message: '角色权限更新成功'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新角色权限失败:', error);
    res.status(500).json({ error: '更新权限失败' });
  }
});

// 更新用户角色
router.put('/user/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    const [result] = await pool.execute(
      'UPDATE users SET role_id = ? WHERE id = ?',
      [roleId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      message: '用户角色更新成功'
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({ error: '更新用户角色失败' });
  }
});

// 获取系统提交记录 (针对特定期间)
router.get('/user/:userId/submissions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query;
    
    // 获取用户有权限的模块
    const [userModules] = await pool.execute(`
      SELECT fm.id as module_id
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ?
    `, [userId]);
    
    if (userModules.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const moduleIds = userModules.map(m => m.module_id);
    
    let query = `
      SELECT fs.module_id, fs.period, fs.submitted_at
      FROM form_submissions fs
      WHERE fs.module_id IN (${moduleIds.map(() => '?').join(',')})
    `;
    let params = moduleIds;
    
    if (period) {
      query += ' AND fs.period = ?';
      params.push(period);
    }
    
    query += ' ORDER BY fs.submitted_at DESC';
    
    const [submissions] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: submissions
    });
    
  } catch (error) {
    console.error('获取提交记录失败:', error);
    res.status(500).json({ error: '获取提交记录失败' });
  }
});

// 获取用户待提交表单 (系统级别)
router.get('/user/:userId/pending-forms', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query;
    const currentPeriod = period || new Date().toISOString().slice(0, 7);
    
    const [pendingForms] = await pool.execute(`
      SELECT fm.id, fm.module_name, fm.module_key, fm.module_category, fm.route_path, fm.description
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id AND fs.period = ?
      WHERE u.id = ? AND rp.permission_type = 'write' AND fs.id IS NULL
      ORDER BY fm.module_category, fm.module_name
    `, [currentPeriod, userId]);
    
    res.json({
      success: true,
      data: pendingForms
    });
    
  } catch (error) {
    console.error('获取待提交表单失败:', error);
    res.status(500).json({ error: '获取待提交表单失败' });
  }
});

// 获取用户未填写的表单 (保持向后兼容)
router.get('/user/:userId/pending-forms/:period', async (req, res) => {
  try {
    const { userId, period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    // 获取用户有写权限的模块
    const [writeModules] = await pool.execute(`
      SELECT fm.id, fm.module_name, fm.module_key, fm.module_category, fm.route_path, fm.description
      FROM role_permissions rp
      JOIN form_modules fm ON rp.module_id = fm.id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ? AND rp.permission_type = 'write'
      ORDER BY fm.module_category, fm.module_name
    `, [userId]);

    // 获取用户已提交的表单
    const [submissions] = await pool.execute(`
      SELECT module_id
      FROM form_submissions
      WHERE user_id = ? AND period = ?
    `, [userId, period]);

    const submittedModuleIds = new Set(submissions.map(s => s.module_id));

    // 筛选出未提交的表单
    const pendingForms = writeModules.filter(module => 
      !submittedModuleIds.has(module.id)
    );

    res.json({
      success: true,
      data: {
        period,
        total_writable: writeModules.length,
        submitted: submissions.length,
        pending: pendingForms.length,
        pending_forms: pendingForms
      }
    });
  } catch (error) {
    console.error('获取未填写表单失败:', error);
    res.status(500).json({ error: '获取未填写表单失败' });
  }
});

// 记录表单提交
router.post('/submissions', async (req, res) => {
  try {
    const { userId, moduleId, period, submissionData } = req.body;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    await pool.execute(`
      INSERT INTO form_submissions (user_id, module_id, period, submission_data)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      submission_data = VALUES(submission_data),
      updated_at = CURRENT_TIMESTAMP
    `, [userId, moduleId, period, JSON.stringify(submissionData)]);

    res.json({
      success: true,
      message: '表单提交记录保存成功'
    });
  } catch (error) {
    console.error('保存表单提交记录失败:', error);
    res.status(500).json({ error: '保存提交记录失败' });
  }
});

// 获取用户提交统计
router.get('/user/:userId/submission-stats/:period', async (req, res) => {
  try {
    const { userId, period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为YYYY-MM格式' });
    }

    // 获取用户各分类的提交情况
    const [stats] = await pool.execute(`
      SELECT 
        fm.module_category,
        COUNT(CASE WHEN rp.permission_type = 'write' THEN 1 END) as total_writable,
        COUNT(fs.id) as submitted_count,
        GROUP_CONCAT(
          CASE WHEN fs.id IS NULL AND rp.permission_type = 'write' 
          THEN fm.module_name END 
          SEPARATOR ', '
        ) as pending_forms
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN users u ON u.role_id = rp.role_id
      LEFT JOIN form_submissions fs ON fm.id = fs.module_id 
        AND fs.user_id = ? AND fs.period = ?
      WHERE u.id = ?
      GROUP BY fm.module_category
      ORDER BY fm.module_category
    `, [userId, period, userId]);

    res.json({
      success: true,
      data: {
        period,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('获取提交统计失败:', error);
    res.status(500).json({ error: '获取提交统计失败' });
  }
});

module.exports = router;