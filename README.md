# 财务分析后端 API

本项目为财务分析平台的后端服务，提供资产负债表、现金流量表、利润表以及营业收入结构与质量、主营业务收入分解情况、主营业务当年订单转收入、主营业务存量订单转收入、非主营业务情况、成本中心结构与质量、主营业务边际贡献率、主营业务毛利率、净利润结构、主营业务净利润贡献情况、非主营业务净利润贡献情况、收款结构与质量、应收账款情况、逾期应收账款情况、坏账准备情况、新签订单结构与质量、项目跟踪、招投标情况、中标未履约情况、存量结构与质量、在产情况、库存情况（合同存量）、主营业务成本结构与质量、成本暂估入库和计提情况、生产/施工计划执行情况等财务报表的数据管理接口。

## 项目结构

```
financial-backend/
├── app.js                 # 主应用入口
├── package.json           # 项目依赖配置
├── .env                   # 环境变量配置
├── config/
│   └── database.js        # 数据库连接配置
└── routes/
    ├── balanceSheet.js            # 资产负债表路由
    ├── cashFlow.js                # 现金流量表路由
    ├── incomeStatement.js         # 利润表路由
    ├── businessIncome.js          # 营业收入结构与质量路由
    ├── mainBusinessIncome.js      # 主营业务收入分解情况路由
    ├── orderToIncome.js           # 主营业务当年订单转收入路由
    ├── stockOrderToIncome.js      # 主营业务存量订单转收入路由
    ├── nonMainBusiness.js         # 非主营业务情况路由
    ├── costCenterStructure.js     # 成本中心结构与质量路由
    ├── businessContribution.js       # 主营业务边际贡献率路由
    ├── businessProfitMargin.js       # 主营业务毛利率路由
    ├── netProfitStructure.js         # 净利润结构路由
    ├── mainBusinessNetProfit.js      # 主营业务净利润贡献情况路由
    ├── nonMainBusinessNetProfit.js   # 非主营业务净利润贡献情况路由
    ├── receiptStructure.js           # 收款结构与质量路由
    ├── accountsReceivable.js         # 应收账款情况路由
    ├── overdueReceivables.js         # 逾期应收账款情况路由
    ├── badDebtProvision.js           # 坏账准备情况路由
    ├── newOrders.js                  # 新签订单结构与质量路由
    ├── projectTracking.js            # 项目跟踪路由
    ├── biddingStatus.js              # 招投标情况路由
    ├── bidFulfillment.js             # 中标未履约情况路由
    ├── inventoryStructure.js         # 存量结构与质量路由
    ├── inventoryInProgress.js        # 在产情况路由
    ├── contractInventory.js          # 库存情况（合同存量）路由
    ├── mainBusinessCost.js           # 主营业务成本结构与质量路由
    ├── costEstimation.js             # 成本暂估入库和计提情况路由
    └── productionPlanExecution.js    # 生产/施工计划执行情况路由
```

## 环境要求

- Node.js >= 14.0.0
- MySQL >= 8.0
- npm 或 yarn

## 安装运行

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
复制 `.env` 文件并修改数据库配置：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=finance
PORT=3000
```

3. 确保数据库已创建
使用提供的 `finance.sql` 文件创建数据库表结构，并运行 `sql/create_new_tables.sql`、`sql/create_additional_tables.sql`、`sql/create_second_batch_tables.sql`、`sql/create_marketing_tables.sql`、`sql/create_additional_batch_tables.sql`、`sql/create_fifth_batch_tables.sql` 和 `sql/create_production_plan_execution_table.sql` 创建新增的财务报表数据表。

4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 接口

### 通用响应格式

成功响应：
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

错误响应：
```json
{
  "error": "错误信息"
}
```

### 资产负债表 API

#### 获取资产负债表
- **GET** `/balance-sheet/:period`
- **参数**: period (格式: YYYY-MM)
- **示例**: `/balance-sheet/2025-06`

#### 保存资产负债表
- **POST** `/balance-sheet`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "assets": {...},
    "liabilities": {...},
    "equity": {...}
  }
}
```

#### 获取所有资产负债表
- **GET** `/balance-sheet`

#### 删除资产负债表
- **DELETE** `/balance-sheet/:period`

### 现金流量表 API

#### 获取现金流量表
- **GET** `/cash-flow/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存现金流量表
- **POST** `/cash-flow`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "sales_cash": {
      "current_amount": 1000,
      "year_amount": 5000
    },
    ...
  }
}
```

#### 获取所有现金流量表
- **GET** `/cash-flow`

#### 删除现金流量表
- **DELETE** `/cash-flow/:period`

### 利润表 API

#### 获取利润表
- **GET** `/income-statement/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存利润表
- **POST** `/income-statement`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "total_revenue": {
      "current_amount": 1000,
      "year_amount": 5000
    },
    ...
  }
}
```

#### 获取所有利润表
- **GET** `/income-statement`

#### 删除利润表
- **DELETE** `/income-statement/:period`

### 营业收入结构与质量 API

#### 获取营业收入结构与质量数据
- **GET** `/business-income/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存营业收入结构与质量数据
- **POST** `/business-income`
- **Body**:
```json
{
  "period": "2025-06",
  "data": [
    {
      "id": 1,
      "category": "主营业务",
      "yearlyPlan": 59400.00,
      "currentTotal": 5147.93,
      "progress": 8.67
    },
    ...
  ]
}
```

#### 获取所有营业收入结构与质量数据
- **GET** `/business-income`

#### 删除营业收入结构与质量数据
- **DELETE** `/business-income/:period`

### 主营业务收入分解情况 API

#### 获取主营业务收入分解情况数据
- **GET** `/main-business-income/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务收入分解情况数据
- **POST** `/main-business-income`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": "缺少数据",
        "currentTotal": 2363.98,
        "progress": "/"
      },
      ...
    ],
    "components": [...],
    "engineering": [...]
  }
}
```

#### 获取所有主营业务收入分解情况数据
- **GET** `/main-business-income`

#### 删除主营业务收入分解情况数据
- **DELETE** `/main-business-income/:period`

### 主营业务当年订单转收入 API

#### 获取主营业务当年订单转收入数据
- **GET** `/order-to-income/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务当年订单转收入数据
- **POST** `/order-to-income`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "signedOrder": 5593.15,
        "incomeTotal": 0.00,
        "incomeRate": 0.00
      },
      ...
    ],
    "components": [...],
    "engineering": [...]
  }
}
```

#### 获取所有主营业务当年订单转收入数据
- **GET** `/order-to-income`

#### 删除主营业务当年订单转收入数据
- **DELETE** `/order-to-income/:period`

### 主营业务存量订单转收入 API

#### 获取主营业务存量订单转收入数据
- **GET** `/stock-order-to-income/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务存量订单转收入数据
- **POST** `/stock-order-to-income`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "stockOrder": 39050.53,
        "incomeTotal": 2363.98,
        "incomeRate": 6.05
      },
      ...
    ],
    "components": [...],
    "engineering": [...]
  }
}
```

#### 获取所有主营业务存量订单转收入数据
- **GET** `/stock-order-to-income`

#### 删除主营业务存量订单转收入数据
- **DELETE** `/stock-order-to-income/:period`

### 非主营业务情况 API

#### 获取非主营业务情况数据
- **GET** `/non-main-business/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存非主营业务情况数据
- **POST** `/non-main-business`
- **Body**:
```json
{
  "period": "2025-06",
  "data": [
    {
      "id": 1,
      "category": "固定收入",
      "yearlyPlan": 100.00,
      "currentTotal": 49.61
    },
    ...
  ]
}
```

#### 获取所有非主营业务情况数据
- **GET** `/non-main-business`

#### 删除非主营业务情况数据
- **DELETE** `/non-main-business/:period`

### 成本中心结构与质量 API

#### 获取成本中心结构与质量数据
- **GET** `/cost-center-structure/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存成本中心结构与质量数据
- **POST** `/cost-center-structure`
- **Body**:
```json
{
  "period": "2025-06",
  "data": [
    {
      "name": "总经理室",
      "yibao": 116.80,
      "erbao": 37.53,
      "xinnengyuan": 34.00,
      "qiangxiu": 9.38,
      "yunjian": 37.53,
      "jianli": null,
      "yunei": 6.80,
      "yuwai": null,
      "yuwaisuzhou": 13.60,
      "shebeiwaifu": null,
      "total": 255.63
    },
    ...
  ]
}
```

#### 获取所有成本中心结构与质量数据
- **GET** `/cost-center-structure`

#### 删除成本中心结构与质量数据
- **DELETE** `/cost-center-structure/:period`

### 主营业务边际贡献率 API

#### 获取主营业务边际贡献率数据
- **GET** `/business-contribution/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务边际贡献率数据
- **POST** `/business-contribution`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": {
      "shanghai": {"plan": "28.22%", "actual": "38.02%", "difference": "9.80%"},
      "national": {"plan": "20.19%", "actual": "20.05%", "difference": "-0.14%"},
      ...
    },
    "automation": {...},
    "components": {...},
    "engineering": {...},
    "total": {...}
  }
}
```

#### 获取所有主营业务边际贡献率数据
- **GET** `/business-contribution`

#### 删除主营业务边际贡献率数据
- **DELETE** `/business-contribution/:period`

### 主营业务毛利率 API

#### 获取主营业务毛利率数据
- **GET** `/business-profit-margin/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务毛利率数据
- **POST** `/business-profit-margin`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": {
      "shanghai": {"plan": "21.99%", "actual": "31.06%", "difference": "9.07%"},
      "national": {"plan": "13.83%", "actual": "15.72%", "difference": "1.89%"},
      ...
    },
    "components": {...},
    "engineering": {...},
    "total": {...}
  }
}
```

#### 获取所有主营业务毛利率数据
- **GET** `/business-profit-margin`

#### 删除主营业务毛利率数据
- **DELETE** `/business-profit-margin/:period`

### 净利润结构 API

#### 获取净利润结构数据
- **GET** `/net-profit-structure/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存净利润结构数据
- **POST** `/net-profit-structure`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "mainBusiness": {"plan": "3,871.58", "actual": "240.20", "progress": "6.20%"},
    "nonMainBusiness": {"plan": "128.42", "actual": "77.09", "progress": "60.03%"},
    "total": {"plan": "4,000.00", "actual": "317.28", "progress": "7.93%"}
  }
}
```

#### 获取所有净利润结构数据
- **GET** `/net-profit-structure`

#### 删除净利润结构数据
- **DELETE** `/net-profit-structure/:period`

### 主营业务净利润贡献情况 API

#### 获取主营业务净利润贡献情况数据
- **GET** `/main-business-net-profit/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务净利润贡献情况数据
- **POST** `/main-business-net-profit`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "plan": "2,145.03",
        "actual": "176.38",
        "contribution": "8.22%"
      },
      ...
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 获取所有主营业务净利润贡献情况数据
- **GET** `/main-business-net-profit`

#### 删除主营业务净利润贡献情况数据
- **DELETE** `/main-business-net-profit/:period`

### 非主营业务净利润贡献情况 API

#### 获取非主营业务净利润贡献情况数据
- **GET** `/non-main-business-net-profit/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存非主营业务净利润贡献情况数据
- **POST** `/non-main-business-net-profit`
- **Body**:
```json
{
  "period": "2025-06",
  "data": [
    {
      "id": 1,
      "name": "固废收入",
      "plan": "12.83",
      "actual": "49.61",
      "progress": "386.67%"
    },
    ...
  ]
}
```

#### 获取所有非主营业务净利润贡献情况数据
- **GET** `/non-main-business-net-profit`

#### 删除非主营业务净利润贡献情况数据
- **DELETE** `/non-main-business-net-profit/:period`

### 收款结构与质量 API

#### 获取收款结构与质量数据
- **GET** `/receipt-structure/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存收款结构与质量数据
- **POST** `/receipt-structure`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "plan": "25,000.00",
        "actual": "2,863.84",
        "progress": "11.46%"
      },
      ...
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 获取所有收款结构与质量数据
- **GET** `/receipt-structure`

#### 删除收款结构与质量数据
- **DELETE** `/receipt-structure/:period`

### 应收账款情况 API

#### 获取应收账款情况数据
- **GET** `/accounts-receivable/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存应收账款情况数据
- **POST** `/accounts-receivable`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialBalance": "3,558.98",
        "newInvoice": "1,612.61",
        "totalReceipt": "2,863.84",
        "currentBalance": "2,307.75"
      },
      ...
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 获取所有应收账款情况数据
- **GET** `/accounts-receivable`

#### 删除应收账款情况数据
- **DELETE** `/accounts-receivable/:period`

### 逾期应收账款情况 API

#### 获取逾期应收账款情况数据
- **GET** `/overdue-receivables/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存逾期应收账款情况数据
- **POST** `/overdue-receivables`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialBalance": "1,349.60",
        "newAddition": "0.00",
        "totalReceipt": "0.00",
        "progress": "0.00%"
      },
      ...
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 获取所有逾期应收账款情况数据
- **GET** `/overdue-receivables`

#### 删除逾期应收账款情况数据
- **DELETE** `/overdue-receivables/:period`

### 坏账准备情况 API

#### 获取坏账准备情况数据
- **GET** `/bad-debt-provision/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存坏账准备情况数据
- **POST** `/bad-debt-provision`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialBalance": 67.48,
        "newAddition": 0.00,
        "currentReversal": 0.00,
        "finalBalance": 67.48
      },
      ...
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 获取所有坏账准备情况数据
- **GET** `/bad-debt-provision`

#### 删除坏账准备情况数据
- **DELETE** `/bad-debt-provision/:period`

### 新签订单结构与质量 API

#### 获取新签订单数据
- **GET** `/new-orders/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存新签订单数据
- **POST** `/new-orders`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customer": "上海项目",
        "yearlyPlan": 30000.00,
        "currentTotal": 5593.15,
        "progress": 18.64
      }
    ],
    "components": [...],
    "engineering": [...]
  }
}
```

#### 更新新签订单数据
- **PUT** `/new-orders/:period`

#### 删除新签订单数据
- **DELETE** `/new-orders/:period`

### 项目跟踪 API

#### 获取项目跟踪数据
- **GET** `/project-tracking/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存项目跟踪数据
- **POST** `/project-tracking`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": 500000.00,
        "currentTotal": 869.12,
        "progress": 0.17
      }
    ],
    "components": [...],
    "engineering": [...]
  }
}
```

#### 更新项目跟踪数据
- **PUT** `/project-tracking/:period`

#### 删除项目跟踪数据
- **DELETE** `/project-tracking/:period`

### 招投标情况 API

#### 获取招投标情况数据
- **GET** `/bidding-status/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存招投标情况数据
- **POST** `/bidding-status`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "bidAmount": 869.12,
        "winAmount": 0.00,
        "winRate": 0.00
      }
    ],
    "components": [...],
    "engineering": [...]
  }
}
```

#### 更新招投标情况数据
- **PUT** `/bidding-status/:period`

#### 删除招投标情况数据
- **DELETE** `/bidding-status/:period`

### 中标未履约情况 API

#### 获取中标未履约情况数据
- **GET** `/bid-fulfillment/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存中标未履约情况数据
- **POST** `/bid-fulfillment`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 31055.26,
        "currentAmount": 24050.77
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新中标未履约情况数据
- **PUT** `/bid-fulfillment/:period`

#### 删除中标未履约情况数据
- **DELETE** `/bid-fulfillment/:period`

### 存量结构与质量 API

#### 获取存量结构与质量数据
- **GET** `/inventory-structure/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存存量结构与质量数据
- **POST** `/inventory-structure`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 39151.53,
        "currentAmount": 34606.27
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新存量结构与质量数据
- **PUT** `/inventory-structure/:period`

#### 删除存量结构与质量数据
- **DELETE** `/inventory-structure/:period`

### 在产情况 API

#### 获取在产情况数据
- **GET** `/inventory-in-progress/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存在产情况数据
- **POST** `/inventory-in-progress`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 4726.55,
        "currentAmount": 8909.94
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新在产情况数据
- **PUT** `/inventory-in-progress/:period`

#### 删除在产情况数据
- **DELETE** `/inventory-in-progress/:period`

### 库存情况（合同存量） API

#### 获取库存情况（合同存量）数据
- **GET** `/contract-inventory/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存库存情况（合同存量）数据
- **POST** `/contract-inventory`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 1924.96,
        "currentAmount": 1645.56
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新库存情况（合同存量）数据
- **PUT** `/contract-inventory/:period`

#### 删除库存情况（合同存量）数据
- **DELETE** `/contract-inventory/:period`

### 主营业务成本结构与质量 API

#### 获取主营业务成本结构与质量数据
- **GET** `/main-business-cost/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存主营业务成本结构与质量数据
- **POST** `/main-business-cost`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "yearlyPlan": "17,398.82",
        "currentTotal": 1647.50,
        "revenueRatio": "69.69%"
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新主营业务成本结构与质量数据
- **PUT** `/main-business-cost/:period`

#### 删除主营业务成本结构与质量数据
- **DELETE** `/main-business-cost/:period`

### 成本暂估入库和计提情况 API

#### 获取成本暂估入库和计提情况数据
- **GET** `/cost-estimation/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存成本暂估入库和计提情况数据
- **POST** `/cost-estimation`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialBalance": "1,500.00",
        "newAddition": "500.00",
        "yearTotal": "2,000.00",
        "provisionRate": "15.5%"
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新成本暂估入库和计提情况数据
- **PUT** `/cost-estimation/:period`

#### 删除成本暂估入库和计提情况数据
- **DELETE** `/cost-estimation/:period`

### 生产/施工计划执行情况 API

#### 获取生产/施工计划执行情况数据
- **GET** `/production-plan-execution/:period`
- **参数**: period (格式: YYYY-MM)

#### 保存生产/施工计划执行情况数据
- **POST** `/production-plan-execution`
- **Body**:
```json
{
  "period": "2025-06",
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "yearlyTarget": "100%",
        "onTimeRate": "99%",
        "qualifiedRate": "99.99%",
        "achievementRate": "80%"
      }
    ],
    "component": [...],
    "project": [...]
  }
}
```

#### 更新生产/施工计划执行情况数据
- **PUT** `/production-plan-execution/:period`

#### 删除生产/施工计划执行情况数据
- **DELETE** `/production-plan-execution/:period`

## 健康检查

- **GET** `/health` - 检查服务运行状态

## 数据库表结构

### balance_sheet (资产负债表)
- `id`: 主键
- `period`: 期间 (DATE)
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### cash_flow (现金流量表)
- `id`: 主键  
- `period`: 期间 (DATE)
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### income_statement (利润表)
- `id`: 主键
- `period`: 期间 (DATE)  
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### business_income_structure (营业收入结构与质量表)
- `id`: 主键
- `period`: 期间 (DATE)
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### main_business_income (主营业务收入分解情况表)
- `id`: 主键
- `period`: 期间 (DATE)
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### order_to_income (主营业务当年订单转收入表)
- `id`: 主键
- `period`: 期间 (DATE)
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### stock_order_to_income (主营业务存量订单转收入表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### non_main_business (非主营业务情况表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### cost_center_structure (成本中心结构与质量表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### business_contribution (主营业务边际贡献率表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### business_profit_margin (主营业务毛利率表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### net_profit_structure (净利润结构表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### main_business_net_profit (主营业务净利润贡献情况表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### non_main_business_net_profit (非主营业务净利润贡献情况表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### receipt_structure (收款结构与质量表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### accounts_receivable (应收账款情况表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### overdue_receivables (逾期应收账款情况表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

### bad_debt_provision (坏账准备情况表)
- `id`: 主键
- `period`: 期间 (VARCHAR(7))
- `data`: JSON数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 注意事项

1. 所有期间参数使用 YYYY-MM 格式
2. 数据以JSON格式存储在数据库中
3. 使用 ON DUPLICATE KEY UPDATE 支持数据的插入和更新
4. 包含完整的错误处理和参数验证