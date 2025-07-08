const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取通知列表（分页、筛选）
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      status = 'published',
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 简化查询，先测试基本功能
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM notifications n
      WHERE n.status = 'published'
    `);

    const [notifications] = await pool.execute(`
      SELECT 
        n.*,
        u.username as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.status = 'published'
      ORDER BY n.priority DESC, n.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通知列表失败',
      error: error.message
    });
  }
});

// 获取所有未读通知（用于首页公告）
router.get('/unread', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [notifications] = await pool.execute(`
      SELECT 
        n.*,
        u.username as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.status = 'published'
      ORDER BY n.priority DESC, n.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('获取未读通知失败:', error);
    res.status(500).json({
      success: false,
      message: '获取未读通知失败',
      error: error.message
    });
  }
});

// 获取用户未读通知
router.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const [notifications] = await pool.execute(`
      SELECT 
        n.*,
        u.username as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.status = 'published'
      ORDER BY n.priority DESC, n.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('获取未读通知失败:', error);
    res.status(500).json({
      success: false,
      message: '获取未读通知失败',
      error: error.message
    });
  }
});

// 获取单个通知详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [notifications] = await pool.execute(`
      SELECT 
        n.*,
        u.username as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.id = ?
    `, [id]);

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({
      success: true,
      data: notifications[0]
    });

  } catch (error) {
    console.error('获取通知详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通知详情失败',
      error: error.message
    });
  }
});

// 创建新通知
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      type = 'info',
      priority = 'medium',
      status = 'published',
      target_users,
      sender_id,
      start_time,
      end_time
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO notifications 
      (title, content, type, priority, status, target_users, sender_id, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      content,
      type,
      priority,
      status,
      target_users ? JSON.stringify(target_users) : null,
      sender_id,
      start_time || null,
      end_time || null
    ]);

    res.json({
      success: true,
      message: '通知创建成功',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('创建通知失败:', error);
    res.status(500).json({
      success: false,
      message: '创建通知失败',
      error: error.message
    });
  }
});

// 更新通知
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      type,
      priority,
      status,
      target_users,
      start_time,
      end_time
    } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (target_users !== undefined) {
      updates.push('target_users = ?');
      params.push(target_users ? JSON.stringify(target_users) : null);
    }
    if (start_time !== undefined) {
      updates.push('start_time = ?');
      params.push(start_time || null);
    }
    if (end_time !== undefined) {
      updates.push('end_time = ?');
      params.push(end_time || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      });
    }

    params.push(id);

    await pool.execute(`
      UPDATE notifications 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: '通知更新成功'
    });

  } catch (error) {
    console.error('更新通知失败:', error);
    res.status(500).json({
      success: false,
      message: '更新通知失败',
      error: error.message
    });
  }
});

// 删除通知
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '通知删除成功'
    });

  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({
      success: false,
      message: '删除通知失败',
      error: error.message
    });
  }
});

// 标记通知为已读
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
    }

    await pool.execute(`
      INSERT IGNORE INTO user_notification_reads (user_id, notification_id)
      VALUES (?, ?)
    `, [user_id, id]);

    res.json({
      success: true,
      message: '标记为已读成功'
    });

  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记已读失败',
      error: error.message
    });
  }
});

// 获取通知统计信息
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_notifications,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count,
        SUM(CASE WHEN type = 'info' THEN 1 ELSE 0 END) as info_count,
        SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN type = 'error' THEN 1 ELSE 0 END) as error_count,
        SUM(CASE WHEN type = 'success' THEN 1 ELSE 0 END) as success_count
      FROM notifications
    `);

    res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('获取通知统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通知统计失败',
      error: error.message
    });
  }
});

module.exports = router;