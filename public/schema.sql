-- InvertiSOL Repairing Labs MySQL Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.2+ on PHP hosting (cPanel, Hostinger, Bluehost, etc.)

CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` VARCHAR(100) PRIMARY KEY,
  `tracking_id` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(255) NOT NULL,
  `mobile_no` VARCHAR(50) NOT NULL,
  `address` TEXT,
  `inverter_brand` VARCHAR(100) NOT NULL,
  `inverter_kva` VARCHAR(50) NOT NULL,
  `serial_no` VARCHAR(100),
  `issue_description` TEXT,
  `status` VARCHAR(50) NOT NULL,
  `estimated_repair_date` VARCHAR(50),
  `approximate_cost` DECIMAL(12,2) DEFAULT 0,
  `repair_cost` DECIMAL(12,2) DEFAULT 0,
  `referral_cost` DECIMAL(12,2) DEFAULT 0,
  `pickup_cost` DECIMAL(12,2) DEFAULT 0,
  `delivery_cost` DECIMAL(12,2) DEFAULT 0,
  `total_inventory_cost` DECIMAL(12,2) DEFAULT 0,
  `total_bill_amount` DECIMAL(12,2) DEFAULT 0,
  `discount` DECIMAL(12,2) DEFAULT 0,
  `cash_paid` DECIMAL(12,2) DEFAULT 0,
  `online_paid` DECIMAL(12,2) DEFAULT 0,
  `referral_id` VARCHAR(100),
  `repair_remarks` TEXT,
  `bill_generated` TINYINT(1) DEFAULT 0,
  `is_bill_locked` TINYINT(1) DEFAULT 0,
  `payment_confirmed` TINYINT(1) DEFAULT 0,
  `delivered` TINYINT(1) DEFAULT 0,
  `delivery_date` VARCHAR(50),
  `raw_data_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `inventory` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `unit_cost` DECIMAL(12,2) NOT NULL,
  `unit_sale_price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `min_stock_level` INT DEFAULT 5,
  `location_rack` VARCHAR(100),
  `raw_data_json` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cash_transactions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100),
  `job_id` VARCHAR(100),
  `tracking_id` VARCHAR(50),
  `wallet_or_bank` VARCHAR(100),
  `date` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `app_data_store` (
  `store_key` VARCHAR(100) PRIMARY KEY,
  `json_content` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
