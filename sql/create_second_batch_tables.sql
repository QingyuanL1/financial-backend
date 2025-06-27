-- 第二批六个财务报表的数据库表结构

-- 1. 主营业务净利润贡献情况
CREATE TABLE main_business_net_profit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 非主营业务净利润贡献情况
CREATE TABLE non_main_business_net_profit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 收款结构与质量
CREATE TABLE receipt_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 应收账款情况
CREATE TABLE accounts_receivable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 逾期应收账款情况
CREATE TABLE overdue_receivables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 坏账准备情况
CREATE TABLE bad_debt_provision (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入示例数据

-- 主营业务净利润贡献情况示例数据
INSERT INTO main_business_net_profit (period, data) VALUES 
('2024-01', '{
  "equipment": [
    {"customerType": "上海", "plan": "2,145.03", "actual": "176.38", "contribution": "8.22%"},
    {"customerType": "国网", "plan": "621.55", "actual": "34.43", "contribution": "5.54%"},
    {"customerType": "江苏", "plan": "0.00", "actual": "0.00", "contribution": "0.00%"},
    {"customerType": "输配电内配", "plan": "0.00", "actual": "0.00", "contribution": "0.00%"},
    {"customerType": "西门子", "plan": "0.00", "actual": "0.00", "contribution": "0.00%"},
    {"customerType": "同业", "plan": "553.08", "actual": "15.66", "contribution": "2.83%"},
    {"customerType": "用户", "plan": "323.80", "actual": "1.14", "contribution": "0.35%"},
    {"customerType": "其它", "plan": "0.00", "actual": "0.00", "contribution": "0.00%"}
  ],
  "component": [
    {"customerType": "用户", "plan": "-26.21", "actual": "-1.54", "contribution": "5.88%"}
  ],
  "project": [
    {"customerType": "一包", "plan": "328.91", "actual": "-0.13", "contribution": "0.00%"},
    {"customerType": "二包", "plan": "14.40", "actual": "-5.79", "contribution": "-40.21%"},
    {"customerType": "域内合作", "plan": "-35.24", "actual": "0.00", "contribution": "0.00%"},
    {"customerType": "域外合作", "plan": "0.00", "actual": "34.58", "contribution": "0.00%"},
    {"customerType": "其它", "plan": "69.60", "actual": "3.17", "contribution": "4.55%"}
  ]
}');

-- 非主营业务净利润贡献情况示例数据
INSERT INTO non_main_business_net_profit (period, data) VALUES 
('2024-01', '[
  {"id": 1, "name": "固废收入", "plan": "12.83", "actual": "49.61", "progress": "386.67%"},
  {"id": 2, "name": "房屋租金", "plan": "25.58", "actual": "0.69", "progress": "2.69%"},
  {"id": 3, "name": "利息收入", "plan": "25.58", "actual": "16.72", "progress": "65.36%"},
  {"id": 4, "name": "投资收益", "plan": "33.25", "actual": "0.00", "progress": "0.00%"},
  {"id": 5, "name": "补贴收入", "plan": "33.25", "actual": "0.00", "progress": "0.00%"},
  {"id": 6, "name": "其他", "plan": "10.23", "actual": "56.26", "progress": "549.86%"}
]');

-- 收款结构与质量示例数据
INSERT INTO receipt_structure (period, data) VALUES 
('2024-01', '{
  "equipment": [
    {"customerType": "上海", "plan": "25,000.00", "actual": "2,863.84", "progress": "11.46%"},
    {"customerType": "国网", "plan": "5,000.00", "actual": "2,295.48", "progress": "45.91%"},
    {"customerType": "江苏", "plan": "3,500.00", "actual": "480.58", "progress": "13.73%"},
    {"customerType": "输配电内配", "plan": "3,000.00", "actual": "0.00", "progress": "0.00%"},
    {"customerType": "西门子", "plan": "3,500.00", "actual": "13.78", "progress": "0.39%"},
    {"customerType": "同业", "plan": "3,500.00", "actual": "1,097.42", "progress": "31.35%"},
    {"customerType": "用户", "plan": "3,500.00", "actual": "232.01", "progress": "6.63%"},
    {"customerType": "其它", "plan": "0.00", "actual": "225.71", "progress": "0.00%"}
  ],
  "component": [
    {"customerType": "用户", "plan": "3,000.00", "actual": "59.16", "progress": "1.97%"}
  ],
  "project": [
    {"customerType": "一包", "plan": "2,800.00", "actual": "235.07", "progress": "8.40%"},
    {"customerType": "二包", "plan": "1,700.00", "actual": "41.13", "progress": "2.42%"},
    {"customerType": "域内合作", "plan": "4,000.00", "actual": "2,359.08", "progress": "58.98%"},
    {"customerType": "域外合作", "plan": "1,000.00", "actual": "746.42", "progress": "74.64%"},
    {"customerType": "其它", "plan": "1,500.00", "actual": "805.36", "progress": "53.69%"}
  ]
}');

-- 应收账款情况示例数据
INSERT INTO accounts_receivable (period, data) VALUES 
('2024-01', '{
  "equipment": [
    {"customerType": "上海", "initialBalance": "3,558.98", "newInvoice": "1,612.61", "totalReceipt": "2,863.84", "currentBalance": "2,307.75"},
    {"customerType": "国网", "initialBalance": "5,190.93", "newInvoice": "626.89", "totalReceipt": "2,295.48", "currentBalance": "3,522.34"},
    {"customerType": "江苏", "initialBalance": "1,154.56", "newInvoice": "1,218.18", "totalReceipt": "480.58", "currentBalance": "1,892.16"},
    {"customerType": "输配电内配", "initialBalance": "176.86", "newInvoice": "0.00", "totalReceipt": "0.00", "currentBalance": "176.86"},
    {"customerType": "西门子", "initialBalance": "0.00", "newInvoice": "0.00", "totalReceipt": "0.00", "currentBalance": "0.00"},
    {"customerType": "同业", "initialBalance": "2,028.53", "newInvoice": "686.47", "totalReceipt": "1,054.62", "currentBalance": "1,660.38"},
    {"customerType": "用户", "initialBalance": "1,727.31", "newInvoice": "227.18", "totalReceipt": "183.61", "currentBalance": "1,770.88"},
    {"customerType": "其它", "initialBalance": "303.55", "newInvoice": "54.24", "totalReceipt": "225.71", "currentBalance": "132.08"}
  ],
  "component": [
    {"customerType": "用户", "initialBalance": "458.54", "newInvoice": "21.02", "totalReceipt": "59.16", "currentBalance": "420.40"}
  ],
  "project": [
    {"customerType": "一包", "initialBalance": "1,257.33", "newInvoice": "0.00", "totalReceipt": "235.07", "currentBalance": "1,022.26"},
    {"customerType": "二包", "initialBalance": "279.19", "newInvoice": "107.23", "totalReceipt": "41.13", "currentBalance": "345.29"},
    {"customerType": "域内合作", "initialBalance": "3,089.47", "newInvoice": "537.89", "totalReceipt": "2,359.08", "currentBalance": "1,268.28"},
    {"customerType": "域外合作", "initialBalance": "1,432.15", "newInvoice": "746.42", "totalReceipt": "746.42", "currentBalance": "1,432.15"},
    {"customerType": "其它", "initialBalance": "856.47", "newInvoice": "145.39", "totalReceipt": "805.36", "currentBalance": "196.50"}
  ]
}');

-- 逾期应收账款情况示例数据
INSERT INTO overdue_receivables (period, data) VALUES 
('2024-01', '{
  "equipment": [
    {"customerType": "上海", "initialBalance": "1,349.60", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "国网", "initialBalance": "462.01", "newAddition": "0.00", "totalReceipt": "0.11", "progress": "0.00%"},
    {"customerType": "江苏", "initialBalance": "1,123.94", "newAddition": "10.82", "totalReceipt": "316.76", "progress": "28.18%"},
    {"customerType": "输配电内配", "initialBalance": "176.86", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "西门子", "initialBalance": "0.00", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "同业", "initialBalance": "46.23", "newAddition": "91.82", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "用户", "initialBalance": "1,705.24", "newAddition": "50.00", "totalReceipt": "0.07", "progress": "0.00%"},
    {"customerType": "其它", "initialBalance": "391.31", "newAddition": "34.01", "totalReceipt": "0.00", "progress": "0.00%"}
  ],
  "component": [
    {"customerType": "用户", "initialBalance": "380.94", "newAddition": "1.03", "totalReceipt": "27.07", "progress": "7.11%"}
  ],
  "project": [
    {"customerType": "一包", "initialBalance": "1,239.83", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "二包", "initialBalance": "254.06", "newAddition": "107.23", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "域内合作", "initialBalance": "0.00", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "域外合作", "initialBalance": "1,432.15", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"},
    {"customerType": "其它", "initialBalance": "856.47", "newAddition": "0.00", "totalReceipt": "0.00", "progress": "0.00%"}
  ]
}');

-- 坏账准备情况示例数据
INSERT INTO bad_debt_provision (period, data) VALUES 
('2024-01', '{
  "equipment": [
    {"customerType": "上海", "initialBalance": 67.48, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 67.48},
    {"customerType": "国网", "initialBalance": 23.10, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 23.10},
    {"customerType": "江苏", "initialBalance": 56.20, "newAddition": 0.54, "currentReversal": 15.84, "finalBalance": 40.90},
    {"customerType": "输配电内配", "initialBalance": 8.84, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 8.84},
    {"customerType": "西门子", "initialBalance": 0.00, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 0.00},
    {"customerType": "同业", "initialBalance": 2.31, "newAddition": 4.59, "currentReversal": 0.00, "finalBalance": 6.90},
    {"customerType": "用户", "initialBalance": 85.26, "newAddition": 2.50, "currentReversal": 0.00, "finalBalance": 87.76},
    {"customerType": "其它", "initialBalance": 19.57, "newAddition": 1.70, "currentReversal": 0.00, "finalBalance": 21.27}
  ],
  "component": [
    {"customerType": "用户", "initialBalance": 19.05, "newAddition": 0.05, "currentReversal": 1.35, "finalBalance": 17.75}
  ],
  "project": [
    {"customerType": "一包", "initialBalance": 61.99, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 61.99},
    {"customerType": "二包", "initialBalance": 12.70, "newAddition": 5.36, "currentReversal": 0.00, "finalBalance": 18.06},
    {"customerType": "域内合作", "initialBalance": 0.00, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 0.00},
    {"customerType": "域外合作", "initialBalance": 71.61, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 71.61},
    {"customerType": "其它", "initialBalance": 42.82, "newAddition": 0.00, "currentReversal": 0.00, "finalBalance": 42.82}
  ]
}');