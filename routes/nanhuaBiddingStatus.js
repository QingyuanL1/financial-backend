const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华招投标情况数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的项目列表
    const fixedData = {
      projects: [
        { projectName: '一包项目' },
        { projectName: '二包项目' },
        { projectName: '域内合作项目' },
        { projectName: '域外合作项目' },
        { projectName: '新能源项目' },
        { projectName: '苏州项目' }
      ]
    };
    
    // 从数据库获取数据
    const [rows] = await pool.execute(
      'SELECT project_name, bid_count, win_count, win_rate FROM nanhua_bidding_status WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      projects: fixedData.projects.map(item => {
        const dbItem = rows.find(row => row.project_name === item.projectName);
        return {
          projectName: item.projectName,
          bidCount: dbItem ? parseInt(dbItem.bid_count) : 0,
          winCount: dbItem ? parseInt(dbItem.win_count) : 0,
          winRate: dbItem ? parseFloat(dbItem.win_rate) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华招投标情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华招投标情况数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.projects) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的参数'
    });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 删除该期间的旧数据
    await connection.execute(
      'DELETE FROM nanhua_bidding_status WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.projects) {
      if (item.bidCount > 0 || item.winCount > 0) {
        // 计算中标率
        const winRate = item.bidCount > 0 ? (item.winCount / item.bidCount * 100) : 0;
        
        await connection.execute(
          `INSERT INTO nanhua_bidding_status 
           (period, project_name, bid_count, win_count, win_rate, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            period,
            item.projectName,
            item.bidCount || 0,
            item.winCount || 0,
            winRate,
            '工程'
          ]
        );
      }
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '数据保存成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存南华招投标情况数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;