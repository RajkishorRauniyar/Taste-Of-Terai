// ========================================
// Taste Of Terai - MySQL Database Module
// ========================================

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

let pool = null;
let useMySQL = false;

// Database configuration
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
        
        // Import and run schema
        const schema = require('fs').readFileSync(__dirname + '/mysql_schema.sql', 'utf8');
        const statements = schema.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim() && !statement.includes('DROP TABLE IF EXISTS')) {
                try {
                    await connection.query(statement);
                } catch (e) {
                    // Ignore errors for CREATE DATABASE and IF NOT EXISTS
                    if (!e.message.includes('already exists')) {
                        console.log('Schema statement:', statement.substring(0, 50) + '...');
                    }
                }
            }
        }
        
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
    
    updateUser: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        return await mysqlDb.getUserById(id);
    },

    // Categories
    getCategories: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order');
        return rows;
    },
    
    getCategoryById: async (id) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    createCategory: async (category) => {
        if (!useMySQL) return null;
        category.id = uuidv4();
        await pool.query(
            'INSERT INTO categories (id, name, description, image, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [category.id, category.name, category.description, category.image, category.is_active || 1, category.sort_order || 0]
        );
        return category;
    },
    
    updateCategory: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    },
    
    deleteCategory: async (id) => {
        if (!useMySQL) return false;
        await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
        return true;
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
    
    createProduct: async (product) => {
        if (!useMySQL) return null;
        product.id = uuidv4();
        await pool.query(
            'INSERT INTO products (id, name, category_id, description, price, original_price, weight, unit, image, badge, in_stock, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [product.id, product.name, product.category_id, product.description, product.price, product.original_price, product.weight, product.unit, product.image, product.badge, product.in_stock || 1, product.is_featured || 0, product.sort_order || 0]
        );
        return product;
    },
    
    updateProduct: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        return await mysqlDb.getProductById(id);
    },
    
    deleteProduct: async (id) => {
        if (!useMySQL) return false;
        await pool.query('UPDATE products SET in_stock = 0 WHERE id = ?', [id]);
        return true;
    },

    // Customers
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
    
    updateCustomer: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        return await mysqlDb.getCustomerById(id);
    },

    // Orders
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
            'INSERT INTO orders (id, order_number, customer_id, customer_name, customer_phone, customer_email, shipping_address, city, district, subtotal, delivery_charge, total, payment_method, payment_status, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        
        // Add activity log
        await mysqlDb.addActivity({
            action: 'order_created',
            entity_type: 'order',
            entity_id: order.id,
            details: `Order ${order.order_number} created`
        });
        
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
        
        return await mysqlDb.getOrderById(id);
    },

    // Payments
    getPayments: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
        return rows;
    },
    
    createPayment: async (payment) => {
        if (!useMySQL) return null;
        payment.id = uuidv4();
        await pool.query(
            'INSERT INTO payments (id, order_id, amount, method, reference, transaction_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [payment.id, payment.order_id, payment.amount, payment.method, payment.reference, payment.transaction_id, payment.status || 'completed', payment.notes]
        );
        return payment;
    },
    
    updatePayment: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        return payment;
    },

    // Delivery Tracking
    getDeliveryTracking: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM delivery_tracking ORDER BY created_at DESC');
        return rows;
    },
    
    getDeliveryTrackingByOrderId: async (orderId) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM delivery_tracking WHERE order_id = ?', [orderId]);
        return rows[0] || null;
    },
    
    createDeliveryTracking: async (tracking) => {
        if (!useMySQL) return null;
        tracking.id = uuidv4();
        await pool.query(
            'INSERT INTO delivery_tracking (id, order_id, driver_id, driver_name, driver_phone, status, current_location, estimated_arrival, pickup_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [tracking.id, tracking.order_id, tracking.driver_id, tracking.driver_name, tracking.driver_phone, tracking.status || 'pending', tracking.current_location, tracking.estimated_arrival, tracking.pickup_time, tracking.notes]
        );
        return tracking;
    },
    
    updateDeliveryTracking: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE delivery_tracking SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        return tracking;
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

    // Reservations
    getReservations: async () => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC');
        return rows;
    },
    
    getReservationById: async (id) => {
        if (!useMySQL) return null;
        const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    createReservation: async (reservation) => {
        if (!useMySQL) return null;
        reservation.id = uuidv4();
        reservation.status = 'pending';
        await pool.query(
            'INSERT INTO reservations (id, customer_id, guest_name, guest_email, guest_phone, guest_count, reservation_date, reservation_time, table_number, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [reservation.id, reservation.customer_id, reservation.guest_name, reservation.guest_email, reservation.guest_phone, reservation.guest_count, reservation.reservation_date, reservation.reservation_time, reservation.table_number, reservation.special_requests, reservation.status]
        );
        return reservation;
    },
    
    updateReservation: async (id, data) => {
        if (!useMySQL) return null;
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        
        return await mysqlDb.getReservationById(id);
    },
    
    deleteReservation: async (id) => {
        if (!useMySQL) return false;
        await pool.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [id]);
        return true;
    }
};

module.exports = { mysqlDb, initMySQL, useMySQL: () => useMySQL };
