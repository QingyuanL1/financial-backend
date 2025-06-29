const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取招投标情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer, bid_amount, win_amount, win_rate 
            FROM bidding_status 
            WHERE period = ? 
            ORDER BY 
                CASE category 
                    WHEN '设备' THEN 1 
                    WHEN '元件' THEN 2 
                    WHEN '工程' THEN 3 
                END,
                id
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        // 按类别分组数据
        const data = {
            equipment: rows.filter(row => row.category === '设备').map(row => ({
                customer: row.customer,
                bidAmount: parseFloat(row.bid_amount),
                winAmount: parseFloat(row.win_amount),
                winRate: parseFloat(row.win_rate)
            })),
            components: rows.filter(row => row.category === '元件').map(row => ({
                customer: row.customer,
                bidAmount: parseFloat(row.bid_amount),
                winAmount: parseFloat(row.win_amount),
                winRate: parseFloat(row.win_rate)
            })),
            engineering: rows.filter(row => row.category === '工程').map(row => ({
                customer: row.customer,
                bidAmount: parseFloat(row.bid_amount),
                winAmount: parseFloat(row.win_amount),
                winRate: parseFloat(row.win_rate)
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取招投标情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存招投标情况数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM bidding_status WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customer,
                    item.bidAmount || 0,
                    item.winAmount || 0,
                    item.winRate || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.components) {
            data.components.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customer,
                    item.bidAmount || 0,
                    item.winAmount || 0,
                    item.winRate || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.engineering) {
            data.engineering.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customer,
                    item.bidAmount || 0,
                    item.winAmount || 0,
                    item.winRate || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO bidding_status (period, category, customer, bid_amount, win_amount, win_rate) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '招投标情况数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存招投标情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新招投标情况数据
router.put('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少数据参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM bidding_status WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customer,
                    item.bidAmount || 0,
                    item.winAmount || 0,
                    item.winRate || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.components) {
            data.components.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customer,
                    item.bidAmount || 0,
                    item.winAmount || 0,
                    item.winRate || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.engineering) {
            data.engineering.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customer,
                    item.bidAmount || 0,
                    item.winAmount || 0,
                    item.winRate || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO bidding_status (period, category, customer, bid_amount, win_amount, win_rate) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '招投标情况数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新招投标情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除招投标情况数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM bidding_status WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '招投标情况数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除招投标情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;