const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const router = express.Router();

// 数据库连接配置
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'finance'
};

// JWT密钥 (生产环境应使用环境变量)
const JWT_SECRET = 'your-jwt-secret-key';

// 角色码映射
const ROLE_CODES = {
  'SUPER_ADMIN_2024': 1,    // super_admin
  'ADMIN_2024': 2,          // admin  
  'FINANCE_MGR_2024': 3,    // financial_manager
  'MARKETING_MGR_2024': 4,  // marketing_manager
  'PRODUCTION_MGR_2024': 5, // production_manager
  'ENTERPRISE_MGR_2024': 6, // enterprise_manager
  'FINANCE_STAFF_2024': 7,  // financial_staff
  'MARKETING_STAFF_2024': 8, // marketing_staff
  'PRODUCTION_STAFF_2024': 9, // production_staff
  'ENTERPRISE_STAFF_2024': 10, // enterprise_staff
  'LEADER_2024': 11,        // leader
  'VIEWER_2024': 12         // viewer
};

// 用户注册
router.post('/register', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { username, email, password, roleCode } = req.body;
    
    // 验证必填字段
    if (!username || !email || !password || !roleCode) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱、密码和角色码都是必填项'
      });
    }
    
    // 验证角色码
    const roleId = ROLE_CODES[roleCode];
    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: '无效的角色码，请联系管理员获取正确的角色码'
      });
    }
    
    // 检查用户名是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: '用户名或邮箱已存在'
      });
    }
    
    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 插入新用户
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, roleId]
    );
    
    // 获取角色信息
    const [roleInfo] = await connection.execute(
      'SELECT role_name, role_description FROM user_roles WHERE id = ?',
      [roleId]
    );
    
    res.json({
      success: true,
      message: '注册成功',
      data: {
        user_id: result.insertId,
        username,
        email,
        role_name: roleInfo[0].role_name,
        role_description: roleInfo[0].role_description
      }
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      error: '注册失败，请重试'
    });
  } finally {
    await connection.end();
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { username, password } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名和密码都是必填项'
      });
    }
    
    // 查找用户及角色信息
    const [users] = await connection.execute(`
      SELECT u.id, u.username, u.email, u.password, u.role_id,
             r.role_name, r.role_description
      FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.username = ?
    `, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
    }
    
    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        roleId: user.role_id,
        roleName: user.role_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 返回用户信息和token
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_name,
          role_description: user.role_description
        }
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请重试'
    });
  } finally {
    await connection.end();
  }
});

// 验证token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '访问令牌缺失'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: '访问令牌无效'
      });
    }
    req.user = user;
    next();
  });
};

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [users] = await connection.execute(`
      SELECT u.id, u.username, u.email, u.role_id,
             r.role_name, r.role_description
      FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `, [req.user.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  } finally {
    await connection.end();
  }
});

module.exports = router;