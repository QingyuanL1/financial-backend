const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳_原文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  }
});

// 文件上传API
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '没有上传文件'
      });
    }

    const { moduleId, period, userId, description } = req.body;

    console.log('上传文件参数:', { moduleId, period, userId, description });

    if (!moduleId || !period || !userId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：moduleId, period, userId'
      });
    }

    // 保存文件信息到数据库
    const [result] = await pool.execute(`
      INSERT INTO form_attachments (
        module_id, period, user_id, original_name, file_name, 
        file_path, file_size, mime_type, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      moduleId,
      period,
      userId,
      req.file.originalname,
      req.file.filename,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      description || null
    ]);

    res.json({
      success: true,
      data: {
        id: result.insertId,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    
    // 如果数据库保存失败，删除已上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || '文件上传失败'
    });
  }
});

// 获取表单的附件列表
router.get('/attachments/:moduleId/:period', async (req, res) => {
  try {
    const { moduleId, period } = req.params;
    
    console.log('获取附件列表请求:', { moduleId, period });

    // 先尝试简单查询
    const [files] = await pool.execute(`
      SELECT 
        fa.id, 
        fa.original_name, 
        fa.file_name, 
        fa.file_size, 
        fa.mime_type, 
        fa.description, 
        fa.uploaded_at,
        COALESCE(u.username, 'Unknown') as uploaded_by
      FROM form_attachments fa
      LEFT JOIN users u ON fa.user_id = u.id
      WHERE fa.module_id = ? AND fa.period = ?
      ORDER BY fa.uploaded_at DESC
    `, [moduleId, period]);

    console.log('查询结果:', files);

    res.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('获取附件列表失败 - 详细错误:', error);
    res.status(500).json({
      success: false,
      error: `获取附件列表失败: ${error.message}`
    });
  }
});

// 下载文件
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const [files] = await pool.execute(`
      SELECT original_name, file_name, file_path, mime_type
      FROM form_attachments
      WHERE id = ?
    `, [fileId]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    const file = files[0];
    const filePath = file.file_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件已被删除'
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
    res.setHeader('Content-Type', file.mime_type);
    
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('文件下载失败:', error);
    res.status(500).json({
      success: false,
      error: '文件下载失败'
    });
  }
});

// 删除文件
router.delete('/delete/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.body;

    // 获取文件信息
    const [files] = await pool.execute(`
      SELECT file_path, user_id FROM form_attachments WHERE id = ?
    `, [fileId]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    const file = files[0];

    // 检查权限（只有上传者或管理员可以删除）
    if (file.user_id !== parseInt(userId)) {
      // 这里可以添加管理员权限检查
      return res.status(403).json({
        success: false,
        error: '没有权限删除此文件'
      });
    }

    // 从数据库删除记录
    await pool.execute('DELETE FROM form_attachments WHERE id = ?', [fileId]);

    // 删除物理文件
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    res.json({
      success: true,
      message: '文件删除成功'
    });

  } catch (error) {
    console.error('文件删除失败:', error);
    res.status(500).json({
      success: false,
      error: '文件删除失败'
    });
  }
});

module.exports = router;