const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

// 导入路由
const balanceSheetRoutes = require('./routes/balanceSheet');
const cashFlowRoutes = require('./routes/cashFlow');
const incomeStatementRoutes = require('./routes/incomeStatement');
const businessIncomeRoutes = require('./routes/businessIncome');
const mainBusinessIncomeRoutes = require('./routes/mainBusinessIncome');
const orderToIncomeRoutes = require('./routes/orderToIncome');

// 新增的六个财务报表路由
const stockOrderToIncomeRoutes = require('./routes/stockOrderToIncome');
const nonMainBusinessRoutes = require('./routes/nonMainBusiness');
const costCenterStructureRoutes = require('./routes/costCenterStructure');
const businessContributionRoutes = require('./routes/businessContribution');
const businessProfitMarginRoutes = require('./routes/businessProfitMargin');
const netProfitStructureRoutes = require('./routes/netProfitStructure');

// 第二批六个财务报表路由
const mainBusinessNetProfitRoutes = require('./routes/mainBusinessNetProfit');
const nonMainBusinessNetProfitRoutes = require('./routes/nonMainBusinessNetProfit');
const receiptStructureRoutes = require('./routes/receiptStructure');
const accountsReceivableRoutes = require('./routes/accountsReceivable');
const overdueReceivablesRoutes = require('./routes/overdueReceivables');
const badDebtProvisionRoutes = require('./routes/badDebtProvision');

// 第三批营销相关报表路由
const newOrdersRoutes = require('./routes/newOrders');
const projectTrackingRoutes = require('./routes/projectTracking');
const biddingStatusRoutes = require('./routes/biddingStatus');

// 第四批财务报表路由
const bidFulfillmentRoutes = require('./routes/bidFulfillment');
const inventoryStructureRoutes = require('./routes/inventoryStructure');
const inventoryInProgressRoutes = require('./routes/inventoryInProgress');

// 第五批财务报表路由
const contractInventoryRoutes = require('./routes/contractInventory');
const mainBusinessCostRoutes = require('./routes/mainBusinessCost');
const costEstimationRoutes = require('./routes/costEstimation');

// 生产计划执行情况路由
const productionPlanExecutionRoutes = require('./routes/productionPlanExecution');

// 产值结构与质量路由
const productionStructureRoutes = require('./routes/productionStructure');

// 生产执行情况路由
const productionExecutionRoutes = require('./routes/productionExecution');

// 企管相关路由
const departmentCostCenterRoutes = require('./routes/departmentCostCenter');
const departmentCostInputRoutes = require('./routes/departmentCostInput');
const majorInvestmentAnalysisRoutes = require('./routes/majorInvestmentAnalysis');
const budgetExecutionRoutes = require('./routes/budgetExecution');

// 权限系统路由
const permissionsRoutes = require('./routes/permissions');
const userManagementRoutes = require('./routes/userManagement');
const dashboardRoutes = require('./routes/dashboard');

// 认证路由
const authRoutes = require('./routes/auth');

// 表单提交路由
const formSubmissionsRoutes = require('./routes/formSubmissions');

// 文件上传路由
const fileUploadRoutes = require('./routes/fileUpload');

// 数据分析路由
const analyticsRoutes = require('./routes/analytics');

// 通知管理路由
const notificationsRoutes = require('./routes/notifications');

// 年度预算计划路由
const budgetPlanningRoutes = require('./routes/budgetPlanning');

// 南华公司专用路由
const nanhuaNewOrdersRoutes = require('./routes/nanhuaNewOrders');
const nanhuaProjectTrackingRoutes = require('./routes/nanhuaProjectTracking');
const nanhuaBiddingStatusRoutes = require('./routes/nanhuaBiddingStatus');
const nanhuaBusinessIncomeRoutes = require('./routes/nanhuaBusinessIncome');
const nanhuaOrderToIncomeRoutes = require('./routes/nanhuaOrderToIncome');
const nanhuaNonMainBusinessRoutes = require('./routes/nanhuaNonMainBusiness');
const nanhuaStockOrderToIncomeRoutes = require('./routes/nanhuaStockOrderToIncome');
const nanhuaInventoryStructureRoutes = require('./routes/nanhuaInventoryStructure');
const nanhuaBidFulfillmentRoutes = require('./routes/nanhuaBidFulfillment');
const nanhuaMainBusinessCostRoutes = require('./routes/nanhuaMainBusinessCost');
const nanhuaContractInventoryRoutes = require('./routes/nanhuaContractInventory');
const nanhuaCostProvisionRoutes = require('./routes/nanhuaCostProvision');
const nanhuaReceiptStructureRoutes = require('./routes/nanhuaReceiptStructure');
const nanhuaContractInventoryEvaluationRoutes = require('./routes/nanhuaContractInventoryEvaluation');
const nanhuaCostCenterStructureRoutes = require('./routes/nanhuaCostCenterStructure');
const departmentCostCenterActualRoutes = require('./routes/departmentCostCenterActual');
const nanhuaDepartmentCostCenterActualRoutes = require('./routes/nanhuaDepartmentCostCenterActual');
const nanhuaDepartmentCostInputRoutes = require('./routes/nanhuaDepartmentCostInput');
const nanhuaBusinessContributionWithSelfBuiltRoutes = require('./routes/nanhuaBusinessContributionWithSelfBuilt');
const nanhuaBusinessProfitMarginWithSelfBuiltRoutes = require('./routes/nanhuaBusinessProfitMarginWithSelfBuilt');
const nanhuaMainBusinessNetProfitRoutes = require('./routes/nanhuaMainBusinessNetProfit');
const nanhuaNonMainBusinessNetProfitRoutes = require('./routes/nanhuaNonMainBusinessNetProfit');
const nanhuaAnalysisAppendixRoutes = require('./routes/nanhua-analysis-appendix');
const nanhuaOverdueReceivablesRoutes = require('./routes/nanhua-overdue-receivables');
const nanhuaBadDebtProvisionRoutes = require('./routes/nanhua-bad-debt-provision');
const nanhuaSelfConstructionAnalysisRoutes = require('./routes/nanhua-self-construction-analysis');
const nanhuaConstructionPlanExecutionRoutes = require('./routes/nanhua-construction-plan-execution');
const nanhuaConstructionExecutionStatusRoutes = require('./routes/nanhua-construction-execution-status');
const nanhuaMajorInvestmentRoutes = require('./routes/nanhua-major-investment');

// 拓源公司专用路由
const tuoyuanNewOrderStructureRoutes = require('./routes/tuoyuan-new-order-structure');
const tuoyuanProjectTrackingRoutes = require('./routes/tuoyuan-project-tracking');
const tuoyuanBiddingStatusRoutes = require('./routes/tuoyuan-bidding-status');
const tuoyuanOrderToIncomeRoutes = require('./routes/tuoyuan-order-to-income');
const tuoyuanMainBusinessIncomeBreakdownRoutes = require('./routes/tuoyuan-main-business-income-breakdown');
const tuoyuanStockOrderToIncomeRoutes = require('./routes/tuoyuan-stock-order-to-income');
const tuoyuanNonMainBusinessRoutes = require('./routes/tuoyuan-non-main-business');
const tuoyuanInventoryStructureRoutes = require('./routes/tuoyuan-inventory-structure');
const tuoyuanBidFulfillmentRoutes = require('./routes/tuoyuan-bid-fulfillment');
const tuoyuanInventoryInProgressRoutes = require('./routes/tuoyuan-inventory-in-progress');
const tuoyuanInventoryStatusRoutes = require('./routes/tuoyuan-inventory-status');
const tuoyuanMainBusinessCostStructureQualityRoutes = require('./routes/tuoyuan-main-business-cost-structure-quality');
const tuoyuanCostEstimationRoutes = require('./routes/tuoyuan-cost-estimation');
const tuoyuanCostCenterProfitLossRoutes = require('./routes/tuoyuan-cost-center-profit-loss');
const tuoyuanMainBusinessContributionRateRoutes = require('./routes/tuoyuan-main-business-contribution-rate');
const tuoyuanMainBusinessNetProfitContributionRoutes = require('./routes/tuoyuan-main-business-net-profit-contribution');
const tuoyuanMainBusinessProfitMarginRoutes = require('./routes/tuoyuan-main-business-profit-margin');
const tuoyuanPaymentStructureQualityRoutes = require('./routes/tuoyuan-payment-structure-quality');
const tuoyuanAccountsReceivableRoutes = require('./routes/tuoyuan-accounts-receivable');
const tuoyuanOverdueReceivablesRoutes = require('./routes/tuoyuan-overdue-receivables');
const tuoyuanBadDebtProvisionRoutes = require('./routes/tuoyuan-bad-debt-provision');
const tuoyuanConstructionPlanExecutionRoutes = require('./routes/tuoyuan-construction-plan-execution');
const tuoyuanMajorInvestmentRoutes = require('./routes/tuoyuan-major-investment');
const tuoyuanMainBusinessProductionValueSelfConstructionRoutes = require('./routes/tuoyuan-main-business-production-value-self-construction');
const tuoyuanConstructionExecutionStatusRoutes = require('./routes/tuoyuan-construction-execution-status');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 测试数据库连接
testConnection();

// 路由
app.use('/balance-sheet', balanceSheetRoutes);
app.use('/cash-flow', cashFlowRoutes);
app.use('/income-statement', incomeStatementRoutes);
app.use('/business-income', businessIncomeRoutes);
app.use('/main-business-income', mainBusinessIncomeRoutes);
app.use('/order-to-income', orderToIncomeRoutes);

// 新增的六个财务报表路由
app.use('/stock-order-to-income', stockOrderToIncomeRoutes);
app.use('/non-main-business', nonMainBusinessRoutes);
app.use('/cost-center-structure', costCenterStructureRoutes);
app.use('/business-contribution', businessContributionRoutes);
app.use('/business-profit-margin', businessProfitMarginRoutes);
app.use('/net-profit-structure', netProfitStructureRoutes);

// 第二批六个财务报表路由
app.use('/main-business-net-profit', mainBusinessNetProfitRoutes);
app.use('/non-main-business-net-profit', nonMainBusinessNetProfitRoutes);
app.use('/receipt-structure', receiptStructureRoutes);
app.use('/accounts-receivable', accountsReceivableRoutes);
app.use('/overdue-receivables', overdueReceivablesRoutes);
app.use('/bad-debt-provision', badDebtProvisionRoutes);

// 第三批营销相关报表路由
app.use('/new-orders', newOrdersRoutes);
app.use('/project-tracking', projectTrackingRoutes);
app.use('/bidding-status', biddingStatusRoutes);

// 第四批财务报表路由
app.use('/bid-fulfillment', bidFulfillmentRoutes);
app.use('/inventory-structure', inventoryStructureRoutes);
app.use('/inventory-in-progress', inventoryInProgressRoutes);

// 第五批财务报表路由
app.use('/contract-inventory', contractInventoryRoutes);
app.use('/main-business-cost', mainBusinessCostRoutes);
app.use('/cost-estimation', costEstimationRoutes);

// 生产计划执行情况路由
app.use('/production-plan-execution', productionPlanExecutionRoutes);

// 产值结构与质量路由
app.use('/production-structure', productionStructureRoutes);

// 生产执行情况路由
app.use('/production-execution', productionExecutionRoutes);

// 企管相关路由
app.use('/department-cost-center', departmentCostCenterRoutes);
app.use('/department-cost-input', departmentCostInputRoutes);
app.use('/major-investment-analysis', majorInvestmentAnalysisRoutes);
app.use('/budget-execution', budgetExecutionRoutes);

// 权限系统路由
app.use('/permissions', permissionsRoutes);
app.use('/users', userManagementRoutes);
app.use('/dashboard', dashboardRoutes);

// 认证路由
app.use('/auth', authRoutes);

// 表单提交路由
app.use('/forms', formSubmissionsRoutes);

// 文件上传路由
app.use('/files', fileUploadRoutes);

// 数据分析路由
app.use('/analytics', analyticsRoutes);

// 通知管理路由
app.use('/notifications', notificationsRoutes);

// 年度预算计划路由
app.use('/budget-planning', budgetPlanningRoutes);

// 南华公司专用路由
app.use('/nanhua-new-orders', nanhuaNewOrdersRoutes);
app.use('/nanhua-project-tracking', nanhuaProjectTrackingRoutes);
app.use('/nanhua-bidding-status', nanhuaBiddingStatusRoutes);
app.use('/nanhua-business-income', nanhuaBusinessIncomeRoutes);
app.use('/nanhua-order-to-income', nanhuaOrderToIncomeRoutes);
app.use('/nanhua-non-main-business', nanhuaNonMainBusinessRoutes);
app.use('/nanhua-stock-order-to-income', nanhuaStockOrderToIncomeRoutes);
app.use('/nanhua-inventory-structure', nanhuaInventoryStructureRoutes);
app.use('/nanhua-bid-fulfillment', nanhuaBidFulfillmentRoutes);
app.use('/nanhua-main-business-cost', nanhuaMainBusinessCostRoutes);
app.use('/nanhua-contract-inventory', nanhuaContractInventoryRoutes);
app.use('/nanhua-cost-provision', nanhuaCostProvisionRoutes);
app.use('/nanhua-receipt-structure', nanhuaReceiptStructureRoutes);
app.use('/nanhua-contract-inventory-evaluation', nanhuaContractInventoryEvaluationRoutes);
app.use('/nanhua-cost-center-structure', nanhuaCostCenterStructureRoutes);
app.use('/department-cost-center-actual', departmentCostCenterActualRoutes);
app.use('/nanhua-department-cost-center-actual', nanhuaDepartmentCostCenterActualRoutes);
app.use('/nanhua-department-cost-input', nanhuaDepartmentCostInputRoutes);
app.use('/nanhua-business-contribution-with-self-built', nanhuaBusinessContributionWithSelfBuiltRoutes);
app.use('/nanhua-business-profit-margin-with-self-built', nanhuaBusinessProfitMarginWithSelfBuiltRoutes);
app.use('/nanhua-main-business-net-profit', nanhuaMainBusinessNetProfitRoutes);
app.use('/nanhua-non-main-business-net-profit', nanhuaNonMainBusinessNetProfitRoutes);
app.use('/nanhua-analysis-appendix', nanhuaAnalysisAppendixRoutes);
app.use('/nanhua-overdue-receivables', nanhuaOverdueReceivablesRoutes);
app.use('/nanhua-bad-debt-provision', nanhuaBadDebtProvisionRoutes);
app.use('/nanhua-self-construction-analysis', nanhuaSelfConstructionAnalysisRoutes);
app.use('/nanhua-construction-plan-execution', nanhuaConstructionPlanExecutionRoutes);
app.use('/nanhua-construction-execution-status', nanhuaConstructionExecutionStatusRoutes);
app.use('/nanhua-major-investment', nanhuaMajorInvestmentRoutes);

// 拓源公司专用路由
app.use('/tuoyuan-new-order-structure', tuoyuanNewOrderStructureRoutes);
app.use('/tuoyuan-project-tracking', tuoyuanProjectTrackingRoutes);
app.use('/tuoyuan-bidding-status', tuoyuanBiddingStatusRoutes);
app.use('/tuoyuan-order-to-income', tuoyuanOrderToIncomeRoutes);
app.use('/tuoyuan-main-business-income-breakdown', tuoyuanMainBusinessIncomeBreakdownRoutes);
app.use('/tuoyuan-stock-order-to-income', tuoyuanStockOrderToIncomeRoutes);
app.use('/tuoyuan-non-main-business', tuoyuanNonMainBusinessRoutes);
app.use('/tuoyuan-inventory-structure', tuoyuanInventoryStructureRoutes);
app.use('/tuoyuan-bid-fulfillment', tuoyuanBidFulfillmentRoutes);
app.use('/tuoyuan-inventory-in-progress', tuoyuanInventoryInProgressRoutes);
app.use('/tuoyuan-inventory-status', tuoyuanInventoryStatusRoutes);
app.use('/tuoyuan-main-business-cost-structure-quality', tuoyuanMainBusinessCostStructureQualityRoutes);
app.use('/tuoyuan-cost-estimation', tuoyuanCostEstimationRoutes);
app.use('/tuoyuan-cost-center-profit-loss', tuoyuanCostCenterProfitLossRoutes);
app.use('/tuoyuan-main-business-contribution-rate', tuoyuanMainBusinessContributionRateRoutes);
app.use('/tuoyuan-main-business-net-profit-contribution', tuoyuanMainBusinessNetProfitContributionRoutes);
app.use('/tuoyuan-main-business-profit-margin', tuoyuanMainBusinessProfitMarginRoutes);
app.use('/tuoyuan-payment-structure-quality', tuoyuanPaymentStructureQualityRoutes);
app.use('/tuoyuan-accounts-receivable', tuoyuanAccountsReceivableRoutes);
app.use('/tuoyuan-overdue-receivables', tuoyuanOverdueReceivablesRoutes);
app.use('/tuoyuan-bad-debt-provision', tuoyuanBadDebtProvisionRoutes);
app.use('/tuoyuan-construction-plan-execution', tuoyuanConstructionPlanExecutionRoutes);
app.use('/tuoyuan-major-investment', tuoyuanMajorInvestmentRoutes);
app.use('/tuoyuan-main-business-production-value-self-construction', tuoyuanMainBusinessProductionValueSelfConstructionRoutes);
app.use('/tuoyuan-construction-execution-status', tuoyuanConstructionExecutionStatusRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '财务分析后端服务运行正常' });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: error.message 
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`财务分析后端服务启动成功，端口: ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});