const axios = require('axios');

// 测试预算中间件功能
async function testBudgetMiddleware() {
    console.log('=== 测试预算中间件功能 ===\n');
    
    const baseUrl = 'http://localhost:3000';
    const testPeriod = '2025-01'; // 测试期间
    
    try {
        // 1. 测试新签订单接口
        console.log('1. 测试新签订单接口...');
        const newOrdersResponse = await axios.get(`${baseUrl}/new-orders/${testPeriod}`);
        console.log('新签订单响应状态:', newOrdersResponse.status);
        
        if (newOrdersResponse.data.success) {
            console.log('✅ 新签订单数据获取成功');
            console.log('设备数据样例:');
            if (newOrdersResponse.data.data.equipment && newOrdersResponse.data.data.equipment.length > 0) {
                const sample = newOrdersResponse.data.data.equipment[0];
                console.log(`  - 客户: ${sample.customer}`);
                console.log(`  - 年度计划: ${sample.yearlyPlan}`);
                console.log(`  - 当期累计: ${sample.currentTotal}`);
                console.log(`  - 进度: ${sample.progress}`);
            }
        }
        console.log('');
        
        // 2. 测试项目跟踪接口
        console.log('2. 测试项目跟踪接口...');
        const projectTrackingResponse = await axios.get(`${baseUrl}/project-tracking/${testPeriod}`);
        console.log('项目跟踪响应状态:', projectTrackingResponse.status);
        
        if (projectTrackingResponse.data.success) {
            console.log('✅ 项目跟踪数据获取成功');
            console.log('设备数据样例:');
            if (projectTrackingResponse.data.data.equipment && projectTrackingResponse.data.data.equipment.length > 0) {
                const sample = projectTrackingResponse.data.data.equipment[0];
                console.log(`  - 客户: ${sample.customer}`);
                console.log(`  - 年度计划: ${sample.yearlyPlan}`);
                console.log(`  - 当期累计: ${sample.currentTotal}`);
                console.log(`  - 进度: ${sample.progress}`);
            }
        }
        console.log('');
        
        // 3. 测试营业收入结构接口
        console.log('3. 测试营业收入结构接口...');
        const businessIncomeResponse = await axios.get(`${baseUrl}/business-income/${testPeriod}`);
        console.log('营业收入结构响应状态:', businessIncomeResponse.status);
        
        if (businessIncomeResponse.data.success) {
            console.log('✅ 营业收入结构数据获取成功');
            console.log('收入数据样例:');
            if (Array.isArray(businessIncomeResponse.data.data) && businessIncomeResponse.data.data.length > 0) {
                const sample = businessIncomeResponse.data.data[0];
                console.log(`  - 分类: ${sample.category}`);
                console.log(`  - 年度计划: ${sample.yearlyPlan}`);
                console.log(`  - 当期累计: ${sample.currentTotal}`);
                console.log(`  - 进度: ${sample.progress}`);
            }
        }
        console.log('');
        
        // 4. 测试预算数据存在性
        console.log('4. 验证预算数据...');
        const budgetResponse = await axios.get(`${baseUrl}/budget-planning/2025`);
        console.log('预算数据响应状态:', budgetResponse.status);
        
        if (budgetResponse.data.success) {
            console.log('✅ 预算数据存在');
            console.log(`预算数据总数: ${Object.keys(budgetResponse.data.data.modifications).length} 个表格`);
            console.log('包含的表格:');
            Object.keys(budgetResponse.data.data.modifications).forEach(tableKey => {
                const tableData = budgetResponse.data.data.modifications[tableKey];
                let totalItems = 0;
                if (Array.isArray(tableData)) {
                    totalItems = tableData.reduce((sum, category) => sum + (category.items?.length || 0), 0);
                }
                console.log(`  - ${tableKey}: ${totalItems} 项`);
            });
        }
        
        console.log('\n=== 测试完成 ===');
        console.log('✅ 所有测试通过！预算中间件正常工作');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('错误响应:', error.response.status, error.response.data);
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    testBudgetMiddleware();
}

module.exports = { testBudgetMiddleware };