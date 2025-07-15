const { pool } = require('../config/database');

/**
 * 为2025年全年初始化所有业务数据
 * 基于预算表数据，在各个业务表中创建基础数据（数值都为0）
 */
async function init2025FullYearData() {
    try {
        console.log('🚀 开始初始化2025年全年业务数据...');
        
        // 获取所有预算数据
        const [budgetRows] = await pool.execute(`
            SELECT DISTINCT table_key, category, customer 
            FROM budget_planning 
            WHERE period = '2025' 
            ORDER BY table_key, 
                CASE category 
                    WHEN '设备' THEN 1 
                    WHEN '元件' THEN 2 
                    WHEN '工程' THEN 3 
                    WHEN '营业收入' THEN 4
                    WHEN '非主营业务' THEN 5
                    WHEN '部门成本中心' THEN 6
                    WHEN '净利润' THEN 7
                END
        `);
        
        console.log(`📊 找到 ${budgetRows.length} 项预算数据`);
        
        // 按表格分组
        const tableGroups = {};
        budgetRows.forEach(row => {
            if (!tableGroups[row.table_key]) {
                tableGroups[row.table_key] = [];
            }
            tableGroups[row.table_key].push(row);
        });
        
        console.log(`📋 需要处理 ${Object.keys(tableGroups).length} 个表格类型`);
        
        // 生成2025年所有月份
        const months = Array.from({length: 12}, (_, i) => `2025-${String(i + 1).padStart(2, '0')}`);
        
        // 1. 新签订单数据 (new_orders)
        if (tableGroups.new_orders) {
            console.log('📝 处理新签订单数据...');
            await initTableData('new_orders', tableGroups.new_orders, months, 
                (period, item) => [period, item.category, item.customer, 0, 0, 0]
            );
        }
        
        // 2. 项目跟踪数据 (project_tracking)
        if (tableGroups.project_tracking) {
            console.log('📈 处理项目跟踪数据...');
            await initTableData('project_tracking', tableGroups.project_tracking, months,
                (period, item) => [period, item.category, item.customer, 0, 0, 0]
            );
        }
        
        // 3. 主营业务收入分解情况 (main_business_income)
        if (tableGroups.main_business_income_breakdown) {
            console.log('💰 处理主营业务收入分解数据...');
            await initTableData('main_business_income', tableGroups.main_business_income_breakdown, months,
                (period, item) => [period, item.category, item.customer, 0, 0, 0]
            );
        }
        
        // 4. 当年订单转收入 (order_to_income)
        if (tableGroups.current_year_order_to_income) {
            console.log('🔄 处理当年订单转收入数据...');
            await initTableData('order_to_income', tableGroups.current_year_order_to_income, months,
                (period, item) => [period, item.category, item.customer, 0, 0, 0]
            );
        }
        
        // 5. 存量订单转收入 (stock_order_to_income)
        if (tableGroups.stock_order_to_income) {
            console.log('📦 处理存量订单转收入数据...');
            await initTableData('stock_order_to_income', tableGroups.stock_order_to_income, months,
                (period, item) => [period, item.category, item.customer, 0, 0, 0]
            );
        }
        
        // 6. 存量结构与质量 (inventory_structure)
        if (tableGroups.inventory_structure_quality) {
            console.log('📊 处理存量结构质量数据...');
            await initTableData('inventory_structure', tableGroups.inventory_structure_quality, months,
                (period, item) => [period, item.category, item.customer, 0, 0]
            );
        }
        
        // 7. 中标未履约情况 (bid_fulfillment)
        if (tableGroups.bid_fulfillment_status) {
            console.log('📋 处理中标未履约数据...');
            await initTableData('bid_fulfillment', tableGroups.bid_fulfillment_status, months,
                (period, item) => [period, item.category, item.customer, 0, 0]
            );
        }
        
        // 8. 在产情况 (inventory_in_progress)
        if (tableGroups.work_in_progress) {
            console.log('⚙️ 处理在产情况数据...');
            await initTableData('inventory_in_progress', tableGroups.work_in_progress, months,
                (period, item) => [period, item.category, item.customer, 0, 0]
            );
        }
        
        // 9. 库存情况(合同存量) (contract_inventory)
        if (tableGroups.contract_inventory) {
            console.log('📦 处理合同库存数据...');
            await initTableData('contract_inventory', tableGroups.contract_inventory, months,
                (period, item) => [period, item.category, item.customer, 0, 0]
            );
        }
        
        // 10. 主营业务成本结构 (main_business_cost)
        if (tableGroups.main_business_cost_structure) {
            console.log('💸 处理主营业务成本数据...');
            await initTableData('main_business_cost', tableGroups.main_business_cost_structure, months,
                (period, item) => [period, item.category, item.customer, 0, 0, 0]
            );
        }
        
        // 11. 部门成本中心计入损益情况 (department_cost_center)
        if (tableGroups.department_cost_center_profit_loss) {
            console.log('🏢 处理部门成本中心数据...');
            await initTableData('department_cost_center', tableGroups.department_cost_center_profit_loss, months,
                (period, item) => [period, item.customer, 0, 0, 0, 0]
            );
        }
        
        // 12. 成本暂估入库和计提情况 (cost_estimation)
        if (tableGroups.cost_estimate_personnel_withdrawals) {
            console.log('📊 处理成本暂估数据...');
            await initTableData('cost_estimation', tableGroups.cost_estimate_personnel_withdrawals, months,
                (period, item) => [period, item.category, item.customer, 0, 0, 0, 0]
            );
        }
        
        // 处理JSON存储的表格
        console.log('📄 处理JSON格式表格...');
        await initJsonTables(tableGroups, months);
        
        console.log('🎉 2025年全年业务数据初始化完成！');
        console.log('📝 已为以下月份创建数据:', months.join(', '));
        
    } catch (error) {
        console.error('❌ 初始化失败:', error);
    } finally {
        process.exit(0);
    }
}

/**
 * 初始化普通表格数据
 */
async function initTableData(tableName, items, months, dataMapper) {
    try {
        for (const month of months) {
            // 清除现有数据
            await pool.execute(`DELETE FROM ${tableName} WHERE period = ?`, [month]);
            
            const insertData = [];
            items.forEach(item => {
                insertData.push(dataMapper(month, item));
            });
            
            if (insertData.length > 0) {
                const placeholders = insertData.map(() => `(${insertData[0].map(() => '?').join(', ')})`).join(', ');
                
                let insertQuery;
                switch(tableName) {
                    case 'new_orders':
                    case 'project_tracking':
                    case 'main_business_income':
                    case 'order_to_income':
                    case 'stock_order_to_income':
                        insertQuery = `INSERT INTO ${tableName} (period, category, customer, yearly_plan, current_total, progress) VALUES ${placeholders}`;
                        break;
                    case 'inventory_structure':
                    case 'bid_fulfillment':
                    case 'inventory_in_progress':
                    case 'contract_inventory':
                        insertQuery = `INSERT INTO ${tableName} (period, category, customer_type, initial_amount, current_amount) VALUES ${placeholders}`;
                        break;
                    case 'main_business_cost':
                        insertQuery = `INSERT INTO ${tableName} (period, category, customer, yearly_plan, current_cost, cost_rate) VALUES ${placeholders}`;
                        break;
                    case 'department_cost_center':
                        insertQuery = `INSERT INTO ${tableName} (period, department, yearly_budget, current_cost, profit_loss, cost_rate) VALUES ${placeholders}`;
                        break;
                    case 'cost_estimation':
                        insertQuery = `INSERT INTO ${tableName} (period, category, customer_type, initial_balance, current_provision, reversal_amount, final_balance) VALUES ${placeholders}`;
                        break;
                    default:
                        console.log(`⚠️ 未知表格类型: ${tableName}`);
                        continue;
                }
                
                await pool.execute(insertQuery, insertData.flat());
                console.log(`  ✅ ${tableName} (${month}): 插入 ${insertData.length} 条记录`);
            }
        }
    } catch (error) {
        console.error(`❌ 初始化表格 ${tableName} 失败:`, error);
    }
}

/**
 * 初始化JSON格式的表格
 */
async function initJsonTables(tableGroups, months) {
    try {
        // 营业收入结构与质量
        if (tableGroups.business_income_structure) {
            await initBusinessIncomeStructure(tableGroups.business_income_structure, months);
        }
        
        // 非主营业务情况
        if (tableGroups.non_main_business) {
            await initNonMainBusiness(tableGroups.non_main_business, months);
        }
        
        // 主营业务边际贡献率结构
        if (tableGroups.main_business_contribution_rate_structure) {
            await initBusinessContribution(tableGroups.main_business_contribution_rate_structure, months);
        }
        
        // 主营业务毛利率结构
        if (tableGroups.main_business_gross_profit_rate_structure) {
            await initBusinessProfitMargin(tableGroups.main_business_gross_profit_rate_structure, months);
        }
        
        // 净利润结构与质量
        if (tableGroups.net_profit_structure_quality) {
            await initNetProfitStructure(tableGroups.net_profit_structure_quality, months);
        }
        
        // 主营业务净利润贡献情况
        if (tableGroups.main_business_net_profit_contribution) {
            await initMainBusinessNetProfit(tableGroups.main_business_net_profit_contribution, months);
        }
        
        // 非主营业务净利润贡献情况
        if (tableGroups.non_main_business_net_profit_contribution) {
            await initNonMainBusinessNetProfit(tableGroups.non_main_business_net_profit_contribution, months);
        }
        
        // 应收账款相关表格
        await initReceivablesRelatedTables(tableGroups, months);
        
    } catch (error) {
        console.error('❌ 初始化JSON表格失败:', error);
    }
}

/**
 * 初始化营业收入结构数据
 */
async function initBusinessIncomeStructure(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM business_income_structure WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            category: item.customer,
            yearlyPlan: 0,
            currentTotal: 0,
            progress: 0
        }));
        
        const insertQuery = 'INSERT INTO business_income_structure (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 营业收入结构 (${month}): 插入成功`);
    }
}

/**
 * 初始化非主营业务数据
 */
async function initNonMainBusiness(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM non_main_business WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            category: item.customer,
            yearlyPlan: 0,
            currentTotal: 0,
            progress: 0
        }));
        
        const insertQuery = 'INSERT INTO non_main_business (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 非主营业务 (${month}): 插入成功`);
    }
}

/**
 * 初始化主营业务边际贡献率结构数据
 */
async function initBusinessContribution(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM business_contribution WHERE period = ?', [month]);
        
        const data = {};
        items.forEach(item => {
            const categoryKey = item.category === '设备' ? 'equipment' : 
                               item.category === '元件' ? 'components' : 'engineering';
            if (!data[categoryKey]) data[categoryKey] = {};
            
            const customerKey = getCustomerKey(item.customer);
            data[categoryKey][customerKey] = {
                plan: "0.00%",
                actual: 0,
                variance: 0
            };
        });
        
        const insertQuery = 'INSERT INTO business_contribution (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 主营业务边际贡献率 (${month}): 插入成功`);
    }
}

/**
 * 初始化主营业务毛利率结构数据
 */
async function initBusinessProfitMargin(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM business_profit_margin WHERE period = ?', [month]);
        
        const data = {};
        items.forEach(item => {
            const categoryKey = item.category === '设备' ? 'equipment' : 
                               item.category === '元件' ? 'components' : 'engineering';
            if (!data[categoryKey]) data[categoryKey] = {};
            
            const customerKey = getCustomerKey(item.customer);
            data[categoryKey][customerKey] = {
                rate: "0.00%",
                income: 0,
                cost: 0
            };
        });
        
        const insertQuery = 'INSERT INTO business_profit_margin (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 主营业务毛利率 (${month}): 插入成功`);
    }
}

/**
 * 初始化净利润结构数据
 */
async function initNetProfitStructure(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM net_profit_structure WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            category: item.customer,
            yearInitialBalance: 0,
            currentTotal: 0,
            progress: 0
        }));
        
        const insertQuery = 'INSERT INTO net_profit_structure (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 净利润结构 (${month}): 插入成功`);
    }
}

/**
 * 初始化主营业务净利润贡献数据
 */
async function initMainBusinessNetProfit(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM main_business_net_profit WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            segment: item.category,
            customerType: item.customer,
            yearInitialBalance: 0,
            currentTotal: 0,
            progress: 0
        }));
        
        const insertQuery = 'INSERT INTO main_business_net_profit (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 主营业务净利润贡献 (${month}): 插入成功`);
    }
}

/**
 * 初始化非主营业务净利润贡献数据
 */
async function initNonMainBusinessNetProfit(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM non_main_business_net_profit WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            name: item.customer,
            plan: 0,
            actual: 0,
            progress: 0
        }));
        
        const insertQuery = 'INSERT INTO non_main_business_net_profit (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 非主营业务净利润贡献 (${month}): 插入成功`);
    }
}

/**
 * 初始化应收账款相关表格
 */
async function initReceivablesRelatedTables(tableGroups, months) {
    // 收款结构与质量
    if (tableGroups.payment_structure_quality) {
        await initReceiptStructure(tableGroups.payment_structure_quality, months);
    }
    
    // 应收账款情况
    if (tableGroups.accounts_receivable_situation) {
        await initAccountsReceivable(tableGroups.accounts_receivable_situation, months);
    }
    
    // 逾期应收账款情况  
    if (tableGroups.overdue_accounts_receivable_situation) {
        await initOverdueReceivables(tableGroups.overdue_accounts_receivable_situation, months);
    }
    
    // 坏账准备情况
    if (tableGroups.bad_debt_provision_situation) {
        await initBadDebtProvision(tableGroups.bad_debt_provision_situation, months);
    }
}

/**
 * 初始化收款结构质量数据
 */
async function initReceiptStructure(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM receipt_structure WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            segment: item.category,
            customerType: item.customer,
            plan: 0,
            actual: 0,
            progress: 0
        }));
        
        const insertQuery = 'INSERT INTO receipt_structure (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 收款结构质量 (${month}): 插入成功`);
    }
}

/**
 * 初始化应收账款数据
 */
async function initAccountsReceivable(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM accounts_receivable WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            segment: item.category,
            customerType: item.customer,
            newInvoice: "0",
            totalReceipt: "0",
            currentBalance: "0",
            initialBalance: "0"
        }));
        
        const insertQuery = 'INSERT INTO accounts_receivable (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 应收账款 (${month}): 插入成功`);
    }
}

/**
 * 初始化逾期应收账款数据
 */
async function initOverdueReceivables(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM overdue_receivables WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            segment: item.category,
            customerType: item.customer,
            newAddition: 0,
            totalReceipt: 0,
            currentBalance: 0,
            initialBalance: 0
        }));
        
        const insertQuery = 'INSERT INTO overdue_receivables (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 逾期应收账款 (${month}): 插入成功`);
    }
}

/**
 * 初始化坏账准备数据
 */
async function initBadDebtProvision(items, months) {
    for (const month of months) {
        await pool.execute('DELETE FROM bad_debt_provision WHERE period = ?', [month]);
        
        const data = items.map(item => ({
            segment: item.category,
            customerType: item.customer,
            newAddition: 0,
            finalBalance: 0,
            initialBalance: 0,
            currentReversal: 0
        }));
        
        const insertQuery = 'INSERT INTO bad_debt_provision (period, data) VALUES (?, ?)';
        await pool.execute(insertQuery, [month, JSON.stringify(data)]);
        console.log(`  ✅ 坏账准备 (${month}): 插入成功`);
    }
}

/**
 * 将客户名称转换为系统键值
 */
function getCustomerKey(customerName) {
    const keyMap = {
        '上海项目': 'shanghai',
        '国网项目': 'national', 
        '江苏项目': 'jiangsu',
        '输配电内配': 'power',
        '西门子项目': 'siemens',
        '同业项目': 'peers',
        '用户项目': 'users',
        '其它项目': 'others',
        '一包项目': 'package1',
        '二包项目': 'package2',
        '域内合作项目': 'domestic',
        '域外合作项目': 'international'
    };
    
    return keyMap[customerName] || customerName.toLowerCase();
}

init2025FullYearData();