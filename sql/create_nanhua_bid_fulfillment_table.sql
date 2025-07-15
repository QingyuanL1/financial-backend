-- 南华中标未履约情况表
CREATE TABLE IF NOT EXISTS nanhua_bid_fulfillment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(7) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  initial_amount DECIMAL(15,2) DEFAULT 0,
  current_amount DECIMAL(15,2) DEFAULT 0,
  category VARCHAR(50) DEFAULT '工程',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_period (period),
  INDEX idx_customer (customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
