const fs = require('fs');
const path = require('path');

// 表格键值与路由文件的映射关系
const tableRouteMapping = {
    // 已完成的前三个表格
    'new_orders': 'newOrders.js',
    'project_tracking': 'projectTracking.js', 
    'business_income_structure': 'businessIncome.js',
    
    // 需要集成的其他表格
    'main_business_income_breakdown': 'mainBusinessIncome.js',
    'current_year_order_to_income': 'orderToIncome.js',
    'stock_order_to_income': 'stockOrderToIncome.js',
    'non_main_business': 'nonMainBusiness.js',
    'inventory_structure_quality': 'inventoryStructure.js',
    'bid_fulfillment_status': 'bidFulfillment.js',
    'work_in_progress': 'inventoryInProgress.js',
    'contract_inventory': 'contractInventory.js',
    'main_business_cost_structure': 'mainBusinessCost.js',
    'department_cost_center_profit_loss': 'departmentCostInput.js',
    'main_business_contribution_rate_structure': 'businessContribution.js',
    'cost_estimate_personnel_withdrawals': 'costEstimation.js',
    'main_business_gross_profit_rate_structure': 'businessProfitMargin.js',
    'net_profit_structure_quality': 'netProfitStructure.js',
    'main_business_net_profit_contribution': 'mainBusinessNetProfit.js',
    'non_main_business_net_profit_contribution': 'nonMainBusinessNetProfit.js',
    'payment_structure_quality': 'receiptStructure.js',
    'accounts_receivable_situation': 'accountsReceivable.js',
    'overdue_accounts_receivable_situation': 'overdueReceivables.js',
    'bad_debt_provision_situation': 'badDebtProvision.js'
};

const routesDir = '/Users/yaowenya/Desktop/大亚发展集团/financial-backend/routes';

// 为路由文件集成预算中间件
function integrateMiddleware(filePath, tableKey) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经集成了中间件
        if (content.includes('createBudgetMiddleware')) {
            console.log(`  ✓ ${path.basename(filePath)} 已集成预算中间件`);
            return;
        }
        
        // 1. 添加中间件导入
        const requirePattern = /const { pool } = require\(['"]\.\.\/config\/database['"]\);/;
        if (requirePattern.test(content)) {
            content = content.replace(
                requirePattern,
                `const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');`
            );
        }
        
        // 2. 查找GET路由并添加中间件
        const getRoutePattern = /router\.get\(['"]\/:(period|id)['"]\s*,\s*async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*{/;
        if (getRoutePattern.test(content)) {
            content = content.replace(
                getRoutePattern,
                `router.get('/:period', createBudgetMiddleware('${tableKey}'), async (req, res) => {`
            );
        }
        
        // 3. 写回文件
        fs.writeFileSync(filePath, content);
        console.log(`  ✓ ${path.basename(filePath)} 成功集成预算中间件`);
        
    } catch (error) {
        console.error(`  ✗ ${path.basename(filePath)} 集成失败:`, error.message);
    }
}

// 批量处理函数
function batchIntegrateMiddleware() {
    console.log('=== 批量集成预算中间件 ===\n');
    
    // 跳过已完成的前三个表格
    const skipTables = ['new_orders', 'project_tracking', 'business_income_structure'];
    
    let processedCount = 0;
    let skippedCount = 0;
    
    Object.entries(tableRouteMapping).forEach(([tableKey, routeFile]) => {
        if (skipTables.includes(tableKey)) {
            console.log(`  - 跳过 ${routeFile} (已完成)`);
            skippedCount++;
            return;
        }
        
        const filePath = path.join(routesDir, routeFile);
        
        if (fs.existsSync(filePath)) {
            console.log(`处理 ${routeFile} (${tableKey})...`);
            integrateMiddleware(filePath, tableKey);
            processedCount++;
        } else {
            console.log(`  ✗ ${routeFile} 文件不存在`);
        }
    });
    
    console.log(`\n=== 批量集成完成 ===`);
    console.log(`处理: ${processedCount} 个文件`);
    console.log(`跳过: ${skippedCount} 个文件 (已完成)`);
}

// 验证路由文件是否存在
function validateRouteFiles() {
    console.log('=== 验证路由文件存在性 ===\n');
    
    const missingFiles = [];
    const existingFiles = [];
    
    Object.entries(tableRouteMapping).forEach(([tableKey, routeFile]) => {
        const filePath = path.join(routesDir, routeFile);
        
        if (fs.existsSync(filePath)) {
            existingFiles.push({ tableKey, routeFile });
            console.log(`  ✓ ${routeFile} (${tableKey})`);
        } else {
            missingFiles.push({ tableKey, routeFile });
            console.log(`  ✗ ${routeFile} (${tableKey}) - 文件不存在`);
        }
    });
    
    console.log(`\n存在: ${existingFiles.length} 个文件`);
    console.log(`缺失: ${missingFiles.length} 个文件`);
    
    return { existingFiles, missingFiles };
}

// 主函数
function main() {
    const { existingFiles, missingFiles } = validateRouteFiles();
    
    if (missingFiles.length > 0) {
        console.log('\n警告: 以下文件不存在，将跳过:');
        missingFiles.forEach(({ tableKey, routeFile }) => {
            console.log(`  - ${routeFile} (${tableKey})`);
        });
    }
    
    console.log('\n');
    batchIntegrateMiddleware();
}

// 执行主函数
main();