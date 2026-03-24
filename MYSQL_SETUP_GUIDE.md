# Complete MySQL Database Connection Guide for Taste Of Terai

This guide will help you connect your Node.js backend to a MySQL database.

## Prerequisites

1. **MySQL Server Installed** - Make sure you have MySQL installed on your system
2. **Node.js** - Ensure Node.js is installed
3. **Access to MySQL** - You need MySQL credentials (username/password)

---

## Step 1: Install MySQL Driver Package

The mysql2 package is already added to your `backend/package.json`. If not, install it:

```bash
cd backend
npm install mysql2
```

---

## Step 2: Configure Environment Variables

Edit the `.env` file in the project root to add your MySQL credentials:

```env
# Server Configuration
PORT=3000

# JWT Secret
JWT_SECRET=taste-of-terai-secret-key-2024

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taste_of_terai

# Use JSON database fallback if MySQL connection fails
USE_JSON_FALLBACK=true
```

**Important**: Replace `your_mysql_password` with your actual MySQL password.

---

## Step 3: Create the MySQL Database

Open MySQL (via command line or workbench) and run:

```sql
CREATE DATABASE IF NOT EXISTS taste_of_terai;
USE taste_of_terai;
```

---

## Step 4: Import the Database Schema

I've already created the schema file at [`backend/mysql_schema.sql`](backend/mysql_schema.sql). Import it:

```bash
mysql -u root -p taste_of_terai < backend/mysql_schema.sql
```

Or copy the SQL from `backend/mysql_schema.sql` and run it in MySQL Workbench/phpMyAdmin.

---

## Step 5: Database Connection Module

I've already created [`backend/mysql-db.js`](backend/mysql-db.js) which contains:

### Complete MySQL Database Module

```javascript
// backend/mysql-db.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

let pool = null;
let useMySQL = false;

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taste_of_terai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Initialize MySQL connection pool
async function initMySQL() {
    try {
        console.log('Attempting to connect to MySQL...');
        pool = mysql.createPool(dbConfig);
        
        // Test the connection
        const connection = await pool.getConnection();
        console.log('MySQL connected successfully!');
        
        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await connection.query(`USE \`${dbConfig.database}\``);
        
        connection.release();
        useMySQL = true;
        console.log('MySQL database initialized!');
        return true;
    } catch (error) {
        console.error('MySQL connection failed:', error.message);
        console.log('Falling back to JSON database...');
        useMySQL = false;
        return false;
    }
}

// Check if MySQL is being used
function isMySQL() {
    return useMySQL;
}

// ========================================
// MySQL Database Helper Functions
// ========================================

const mysqlDb = {
    // Users
    getUsers: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM users WHERE is_active = 1');
        return rows;
    },
    
    getUserById: async (id) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    getUserByEmail: async (email) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },
    
    createUser: async (user) => {
        if (!useMySQL) return null;
        user.id = user.id || uuidv4();
        await pool.query(
            'INSERT INTO users (id, email, password, name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user.id, user.email, user.password, user.name, user.phone, user.role || 'delivery', user.is_active || 1]
        );
        return user;
    },
    
    // Customers - Complete implementation
    getCustomers: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
        return rows;
    },
    
    getCustomerById: async (id) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    getCustomerByPhone: async (phone) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
        return rows[0] || null;
    },
    
    createCustomer: async (customer) => {
        if (!useMySQL) return null;
        customer.id = uuidv4();
        await pool.query(
            'INSERT INTO customers (id, name, email, phone, address, city, district) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customer.id, customer.name, customer.email, customer.phone, customer.address, customer.city, customer.district]
        );
        return customer;
    },
    
    // Orders - Complete implementation
    getOrders: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        return rows;
    },
    
    getOrderById: async (id) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    getOrderByNumber: async (number) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM orders WHERE order_number = ?', [number]);
        return rows[0] || null;
    },
    
    getOrderItems: async (orderId) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        return rows;
    },
    
    createOrder: async (order) => {
        if (!useMySQL) return null;
        order.id = uuidv4();
        order.order_number = 'TOT-' + Date.now();
        order.status = 'pending';
        order.payment_status = 'pending';
        
        await pool.query(
            'INSERT INTO orders (id, order_number, customer_id, customer_name, customer_phone, customer_email, shipping_address, city, district, subtotal, delivery_charge, total, payment_method, payment_status, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order.id, order.order_number, order.customer_id, order.customer_name, order.customer_phone, order.customer_email, order.shipping_address, order.city, order.district, order.subtotal, order.delivery_charge, order.total, order.payment_method || 'cash', order.payment_status, order.status, order.notes]
        );
        
        // Insert order items
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                const itemId = uuidv4();
                await pool.query(
                    'INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [itemId, order.id, item.id || null, item.name, item.price, item.quantity, item.price * item.quantity]
                );
            }
        }
        
        return order;
    },
    
    updateOrder: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id' && key !== 'items') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        return rows[0];
    },
    
    // Products
    getProducts: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM products WHERE in_stock = 1 ORDER BY sort_order');
        return rows;
    },
    
    getProductById: async (id) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    // Categories
    getCategories: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order');
        return rows;
    },
    
    // Analytics
    getOrdersByStatus: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');
        const result = {};
        rows.forEach(row => {
            result[row.status] = row.count;
        });
        return result;
    },
    
    getTotalRevenue: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE payment_status = 'completed'");
        return rows[0].revenue;
    },
    
    // Activity Log
    getActivityLog: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100');
        return rows;
    },
    
    addActivity: async (activity) => {
        if (!useMySQL) return null;
        activity.id = uuidv4();
        await pool.query(
            'INSERT INTO activity_log (id, user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [activity.id, activity.user_id, activity.action, activity.entity_type, activity.entity_id, activity.details, activity.ip_address]
        );
        return activity;
    }
};

module.exports = { mysqlDb, initMySQL, isMySQL };
```

---

## Step 6: Database Wrapper (Handles Fallback)

I've already created [`backend/db.js`](backend/db.js) which automatically uses MySQL when available and falls back to JSON:

```javascript
// backend/db.js - Key Functions

const { dbHelpers, initDatabase } = require('./database');
const { mysqlDb, initMySQL, isMySQL } = require('./mysql-db');

// Wrapper that uses MySQL when available, JSON otherwise
const db = {
    // Initialize both databases
    async init() {
        initDatabase();
        await initMySQL();
        console.log('Database initialization complete');
    },
    
    // Check if MySQL is being used
    isMySQL() {
        return isMySQL();
    },
    
    // Example: getCustomers with fallback
    getCustomers: async () => {
        if (isMySQL()) {
            const result = await mysqlDb.getCustomers();
            if (result) return result;
        }
        return dbHelpers.getCustomers();
    },
    
    // Example: createOrder with fallback
    createOrder: async (order) => {
        if (isMySQL()) {
            const result = await mysqlDb.createOrder(order);
            if (result) return result;
        }
        return dbHelpers.createOrder(order);
    },
    
    // Similar pattern for all other functions...
};

module.exports = { db, initDatabase: db.init, isMySQL: db.isMySQL };
```

---

## Step 7: Server Integration

Your [`backend/server.js`](backend/server.js) should use the unified db wrapper:

```javascript
// At the top of server.js
const { db, initDatabase, isMySQL } = require('./db');

// Database initialization
async function initializeDatabases() {
    console.log('Initializing databases...');
    await db.init();
    console.log('Database initialization complete');
}

initializeDatabases().catch(err => console.error('Database initialization error:', err));
```

---

## Step 8: Testing the Connection

### Test 1: Check if MySQL connects
```bash
cd backend
node -e "const { initMySQL } = require('./mysql-db'); initMySQL().then(r => console.log('Connected:', r)).catch(e => console.error(e));"
```

### Test 2: Test the API
```bash
curl http://localhost:3000/api/products
```

---

## Step 9: Database Schema (Tables)

The complete schema is in [`backend/mysql_schema.sql`](backend/mysql_schema.sql). Key tables:

### Users Table
```sql
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `role` ENUM('super_admin', 'admin', 'manager', 'order_coordinator', 'delivery') DEFAULT 'delivery',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Customers Table
```sql
CREATE TABLE `customers` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100),
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `address` TEXT,
    `city` VARCHAR(50),
    `district` VARCHAR(50),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE `orders` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `customer_id` VARCHAR(36),
    `customer_name` VARCHAR(100) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    `delivery_charge` DECIMAL(10,2) DEFAULT 0,
    `total` DECIMAL(10,2) NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'cash',
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE `order_items` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `order_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36),
    `product_name` VARCHAR(150) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL
);
```

---

## Step 10: Starting the Server

Run the server:
```bash
cd backend
node server.js
```

Or use the provided script:
```bash
run-server.bat
```

---

## Summary

1. ✅ Install mysql2 package (done)
2. ✅ Configure .env with MySQL credentials
3. ✅ Create database in MySQL
4. ✅ Import schema from mysql_schema.sql
5. ✅ Use mysql-db.js for MySQL operations
6. ✅ Use db.js wrapper for automatic fallback
7. ✅ Server automatically uses MySQL when available

The system will work with JSON database if MySQL is not configured, ensuring your orders are still saved!
