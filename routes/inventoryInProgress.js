const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取在产情况数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer_type, initial_amount, current_amount 
            FROM inventory_in_progress 
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
                customerType: row.customer_type,
                initialAmount: parseFloat(row.initial_amount),
                currentAmount: parseFloat(row.current_amount)
            })),
            component: rows.filter(row => row.category === '元件').map(row => ({
                customerType: row.customer_type,
                initialAmount: parseFloat(row.initial_amount),
                currentAmount: parseFloat(row.current_amount)
            })),
            project: rows.filter(row => row.category === '工程').map(row => ({
                customerType: row.customer_type,
                initialAmount: parseFloat(row.initial_amount),
                currentAmount: parseFloat(row.current_amount)
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取在产情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存在产情况数据
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
        await pool.execute('DELETE FROM inventory_in_progress WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO inventory_in_progress (period, category, customer_type, initial_amount, current_amount) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '在产情况数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存在产情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新在产情况数据
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
        await pool.execute('DELETE FROM inventory_in_progress WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO inventory_in_progress (period, category, customer_type, initial_amount, current_amount) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '在产情况数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新在产情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除在产情况数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM inventory_in_progress WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '在产情况数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除在产情况数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;