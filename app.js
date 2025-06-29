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