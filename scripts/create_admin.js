const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// 数据库连接配置 (不指定数据库，先创建)
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345678'
};

async function createAdmin() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('连接数据库成功...');
    
    // 创建数据库和表
    await connection.query('CREATE DATABASE IF NOT EXISTS finance');
    await connection.query('USE finance');
    console.log('数据库已创建/选择');
    
    // 检查users表是否存在，如果不存在则先运行权限系统初始化
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('users表不存在，请先运行权限系统初始化脚本');
      return;
    }
    
    // 清空users表
    await connection.execute('DELETE FROM users');
    console.log('已清空users表');
    
    // 重置自增ID
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('已重置自增ID');
    
    // 生成密码哈希
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('密码哈希生成完成');
    
    // 插入管理员用户
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      ['admin', 'admin@dayagroup.com', hashedPassword, 1]
    );
    
    console.log('管理员用户创建成功，ID:', result.insertId);
    
    // 验证创建结果
    const [users] = await connection.execute(`
      SELECT u.id, u.username, u.email, r.role_name, r.role_description, u.created_at
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.username = 'admin'
    `);
    
    console.log('管理员用户信息:');
    console.table(users);
    
    console.log('\n=== 角色码参考 ===');
    console.log('SUPER_ADMIN_2024: 超级管理员');
    console.log('ADMIN_2024: 管理员');
    console.log('FINANCE_MGR_2024: 财务经理');
    console.log('MARKETING_MGR_2024: 营销经理');
    console.log('PRODUCTION_MGR_2024: 生产经理');
    console.log('ENTERPRISE_MGR_2024: 企管经理');
    console.log('FINANCE_STAFF_2024: 财务专员');
    console.log('MARKETING_STAFF_2024: 营销专员');
    console.log('PRODUCTION_STAFF_2024: 生产专员');
    console.log('ENTERPRISE_STAFF_2024: 企管专员');
    console.log('LEADER_2024: 领导');
    console.log('VIEWER_2024: 查看者');
    
    console.log('\n管理员登录信息:');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('邮箱: admin@dayagroup.com');
    
  } catch (error) {
    console.error('创建管理员失败:', error);
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

createAdmin();