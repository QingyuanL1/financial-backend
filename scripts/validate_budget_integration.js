/**
 * 预算数据集成验证脚本
 * 测试所有23个表格的预算数据集成功能
 */

const fs = require('fs');
const path = require('path');

// 所有表格的完整映射
const allTableMappings = {
    'new_orders': { route: 'new-orders', name: '新签订单结构与质量' },
    'project_tracking': { route: 'project-tracking', name: '项目跟踪情况' },
    'business_income_structure': { route: 'business-income', name: '营业收入结构与质量' },
    'main_business_income_breakdown': { route: 'main-business-income', name: '主营业务收入分解' },
    'current_year_order_to_income': { route: 'order-to-income', name: '当年订单转收入' },
    'stock_order_to_income': { route: 'stock-order-to-income', name: '存量订单转收入' },
    'non_main_business': { route: 'non-main-business', name: '非主营业务' },
    'inventory_structure_quality': { route: 'inventory-structure', name: '库存结构质量' },
    'bid_fulfillment_status': { route: 'bid-fulfillment', name: '标书履约状况' },
    'work_in_progress': { route: 'inventory-in-progress', name: '在制品' },
    'contract_inventory': { route: 'contract-inventory', name: '合同库存' },
    'main_business_cost_structure': { route: 'main-business-cost', name: '主营业务成本结构' },
    'department_cost_center_profit_loss': { route: 'department-cost-input', name: '部门成本中心盈亏' },
    'main_business_contribution_rate_structure': { route: 'business-contribution', name: '主营业务贡献率结构' },
    'cost_estimate_personnel_withdrawals': { route: 'cost-estimation', name: '成本估算人员提取' },
    'main_business_gross_profit_rate_structure': { route: 'business-profit-margin', name: '主营业务毛利率结构' },
    'net_profit_structure_quality': { route: 'net-profit-structure', name: '净利润结构质量' },
    'main_business_net_profit_contribution': { route: 'main-business-net-profit', name: '主营业务净利润贡献' },
    'non_main_business_net_profit_contribution': { route: 'non-main-business-net-profit', name: '非主营业务净利润贡献' },
    'payment_structure_quality': { route: 'receipt-structure', name: '回款结构质量' },
    'accounts_receivable_situation': { route: 'accounts-receivable', name: '应收账款情况' },
    'overdue_accounts_receivable_situation': { route: 'overdue-receivables', name: '逾期应收账款情况' },
    'bad_debt_provision_situation': { route: 'bad-debt-provision', name: '坏账准备情况' }
};

/**
 * 发送HTTP请求
 */
async function makeRequest(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        return { success: false, error: error.message, status: 0 };
    }
}

/**
 * 验证单个API端点
 */
async function validateEndpoint(tableKey, routeInfo, testPeriod) {
    console.log(`\n测试 ${routeInfo.name} (${tableKey})...`);
    
    const url = `http://localhost:3000/${routeInfo.route}/${testPeriod}`;
    const result = await makeRequest(url);
    
    if (!result.success) {
        if (result.status === 404) {
            console.log(`  ⚠️  数据不存在 (${testPeriod})`);
            return { status: 'no_data', tableKey, message: '测试期间无数据' };
        } else {
            console.log(`  ❌ API错误: ${result.error || result.data?.error}`);
            return { status: 'error', tableKey, message: result.error || result.data?.error };
        }
    }
    
    // 分析响应数据结构
    const responseData = result.data;
    if (!responseData.success || !responseData.data) {
        console.log(`  ❌ 响应格式错误`);
        return { status: 'format_error', tableKey, message: '响应格式错误' };
    }
    
    let budgetDataFound = false;
    let sampleItem = null;
    
    // 检查不同的数据结构
    if (Array.isArray(responseData.data)) {
        // 数组结构
        sampleItem = responseData.data[0];
        budgetDataFound = responseData.data.some(item => 
            item.yearlyPlan !== undefined && item.yearlyPlan !== null && item.yearlyPlan !== 0
        );
    } else if (typeof responseData.data === 'object') {
        // 对象结构，检查各个类别
        const categories = Object.keys(responseData.data);
        for (const category of categories) {
            if (Array.isArray(responseData.data[category])) {
                const categoryData = responseData.data[category];
                if (categoryData.length > 0) {
                    sampleItem = categoryData[0];
                    budgetDataFound = categoryData.some(item => 
                        item.yearlyPlan !== undefined && item.yearlyPlan !== null && item.yearlyPlan !== 0
                    );
                    if (budgetDataFound) break;
                }
            }
        }
    }
    
    if (budgetDataFound) {
        console.log(`  ✅ 预算数据集成成功`);
        console.log(`     年度计划: ${sampleItem.yearlyPlan}`);
        console.log(`     当期数据: ${sampleItem.currentTotal || sampleItem.incomeTotal || 'N/A'}`);
        console.log(`     执行进度: ${sampleItem.progress || 'N/A'}`);
        
        return { 
            status: 'success', 
            tableKey, 
            sampleData: {
                yearlyPlan: sampleItem.yearlyPlan,
                currentTotal: sampleItem.currentTotal || sampleItem.incomeTotal,
                progress: sampleItem.progress
            }
        };
    } else {
        console.log(`  ⚠️  预算数据未找到`);
        return { status: 'no_budget', tableKey, message: '预算数据未附加' };
    }
}

/**
 * 批量验证所有端点
 */
async function validateAllEndpoints() {
    console.log('=== 预算数据集成验证 ===');
    console.log(`测试时间: ${new Date().toLocaleString()}`);
    
    const testPeriods = ['2025-06', '2025-07', '2025-05'];
    let successCount = 0;
    let errorCount = 0;
    let noDataCount = 0;
    let noBudgetCount = 0;
    
    const results = [];
    
    for (const [tableKey, routeInfo] of Object.entries(allTableMappings)) {
        let testResult = null;
        
        // 尝试多个测试期间
        for (const period of testPeriods) {
            testResult = await validateEndpoint(tableKey, routeInfo, period);
            if (testResult.status === 'success' || testResult.status === 'no_budget') {
                break; // 找到有数据的期间就停止
            }
        }
        
        results.push({
            tableKey,
            name: routeInfo.name,
            route: routeInfo.route,
            ...testResult
        });
        
        switch (testResult.status) {
            case 'success':
                successCount++;
                break;
            case 'error':
                errorCount++;
                break;
            case 'no_data':
                noDataCount++;
                break;
            case 'no_budget':
                noBudgetCount++;
                break;
        }
    }
    
    // 输出统计结果
    console.log('\n=== 验证结果统计 ===');
    console.log(`总计表格: ${Object.keys(allTableMappings).length}`);
    console.log(`✅ 成功集成: ${successCount}`);
    console.log(`⚠️  无预算数据: ${noBudgetCount}`);
    console.log(`📊 无业务数据: ${noDataCount}`);
    console.log(`❌ API错误: ${errorCount}`);
    
    // 输出详细结果
    console.log('\n=== 详细结果 ===');
    results.forEach(result => {
        const statusIcon = {
            success: '✅',
            no_budget: '⚠️',
            no_data: '📊',
            error: '❌'
        }[result.status];
        
        console.log(`${statusIcon} ${result.name} (${result.route})`);
        if (result.sampleData) {
            console.log(`   年度计划: ${result.sampleData.yearlyPlan}, 进度: ${result.sampleData.progress}`);
        }
    });
    
    // 生成报告文件
    const reportPath = path.join(__dirname, '../test/budget_integration_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: Object.keys(allTableMappings).length,
            success: successCount,
            noBudget: noBudgetCount,
            noData: noDataCount,
            error: errorCount
        },
        results
    }, null, 2));
    
    console.log(`\n报告已保存到: ${reportPath}`);
    return results;
}

// 主函数
async function main() {
    try {
        await validateAllEndpoints();
        console.log('\n✅ 验证完成');
    } catch (error) {
        console.error('验证过程中发生错误:', error);
    }
}

// 检查是否为独立运行
if (require.main === module) {
    main();
}

module.exports = { validateAllEndpoints, validateEndpoint };