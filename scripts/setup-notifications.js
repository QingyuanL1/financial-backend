const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function setupNotifications() {
  try {
    console.log('开始创建通知管理相关表...');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../sql/notifications.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // 分割SQL语句（按分号分割）
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    // 执行每个SQL语句
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('执行SQL语句成功');
      }
    }
    
    console.log('通知管理表创建完成！');
    process.exit(0);
    
  } catch (error) {
    console.error('创建通知管理表失败:', error);
    process.exit(1);
  }
}

setupNotifications();