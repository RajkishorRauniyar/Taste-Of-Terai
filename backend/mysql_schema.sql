-- =====================================================
-- Taste Of Terai - Complete E-Commerce MySQL Database
-- Complete Database Schema for Orders, Products, Customers
-- Compatible with MySQL 5.7+
-- =====================================================

-- =====================================================
-- Drop existing tables if they exist (in reverse order)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `activity_log`;
DROP TABLE IF EXISTS `delivery_tracking`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `contact_messages`;

SET FOREIGN_KEY_CHECKS = 1;

-- Select the database
USE `taste_of_terai`;

-- =====================================================
-- Users Table (for admin and staff accounts)
-- =====================================================
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `role` ENUM('super_admin', 'admin', 'manager', 'order_coordinator', 'delivery') DEFAULT 'delivery',
    `is_active` TINYINT(1) DEFAULT 1,
    `avatar` VARCHAR(255),
    `last_login` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Customers Table (registered customers)
-- =====================================================
CREATE TABLE `customers` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100),
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `address` TEXT,
    `city` VARCHAR(50),
    `district` VARCHAR(50),
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_phone` (`phone`),
    INDEX `idx_email` (`email`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Categories Table (product categories)
-- =====================================================
CREATE TABLE `categories` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `image` VARCHAR(255),
    `is_active` TINYINT(1) DEFAULT 1,
    `sort_order` INT(11) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Products Table
-- =====================================================
CREATE TABLE `products` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `category_id` VARCHAR(36),
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `original_price` DECIMAL(10,2),
    `weight` VARCHAR(50),
    `unit` VARCHAR(20) DEFAULT 'piece',
    `image` VARCHAR(255),
    `badge` VARCHAR(50),
    `in_stock` TINYINT(1) DEFAULT 1,
    `is_featured` TINYINT(1) DEFAULT 0,
    `sort_order` INT(11) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_category` (`category_id`),
    INDEX `idx_price` (`price`),
    INDEX `idx_in_stock` (`in_stock`),
    INDEX `idx_is_featured` (`is_featured`),
    INDEX `idx_sort_order` (`sort_order`),
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Orders Table
-- =====================================================
CREATE TABLE `orders` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `customer_id` VARCHAR(36),
    `customer_name` VARCHAR(100) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `customer_email` VARCHAR(100),
    `shipping_address` TEXT NOT NULL,
    `city` VARCHAR(50),
    `district` VARCHAR(50),
    `subtotal` DECIMAL(10,2) NOT NULL,
    `delivery_charge` DECIMAL(10,2) DEFAULT 0,
    `total` DECIMAL(10,2) NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'cash',
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    `notes` TEXT,
    `assigned_to` VARCHAR(36),
    `payment_reference` VARCHAR(100),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_order_number` (`order_number`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_customer_phone` (`customer_phone`),
    INDEX `idx_status` (`status`),
    INDEX `idx_payment_status` (`payment_status`),
    INDEX `idx_created_at` (`created_at`),
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Order Items Table
-- =====================================================
CREATE TABLE `order_items` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `order_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36),
    `product_name` VARCHAR(150) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_product_id` (`product_id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Payments Table
-- =====================================================
CREATE TABLE `payments` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `order_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `method` VARCHAR(50),
    `reference` VARCHAR(100),
    `transaction_id` VARCHAR(100),
    `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_transaction_id` (`transaction_id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Delivery Tracking Table
-- =====================================================
CREATE TABLE `delivery_tracking` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `order_id` VARCHAR(36) NOT NULL,
    `driver_id` VARCHAR(36),
    `driver_name` VARCHAR(100),
    `driver_phone` VARCHAR(20),
    `status` ENUM('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    `current_location` VARCHAR(255),
    `estimated_arrival` DATETIME,
    `pickup_time` DATETIME,
    `delivery_time` DATETIME,
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_driver_id` (`driver_id`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Activity Log Table
-- =====================================================
CREATE TABLE `activity_log` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `user_id` VARCHAR(36),
    `action` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(50),
    `entity_id` VARCHAR(36),
    `details` TEXT,
    `ip_address` VARCHAR(45),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_entity_type` (`entity_type`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Reservations Table
-- =====================================================
CREATE TABLE `reservations` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `customer_id` VARCHAR(36),
    `guest_name` VARCHAR(100) NOT NULL,
    `guest_email` VARCHAR(100),
    `guest_phone` VARCHAR(20) NOT NULL,
    `guest_count` INT(11) DEFAULT 1,
    `reservation_date` DATE NOT NULL,
    `reservation_time` TIME NOT NULL,
    `table_number` VARCHAR(20),
    `special_requests` TEXT,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_date` (`reservation_date`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Contact Messages Table
-- =====================================================
CREATE TABLE `contact_messages` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `subject` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
    `ip_address` VARCHAR(45),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_status` (`status`),
    INDEX `idx_email` (`email`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data: Users (Admin)
-- Password: admin123 (bcrypt hashed)
-- =====================================================
INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `role`) VALUES
('4f777921-5974-4175-8bc6-9f6a603fb037', 'admin@tasteofterai.com', '$2a$10$ex1xSE2L6MTyT2Yll32vIeLtfyaIzQea4lFtBmHyoe7gkm2EBwtxe', 'Super Admin', '+977-9765151023', 'super_admin');

-- =====================================================
-- Sample Data: Categories
-- =====================================================
INSERT INTO `categories` (`id`, `name`, `description`, `is_active`, `sort_order`) VALUES
('01b3bac8-40fe-4ea6-9758-36608c48a9be', 'Traditional Sweets', 'Authentic traditional Nepali sweets', 1, 1),
('b7cd95f8-8874-43db-ac6f-28f59b9c772c', 'Ladoo', 'Various types of ladoo', 1, 2),
('74dea0bf-91b0-4db4-8737-0e45fc12cefb', 'Dry Fruits', 'Premium dry fruits', 1, 3),
('4c6ad898-fd5e-4f1c-a437-5f28c83f006f', 'Premium Sweets', 'Premium quality sweets', 1, 4),
('ae2866d5-1b3b-4e4e-9d01-8d25416a14a5', 'Gift Boxes', 'Beautifully packed gift boxes', 1, 5);

-- =====================================================
-- Sample Data: Products
-- =====================================================
INSERT INTO `products` (`id`, `name`, `category_id`, `description`, `price`, `original_price`, `weight`, `image`, `badge`, `in_stock`, `is_featured`, `sort_order`) VALUES
('7ab53e0e-dcec-401c-bd4a-142575209d87', 'Khajuri', '01b3bac8-40fe-4ea6-9758-36608c48a9be', 'Traditional date palm sweet, handcrafted with authentic recipe.', 500.00, 600.00, '500 gm', 'https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400&h=300&fit=crop', 'Best Seller', 1, 1, 1),
('d182ba04-6914-4c17-b53a-754a9687b3c1', 'Thekuwa', '01b3bac8-40fe-4ea6-08c48a9758-3669be', 'Traditional Nepalese wheat flour sweet with jaggery.', 500.00, 600.00, '500 gm', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', 'Popular', 1, 1, 2),
('427a17f2-1f31-4d9d-bec4-e12691c207bc', 'Mix Dry Fruits', '74dea0bf-91b0-4db4-8737-0e45fc12cefb', 'Premium mix of almonds, cashews, raisins, walnuts, and apricots.', 1000.00, 1200.00, '500 gm', 'https://images.unsplash.com/photo-1599598425947-730816b1ee3c?w=400&h=300&fit=crop', 'Premium', 1, 1, 3),
('9208df7d-33ac-4aad-885e-7cabf16b314f', 'Mix Dry Fruits Ladoo', 'b7cd95f8-8874-43db-ac6f-28f59b9c772c', 'Delicious ladoo made with premium dry fruits, ghee, and jaggery.', 1100.00, 1300.00, '500 gm', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=300&fit=crop', 'New', 1, 1, 4),
('a0226889-5b18-4b7f-9151-874f2cb86efc', 'Besan Laddu', 'b7cd95f8-8874-43db-ac6f-28f59b9c772c', 'Classic gram flour laddu with aromatic spices and ghee.', 450.00, 500.00, '500 gm', 'https://images.unsplash.com/photo-1627665460198-2457172596d6?w=400&h=300&fit=crop', 'Traditional', 1, 0, 5),
('bd32c4fe-0de6-40aa-884f-95174077ff12', 'Motichoor Laddu', 'b7cd95f8-8874-43db-ac6f-28f59b9c772c', 'Fine gram flour pearls soaked in rose-flavored sugar syrup.', 550.00, 650.00, '500 gm', 'https://images.unsplash.com/photo-1605197136312-dba8b5595f5d?w=400&h=300&fit=crop', 'Favorite', 1, 1, 6),
('442649af-1d45-4888-b12f-df95f891070a', 'Kaju Katli', '4c6ad898-fd5e-4f1c-a437-5f28c83f006f', 'Premium cashew fudge with silver leaf decoration.', 850.00, 1000.00, '500 gm', 'https://images.unsplash.com/photo-1605197136312-dba8b5595f5d?w=400&h=300&fit=crop', 'Premium', 1, 1, 7),
('cb5603a2-b9b3-467c-9bf3-4d7d2077c530', 'Gulab Jamun', '01b3bac8-40fe-4ea6-9758-36608c48a9be', 'Soft dough balls soaked in rose-flavored sugar syrup.', 400.00, 450.00, '500 gm', 'https://images.unsplash.com/photo-1627665460198-2457172596d6?w=400&h=300&fit=crop', 'Popular', 1, 0, 8);
