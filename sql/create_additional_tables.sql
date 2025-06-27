-- 六个新财务报表的数据库表结构

-- 1. 主营业务存量订单转收入
CREATE TABLE stock_order_to_income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 非主营业务情况
CREATE TABLE non_main_business (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 成本中心结构与质量
CREATE TABLE cost_center_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 主营业务边际贡献率
CREATE TABLE business_contribution (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 主营业务毛利率
CREATE TABLE business_profit_margin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 净利润结构
CREATE TABLE net_profit_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入示例数据

-- 主营业务存量订单转收入示例数据
INSERT INTO stock_order_to_income (period, data) VALUES 
('2024-01', '{
  "equipment": [
    {"customer": "上海", "stockOrder": 39050.53, "incomeTotal": 2363.98, "incomeRate": 6.05},
    {"customer": "国网", "stockOrder": 7802.20, "incomeTotal": 884.59, "incomeRate": 11.34},
    {"customer": "江苏", "stockOrder": 6341.95, "incomeTotal": 119.81, "incomeRate": 1.89},
    {"customer": "输配电内配", "stockOrder": 0.00, "incomeTotal": 0.00, "incomeRate": 0.00},
    {"customer": "西门子", "stockOrder": 14.11, "incomeTotal": 0.00, "incomeRate": 0.00, "specialRate": "/"},
    {"customer": "同业", "stockOrder": 1003.79, "incomeTotal": 67.98, "incomeRate": 6.77},
    {"customer": "用户", "stockOrder": 535.45, "incomeTotal": 26.41, "incomeRate": 4.93},
    {"customer": "其它", "stockOrder": 221.15, "incomeTotal": 0.00, "incomeRate": 0.00, "specialRate": "/"}
  ],
  "components": [
    {"customer": "用户", "stockOrder": 34.95, "incomeTotal": 3.09, "incomeRate": 8.84}
  ],
  "engineering": [
    {"customer": "一包", "stockOrder": 13327.25, "incomeTotal": -0.01, "incomeRate": 0.00},
    {"customer": "二包", "stockOrder": 954.35, "incomeTotal": 297.01, "incomeRate": 31.12},
    {"customer": "域内合作", "stockOrder": 1906.28, "incomeTotal": 717.23, "incomeRate": 37.62},
    {"customer": "域外合作", "stockOrder": 7590.69, "incomeTotal": 522.45, "incomeRate": 6.88},
    {"customer": "其它", "stockOrder": 1677.30, "incomeTotal": 145.39, "incomeRate": 8.69}
  ]
}');

-- 非主营业务情况示例数据
INSERT INTO non_main_business (period, data) VALUES 
('2024-01', '[
  {"id": 1, "category": "固定收入", "yearlyPlan": 100.00, "currentTotal": 49.61},
  {"id": 2, "category": "房屋租金", "yearlyPlan": 100.00, "currentTotal": 0.69},
  {"id": 3, "category": "利息收入", "yearlyPlan": 100.00, "currentTotal": 16.72},
  {"id": 4, "category": "投资收益", "yearlyPlan": 130.00, "currentTotal": 0.00},
  {"id": 5, "category": "补贴收入", "yearlyPlan": 130.00, "currentTotal": 0.00},
  {"id": 6, "category": "其他", "yearlyPlan": 40.00, "currentTotal": 56.26}
]');

-- 成本中心结构示例数据 
INSERT INTO cost_center_structure (period, data) VALUES 
('2024-01', '[
  {"name": "总经理室", "yibao": 116.80, "erbao": 37.53, "xinnengyuan": 34.00, "qiangxiu": 9.38, "yunjian": 37.53, "jianli": null, "yunei": 6.80, "yuwai": null, "yuwaisuzhou": 13.60, "shebeiwaifu": null, "total": 255.63},
  {"name": "经营部", "yibao": 160.55, "erbao": 19.80, "xinnengyuan": 86.34, "qiangxiu": null, "yunjian": 7.45, "jianli": 2.72, "yunei": 10.87, "yuwai": 13.88, "yuwaisuzhou": 2.95, "shebeiwaifu": null, "total": 304.45},
  {"name": "经管部", "yibao": -9.89, "erbao": -5.89, "xinnengyuan": -4.85, "qiangxiu": null, "yunjian": -2.21, "jianli": -0.15, "yunei": -6.34, "yuwai": -8.09, "yuwaisuzhou": -1.15, "shebeiwaifu": 0.00, "total": -38.57}
]');

-- 主营业务边际贡献率示例数据
INSERT INTO business_contribution (period, data) VALUES 
('2024-01', '{
  "equipment": {
    "shanghai": {"plan": "28.22%", "actual": "38.02%", "difference": "9.80%"},
    "national": {"plan": "20.19%", "actual": "20.05%", "difference": "-0.14%"},
    "jiangsu": {"plan": "8.00%", "actual": "8.00%", "difference": "0.00%"},
    "power": {"plan": "/", "actual": "当期无收入", "difference": "/"}
  },
  "automation": {
    "siemens": {"plan": "/", "actual": "当期无收入", "difference": "/"},
    "peers": {"plan": "25.92%", "actual": "33.00%", "difference": "7.08%"},
    "users": {"plan": "/", "actual": "0.00%", "difference": "/"},
    "others": {"plan": "/", "actual": "6.00%", "difference": "/"}
  },
  "components": {
    "users": {"plan": "/", "actual": "59.65%", "difference": "/"}
  },
  "engineering": {
    "package1": {"plan": "26.00%", "actual": "25.90%", "difference": "-0.10%"},
    "package2": {"plan": "15.00%", "actual": "4.18%", "difference": "-10.82%"},
    "domestic": {"plan": "8.00%", "actual": "4.77%", "difference": "-3.23%"},
    "international": {"plan": "6.00%", "actual": "6.00%", "difference": "0.00%"},
    "others": {"plan": "15.00%", "actual": "14.77%", "difference": "0.23%"}
  },
  "total": {"plan": "21.98%", "actual": "25.56%", "difference": "3.58%"}
}');

-- 主营业务毛利率示例数据
INSERT INTO business_profit_margin (period, data) VALUES 
('2024-01', '{
  "equipment": {
    "shanghai": {"plan": "21.99%", "actual": "31.06%", "difference": "9.07%"},
    "national": {"plan": "13.83%", "actual": "15.72%", "difference": "1.89%"},
    "jiangsu": {"plan": "8.00%", "actual": "8.48%", "difference": "0.48%"},
    "power": {"plan": "/", "actual": "当期无收入", "difference": "/"},
    "siemens": {"plan": "/", "actual": "当期无收入", "difference": "/"},
    "peers": {"plan": "22.43%", "actual": "33.05%", "difference": "10.62%"},
    "users": {"plan": "11.68%", "actual": "/", "difference": "/"},
    "others": {"plan": "/", "actual": "6.00%", "difference": "/"}
  },
  "components": {
    "users": {"plan": "/", "actual": "11.09%", "difference": "/"}
  },
  "engineering": {
    "package1": {"plan": "26.00%", "actual": "1676.90%", "difference": "1651.90%"},
    "package2": {"plan": "15.00%", "actual": "3.74%", "difference": "-11.26%"},
    "domestic": {"plan": "8.00%", "actual": "4.65%", "difference": "-3.35%"},
    "international": {"plan": "6.00%", "actual": "5.14%", "difference": "-0.86%"},
    "others": {"plan": "15.00%", "actual": "8.59%", "difference": "6.41%"}
  },
  "total": {"plan": "24.00%", "actual": "20.98%", "difference": "-3.02%"}
}');

-- 净利润结构示例数据
INSERT INTO net_profit_structure (period, data) VALUES 
('2024-01', '{
  "mainBusiness": {"plan": "3,871.58", "actual": "240.20", "progress": "6.20%"},
  "nonMainBusiness": {"plan": "128.42", "actual": "77.09", "progress": "60.03%"},
  "total": {"plan": "4,000.00", "actual": "317.28", "progress": "7.93%"}
}');