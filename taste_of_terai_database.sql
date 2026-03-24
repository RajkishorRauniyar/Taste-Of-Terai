-- =====================================================
-- Taste Of Terai - MySQL Database
-- Restaurant Website Database
-- Compatible with MySQL 5.7+
-- =====================================================

-- =====================================================
-- Drop existing tables if they exist (in reverse order)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `contact_info`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Users Table (for admin and customer accounts)
-- =====================================================
CREATE TABLE `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `role` ENUM('admin', 'customer') DEFAULT 'customer',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Categories Table (menu categories)
-- =====================================================
CREATE TABLE `categories` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `image` VARCHAR(255),
    `display_order` INT(11) DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_slug` (`slug`),
    INDEX `idx_display_order` (`display_order`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Menu Items Table
-- =====================================================
CREATE TABLE `menu_items` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `description` TEXT,
    `short_description` VARCHAR(255),
    `price` DECIMAL(10,2) NOT NULL,
    `original_price` DECIMAL(10,2),
    `image` VARCHAR(255),
    `thumbnail` VARCHAR(255),
    `is_vegetarian` TINYINT(1) DEFAULT 0,
    `is_vegan` TINYINT(1) DEFAULT 0,
    `is_gluten_free` TINYINT(1) DEFAULT 0,
    `is_spicy` TINYINT(1) DEFAULT 0,
    `spice_level` ENUM('mild', 'medium', 'hot', 'extra_hot') DEFAULT 'medium',
    `preparation_time` INT(11) DEFAULT 15 COMMENT 'Time in minutes',
    `calories` INT(11),
    `is_available` TINYINT(1) DEFAULT 1,
    `is_featured` TINYINT(1) DEFAULT 0,
    `display_order` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_slug` (`slug`),
    INDEX `idx_category` (`category_id`),
    INDEX `idx_price` (`price`),
    INDEX `idx_available` (`is_available`),
    INDEX `idx_featured` (`is_featured`),
    INDEX `idx_display_order` (`display_order`),
    INDEX `idx_vegetarian` (`is_vegetarian`),
    CONSTRAINT `fk_menu_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Reservations Table
-- =====================================================
CREATE TABLE `reservations` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11),
    `guest_name` VARCHAR(100) NOT NULL,
    `guest_email` VARCHAR(100) NOT NULL,
    `guest_phone` VARCHAR(20) NOT NULL,
    `guest_count` INT(11) NOT NULL DEFAULT 1,
    `reservation_date` DATE NOT NULL,
    `reservation_time` TIME NOT NULL,
    `table_number` VARCHAR(20),
    `special_requests` TEXT,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_date` (`reservation_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_email` (`guest_email`),
    INDEX `idx_phone` (`guest_phone`),
    CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Reviews Table (Customer Reviews)
-- =====================================================
CREATE TABLE `reviews` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11),
    `menu_item_id` INT(11),
    `order_id` INT(11),
    `reviewer_name` VARCHAR(100) NOT NULL,
    `reviewer_email` VARCHAR(100),
    `rating` TINYINT(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `title` VARCHAR(200),
    `comment` TEXT,
    `is_verified_purchase` TINYINT(1) DEFAULT 0,
    `is_approved` TINYINT(1) DEFAULT 1,
    `helpful_count` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_menu_item` (`menu_item_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_rating` (`rating`),
    INDEX `idx_approved` (`is_approved`),
    INDEX `idx_created` (`created_at`),
    CONSTRAINT `fk_review_menu` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Contact Information Table
-- =====================================================
CREATE TABLE `contact_info` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `type` ENUM('address', 'phone', 'email', 'social', 'hours') NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `is_primary` TINYINT(1) DEFAULT 0,
    `display_order` INT(11) DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Contact Messages Table
-- =====================================================
CREATE TABLE `contact_messages` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `subject` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_email` (`email`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data: Users
-- =====================================================
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `phone`, `role`) VALUES
('admin', 'admin@tasteofterai.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Restaurant Admin', '+977-9765151023', 'admin'),
('customer1', 'rajesh@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rajesh Kumar', '+977-9845123456', 'customer'),
('customer2', 'priya@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', '+977-9845789012', 'customer'),
('customer3', 'amit@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amit Patel', '+977-9801234567', 'customer');

-- Password for all sample users: 'password123' (hashed with bcrypt)

-- =====================================================
-- Sample Data: Categories
-- =====================================================
INSERT INTO `categories` (`name`, `slug`, `description`, `image`, `display_order`, `is_active`) VALUES
('Biryani & Rice', 'biryani-rice', 'Aromatic rice dishes cooked with spices and your choice of meat or vegetables', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', 1, 1),
('Curries', 'curries', 'Rich and flavorful curries made with authentic Nepalese and Indian spices', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 2, 1),
('Kebabs & Tandoor', 'kebabs-tandoor', 'Tandoor-cooked delicacies with smoky flavors and tender meat', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400', 3, 1),
('Breads & Naan', 'breads-naan', 'Freshly baked breads including naan, roti, and paratha', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 4, 1),
('Traditional Sweets', 'traditional-sweets', 'Authentic Mithai and desserts from the Terai region', 'https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400', 5, 1),
('Beverages', 'beverages', 'Refreshing drinks including lassi, chai, and sherbet', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 6, 1),
('Starters', 'starters', 'Appetizing starters and snacks to begin your meal', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 7, 1),
('Vegetarian Specials', 'vegetarian-specials', 'Delicious vegetarian dishes from our kitchen', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 8, 1);

-- =====================================================
-- Sample Data: Menu Items
-- =====================================================
INSERT INTO `menu_items` (`category_id`, `name`, `slug`, `description`, `short_description`, `price`, `original_price`, `image`, `is_vegetarian`, `is_spicy`, `spice_level`, `preparation_time`, `calories`, `is_available`, `is_featured`, `display_order`) VALUES

-- Biryani & Rice (Category 1)
(1, 'Chicken Biryani', 'chicken-biryani', 'Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, saffron, and caramelized onions. A signature dish from our kitchen.', 'Aromatic chicken with basmati rice', 450.00, 500.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', 0, 1, 'medium', 30, 650, 1, 1, 1),
(1, 'Mutton Biryani', 'mutton-biryani', 'Premium quality mutton cooked with aged basmati rice, whole spices, and traditional herbs. Slow-cooked for authentic flavor.', 'Premium mutton with aromatic rice', 550.00, 600.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400', 0, 1, 'hot', 35, 720, 1, 1, 2),
(1, 'Vegetable Biryani', 'vegetable-biryani', 'Colorful mix of fresh vegetables cooked with basmati rice and aromatic spices. A vegetarian delight.', 'Fresh vegetables with basmati rice', 320.00, NULL, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 1, 0, 'mild', 25, 480, 1, 0, 3),
(1, 'Jeera Rice', 'jeera-rice', 'Basmati rice tempered with cumin seeds, ginger, and fresh herbs.', 'Cumin-flavored basmati rice', 180.00, NULL, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 1, 0, 'mild', 15, 280, 1, 0, 4),
(1, 'Kashmiri Pulao', 'kashmiri-pulao', 'A royal rice dish with nuts, fruits, and aromatic spices, sweetened with saffron.', 'Sweet rice with nuts and fruits', 350.00, NULL, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400', 1, 0, 'mild', 20, 420, 1, 0, 5),

-- Curries (Category 2)
(2, 'Chicken Tikka Masala', 'chicken-tikka-masala', 'Tender chicken tikka in a rich, creamy tomato-based curry. A customer favorite!', 'Creamy tomato curry with chicken', 420.00, NULL, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400', 0, 1, 'medium', 25, 580, 1, 1, 1),
(2, 'Butter Chicken', 'butter-chicken', 'Tender chicken in a rich, buttery tomato-cream sauce with aromatic spices.', 'Creamy butter chicken curry', 450.00, 480.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', 0, 1, 'mild', 25, 620, 1, 1, 2),
(2, 'Lamb Rogan Josh', 'lamb-rogan-josh', 'Slow-cooked lamb in a rich, aromatic curry with Kashmir spices.', 'Spicy lamb with traditional spices', 520.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 0, 1, 'hot', 35, 680, 1, 0, 3),
(2, 'Palak Paneer', 'palak-paneer', 'Fresh cottage cheese cubes in a smooth spinach gravy with herbs and spices.', 'Paneer in creamy spinach curry', 320.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 1, 0, 'mild', 20, 420, 1, 1, 4),
(2, 'Dal Makhani', 'dal-makhani', 'Slow-cooked black lentils in a rich, creamy tomato gravy with butter.', 'Creamy black lentil curry', 280.00, NULL, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 1, 0, 'mild', 25, 380, 1, 0, 5),
(2, 'Chicken Curry', 'chicken-curry', 'Traditional Nepali-style chicken curry with home-made spices.', 'Traditional Nepali chicken curry', 380.00, NULL, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400', 0, 1, 'hot', 25, 520, 1, 0, 6),
(2, 'Paneer Tikka Masala', 'paneer-tikka-masala', 'Grilled paneer cubes in a rich, creamy tomato curry.', 'Creamy curry with grilled paneer', 360.00, NULL, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', 1, 1, 'medium', 20, 480, 1, 0, 7),

-- Kebabs & Tandoor (Category 3)
(3, 'h KChicken Seekebab', 'chicken-seekh-kebab', 'Minced chicken grilled on skewers with aromatic spices and herbs.', 'Minced chicken on skewers', 380.00, NULL, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400', 0, 1, 'medium', 20, 320, 1, 1, 1),
(3, 'Mutton Seekh Kebab', 'mutton-seekh-kebab', 'Minced mutton with spices, grilled to perfection on charcoal.', 'Minced mutton on charcoal skewers', 450.00, NULL, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', 0, 1, 'hot', 25, 380, 1, 0, 2),
(3, 'Chicken Tikka', 'chicken-tikka', 'Tender chicken pieces marinated in yogurt and spices, grilled in tandoor.', 'Tandoor-grilled chicken pieces', 420.00, NULL, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400', 0, 1, 'medium', 25, 350, 1, 1, 3),
(3, 'Paneer Tikka', 'paneer-tikka', 'Cottage cheese cubes marinated in spiced yogurt, grilled in tandoor.', 'Tandoor-grilled paneer', 350.00, NULL, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', 1, 0, 'mild', 20, 280, 1, 0, 4),
(3, 'Tandoori Chicken', 'tandoori-chicken', 'Whole chicken marinated in yogurt and tandoori spices, roasted in clay oven.', 'Traditional tandoori chicken', 680.00, 750.00, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', 0, 1, 'medium', 45, 520, 1, 0, 5),
(3, 'Fish Tikka', 'fish-tikka', 'Fish cubes marinated in lemon and spices, grilled to perfection.', 'Tandoor-grilled fish', 480.00, NULL, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', 0, 0, 'mild', 20, 280, 1, 0, 6),

-- Breads & Naan (Category 4)
(4, 'Butter Naan', 'butter-naan', 'Soft, fluffy naan bread brushed with melted butter.', 'Classic butter naan bread', 60.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 1, 0, 'mild', 10, 180, 1, 1, 1),
(4, 'Garlic Naan', 'garlic-naan', 'Naan topped with fresh garlic and herbs, baked in tandoor.', 'Naan with garlic and herbs', 80.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 1, 0, 'mild', 10, 200, 1, 1, 2),
(4, 'Cheese Naan', 'cheese-naan', 'Naan stuffed with melted cheese, a favorite among cheese lovers.', 'Naan stuffed with cheese', 120.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 1, 0, 'mild', 12, 250, 1, 0, 3),
(4, 'Keema Naan', 'keema-naan', 'Naan stuffed with spiced minced meat.', 'Naan with minced meat filling', 150.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 0, 1, 'medium', 15, 320, 1, 0, 4),
(4, 'Tandoor Roti', 'tandoor-roti', 'Whole wheat bread baked in tandoor, crisp and healthy.', 'Whole wheat tandoor bread', 40.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 1, 0, 'mild', 8, 150, 1, 0, 5),
(4, 'Lachha Paratha', 'lachha-paratha', 'Layered, flaky paratha made with whole wheat flour.', 'Flaky layered paratha', 70.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 1, 0, 'mild', 12, 220, 1, 0, 6),
(4, 'Missi Roti', 'missi-roti', 'Traditional Indian bread made with gram flour and spices.', 'Gram flour flatbread', 55.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 1, 0, 'mild', 10, 180, 1, 0, 7),

-- Traditional Sweets (Category 5)
(5, 'Khajuri', 'khajuri', 'Traditional date palm candy from Terai region, sweet and chewy.', 'Traditional date palm sweet', 250.00, NULL, 'https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400', 1, 0, 'mild', 5, 200, 1, 1, 1),
(5, 'Thekuwa', 'thekuwa', 'Traditional Nepali sweet made with flour, ghee, and jaggery.', 'Nepali jaggery-based sweet', 220.00, NULL, 'https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400', 1, 0, 'mild', 5, 180, 1, 1, 2),
(5, 'Gulab Jamun', 'gulab-jamun', 'Deep-fried milk dumplings soaked in rose-flavored sugar syrup.', 'Milk dumplings in syrup', 150.00, NULL, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400', 1, 0, 'mild', 10, 250, 1, 1, 3),
(5, 'Rasgulla', 'rasgulla', 'Soft cottage cheese balls cooked in light sugar syrup.', 'Cottage cheese in syrup', 140.00, NULL, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400', 1, 0, 'mild', 10, 180, 1, 0, 4),
(5, 'Jalebi', 'jalebi', 'Crispy, pretzel-shaped sweet soaked in saffron syrup.', 'Crispy sweet in saffron syrup', 130.00, NULL, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400', 1, 0, 'mild', 10, 220, 1, 0, 5),
(5, 'Kaju Katli', 'kaju-katli', 'Premium cashew fudge decorated with edible silver leaf.', 'Cashew fudge with silver leaf', 400.00, NULL, 'https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400', 1, 0, 'mild', 5, 200, 1, 0, 6),
(5, 'Mix Dry Fruits', 'mix-dry-fruits', 'Premium assortment of roasted nuts and dried fruits.', 'Assorted roasted nuts', 350.00, NULL, 'https://images.unsplash.com/photo-1599598425947-0307543a9ce8?w=400', 1, 0, 'mild', 5, 180, 1, 1, 7),

-- Beverages (Category 6)
(6, 'Mango Lassi', 'mango-lassi', 'Creamy yogurt drink blended with sweet mangoes.', 'Mango yogurt smoothie', 120.00, NULL, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', 1, 0, 'mild', 5, 180, 1, 1, 1),
(6, 'Masala Chai', 'masala-chai', 'Traditional Nepali spiced tea brewed with milk and aromatic spices.', 'Spiced Nepali tea', 50.00, NULL, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', 1, 0, 'mild', 5, 80, 1, 1, 2),
(6, 'Sweet Lassi', 'sweet-lassi', 'Fresh yogurt drink sweetened with sugar.', 'Sweet yogurt drink', 80.00, NULL, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', 1, 0, 'mild', 5, 120, 1, 0, 3),
(6, 'Buttermilk (Chaas)', 'buttermilk', 'Refreshing spiced buttermilk drink.', 'Spiced buttermilk', 60.00, NULL, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', 1, 0, 'mild', 5, 60, 1, 0, 4),
(6, 'Fresh Lime Soda', 'fresh-lime-soda', 'Sparkling water with fresh lime juice and mint.', 'Lime soda with mint', 70.00, NULL, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', 1, 0, 'mild', 3, 50, 1, 0, 5),
(6, 'Rose Sherbet', 'rose-sherbet', 'Refreshing rose-flavored drink.', 'Rose-flavored cooler', 80.00, NULL, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', 1, 0, 'mild', 3, 70, 1, 0, 6),

-- Starters (Category 7)
(7, 'Samosa', 'samosa', 'Crispy pastry filled with spiced potatoes and peas.', 'Crispy vegetable pastry', 60.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 1, 1, 'medium', 10, 180, 1, 1, 1),
(7, 'Pakora', 'pakora', 'Vegetable fritters made with chickpea flour.', 'Crispy vegetable fritters', 80.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 1, 0, 'mild', 10, 220, 1, 1, 2),
(7, 'Chicken Wings', 'chicken-wings', 'Tandoor-spiced chicken wings, crispy outside, tender inside.', 'Spiced tandoori wings', 280.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 0, 1, 'hot', 15, 250, 1, 0, 3),
(7, 'Spring Rolls', 'spring-rolls', 'Crispy rolls filled with vegetables and noodles.', 'Crispy vegetable rolls', 100.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 1, 0, 'mild', 10, 160, 1, 0, 4),
(7, 'Paneer 65', 'paneer-65', 'Spicy deep-fried paneer cubes with curry leaves.', 'Spicy fried paneer', 250.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 1, 1, 'hot', 12, 280, 1, 0, 5),
(7, 'Chicken 65', 'chicken-65', 'Spicy deep-fried chicken appetizer with curry leaves.', 'Spicy fried chicken', 280.00, NULL, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 0, 1, 'hot', 12, 320, 1, 0, 6),

-- Vegetarian Specials (Category 8)
(8, 'Dal Tadka', 'dal-tadka', 'Yellow lentils tempered with garlic, cumin, and spices.', 'Yellow lentils with tempering', 200.00, NULL, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 1, 0, 'mild', 15, 280, 1, 1, 1),
(8, 'Vegetable Korma', 'vegetable-korma', 'Mixed vegetables in a rich, creamy coconut curry.', 'Creamy vegetable curry', 300.00, NULL, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 1, 0, 'mild', 20, 380, 1, 0, 2),
(8, 'Bhendi Masala', 'bhendi-masala', 'Okra stir-fried with onions and spices.', 'Spiced okra curry', 280.00, NULL, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 1, 1, 'medium', 18, 250, 1, 0, 3),
(8, 'Aloo Gobi', 'aloo-gobi', 'Potatoes and cauliflower cooked with spices.', 'Potato-cauliflower curry', 250.00, NULL, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 1, 0, 'mild', 18, 220, 1, 0, 4),
(8, 'Mushroom Masala', 'mushroom-masala', 'Fresh mushrooms in a flavorful onion-tomato gravy.', 'Mushroom in onion gravy', 320.00, NULL, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 1, 0, 'mild', 20, 280, 1, 0, 5),
(8, 'Mixed Vegetable Thali', 'mixed-vegetable-thali', 'Assorted vegetables, dal, rice, roti, and accompaniments.', 'Complete vegetarian meal', 450.00, NULL, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 1, 0, 'mild', 25, 650, 1, 0, 6);

-- =====================================================
-- Sample Data: Reservations
-- =====================================================
INSERT INTO `reservations` (`user_id`, `guest_name`, `guest_email`, `guest_phone`, `guest_count`, `reservation_date`, `reservation_time`, `table_number`, `special_requests`, `status`) VALUES
(2, 'Rajesh Kumar', 'rajesh@example.com', '+977-9845123456', 4, '2026-02-25', '19:00:00', 'Table 5', 'Birthday celebration - please arrange cake', 'confirmed'),
(3, 'Priya Sharma', 'priya@example.com', '+977-9845789012', 2, '2026-02-26', '12:30:00', 'Table 2', 'Window seat preferred', 'confirmed'),
(NULL, 'Amit Patel', 'amit@example.com', '+977-9801234567', 6, '2026-02-27', '20:00:00', 'Table 8', 'Need quiet area for business discussion', 'pending'),
(2, 'Rajesh Kumar', 'rajesh@example.com', '+977-9845123456', 3, '2026-02-28', '13:00:00', 'Table 3', NULL, 'confirmed'),
(NULL, 'Sita Devi', 'sita@example.com', '+977-9845678901', 2, '2026-03-01', '18:30:00', 'Table 1', 'Anniversary dinner', 'confirmed');

-- =====================================================
-- Sample Data: Reviews
-- =====================================================
INSERT INTO `reviews` (`user_id`, `menu_item_id`, `order_id`, `reviewer_name`, `reviewer_email`, `rating`, `title`, `comment`, `is_verified_purchase`, `is_approved`, `helpful_count`) VALUES
(2, 1, NULL, 'Rajesh Kumar', 'rajesh@example.com', 5, 'Best Biryani in Town!', 'The chicken biryani was absolutely amazing! The rice was perfectly cooked and the spices were just right. Will definitely order again.', 1, 1, 15),
(3, 3, NULL, 'Priya Sharma', 'priya@example.com', 5, 'Authentic Flavor', 'As someone who grew up in Nepal, this brings back so many memories. The vegetable biryani is just like my grandmother used to make!', 1, 1, 12),
(NULL, 8, NULL, 'Amit Patel', 'amit@example.com', 4, 'Great Chicken Tikka', 'The chicken tikka was tender and flavorful. Service was quick too. Would have given 5 stars if they had more vegetarian options.', 0, 1, 8),
(2, 20, NULL, 'Rajesh Kumar', 'rajesh@example.com', 5, 'Perfect Butter Naan', 'The butter naan is absolutely fresh and soft. Goes perfectly with the dal makhani.', 1, 1, 20),
(3, 35, NULL, 'Priya Sharma', 'priya@example.com', 5, 'Best Khajuri Ever!', 'Finally found authentic khajuri outside of Terai! The quality is outstanding. Ordered 2 kgs for family.', 1, 1, 18),
(NULL, 40, NULL, 'Sita Devi', 'sita@example.com', 5, 'Delicious Mango Lassi', 'The mango lassi is thick, creamy, and perfectly sweet. A must-try!', 0, 1, 10),
(NULL, 43, NULL, 'Rajiv Mehta', 'rajiv@example.com', 4, 'Good Samosas', 'Crispy and well-spiced samosas. Good portion size for the price.', 0, 1, 5),
(2, 22, NULL, 'Rajesh Kumar', 'rajesh@example.com', 5, 'Amazing Gulab Jamun', 'The gulab jamun is melt-in-your-mouth delicious! Reminds me of festive celebrations.', 1, 1, 22),
(NULL, 55, NULL, 'Anita Gurung', 'anita@example.com', 5, 'Authentic Dal Tadka', 'The dal tadka is perfectly tempered with garlic. Simple but authentic.', 0, 1, 14);

-- =====================================================
-- Sample Data: Contact Information
-- =====================================================
INSERT INTO `contact_info` (`type`, `label`, `value`, `is_primary`, `display_order`, `is_active`) VALUES
('address', 'Main Restaurant', 'Birgunj, Parsa, Nepal', 1, 1, 1),
('address', 'Branch Office', 'Kathmandu, Nepal', 0, 2, 1),
('phone', 'Primary Phone', '+977-9765151023', 1, 1, 1),
('phone', 'Secondary Phone', '+977-9845510611', 0, 2, 1),
('phone', 'WhatsApp', '+977-9765151023', 0, 3, 1),
('email', 'General Inquiries', 'info@tasteofterai.com', 1, 1, 1),
('email', 'Online Orders', 'orders@tasteofterai.com', 0, 2, 1),
('email', 'Support', 'support@tasteofterai.com', 0, 3, 1),
('social', 'Facebook', 'https://facebook.com/tasteofterai', 1, 1, 1),
('social', 'Instagram', 'https://instagram.com/tasteofterai', 0, 2, 1),
('social', 'Twitter', 'https://twitter.com/tasteofterai', 0, 3, 1),
('hours', 'Weekdays', '10:00 AM - 10:00 PM', 1, 1, 1),
('hours', 'Weekends', '10:00 AM - 11:00 PM', 0, 2, 1);

-- =====================================================
-- Sample Data: Contact Messages
-- =====================================================
INSERT INTO `contact_messages` (`name`, `email`, `phone`, `subject`, `message`, `status`, `ip_address`) VALUES
('Rajesh Kumar', 'rajesh@example.com', '+977-9845123456', 'Order Inquiry', 'I would like to know if you deliver to the Baneshwor area in Kathmandu?', 'read', '127.0.0.1'),
('Priya Sharma', 'priya@example.com', '+977-9845789012', 'Catering Request', 'We are planning a wedding reception for 200 guests. Do you provide catering services? Please share your catering menu and pricing.', 'replied', '127.0.0.1'),
('Amit Patel', 'amit@example.com', '+977-9801234567', 'Feedback', 'Great food! The biryani is amazing. Will definitely recommend to friends and family.', 'archived', '127.0.0.1'),
('Sita Devi', 'sita@example.com', '+977-9845678901', 'Reservation', 'I want to reserve a table for 6 people on Valentine''s Day. Is advance booking required?', 'unread', '127.0.0.1');

-- =====================================================
-- Finalize: Update auto-increment values
-- =====================================================
ALTER TABLE `users` AUTO_INCREMENT = 100;
ALTER TABLE `categories` AUTO_INCREMENT = 100;
ALTER TABLE `menu_items` AUTO_INCREMENT = 1000;
ALTER TABLE `reservations` AUTO_INCREMENT = 100;
ALTER TABLE `reviews` AUTO_INCREMENT = 100;
ALTER TABLE `contact_info` AUTO_INCREMENT = 100;
ALTER TABLE `contact_messages` AUTO_INCREMENT = 100;

-- =====================================================
-- Completion message
-- =====================================================
SELECT 'Taste Of Terai Database - Created Successfully!' AS Status;
SELECT COUNT(*) AS 'Total Categories' FROM categories;
SELECT COUNT(*) AS 'Total Menu Items' FROM menu_items;
SELECT COUNT(*) AS 'Total Users' FROM users;
