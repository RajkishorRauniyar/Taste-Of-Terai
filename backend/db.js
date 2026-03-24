// ========================================
// Taste Of Terai - Unified Database Helper
// Uses MySQL when available, falls back to JSON
// ========================================

const { dbHelpers, initDatabase } = require('./database');
const { mysqlDb, initMySQL, useMySQL } = require('./mysql-db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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
        return useMySQL();
    },
    
    // Users
    getUsers: async () => {
        if (useMySQL()) {
            return await mysqlDb.getUsers();
        }
        return dbHelpers.getUsers();
    },
    
    getUserById: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.getUserById(id);
        }
        return dbHelpers.getUserById(id);
    },
    
    getUserByEmail: async (email) => {
        if (useMySQL()) {
            return await mysqlDb.getUserByEmail(email);
        }
        return dbHelpers.getUserByEmail(email);
    },
    
    createUser: async (user) => {
        if (useMySQL()) {
            user.password = typeof user.password === 'string' && user.password.length < 60 
                ? bcrypt.hashSync(user.password, 10) 
                : user.password;
            return await mysqlDb.createUser(user);
        }
        return dbHelpers.createUser(user);
    },
    
    updateUser: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateUser(id, data);
        }
        return dbHelpers.updateUser(id, data);
    },

    // Categories
    getCategories: async () => {
        if (useMySQL()) {
            return await mysqlDb.getCategories();
        }
        return dbHelpers.getCategories();
    },
    
    getCategoryById: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.getCategoryById(id);
        }
        return dbHelpers.getCategoryById(id);
    },
    
    createCategory: async (category) => {
        if (useMySQL()) {
            return await mysqlDb.createCategory(category);
        }
        return dbHelpers.createCategory(category);
    },
    
    updateCategory: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateCategory(id, data);
        }
        return dbHelpers.updateCategory(id, data);
    },
    
    deleteCategory: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.deleteCategory(id);
        }
        return dbHelpers.deleteCategory(id);
    },

    // Products
    getProducts: async () => {
        if (useMySQL()) {
            return await mysqlDb.getProducts();
        }
        return dbHelpers.getProducts();
    },
    
    getProductById: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.getProductById(id);
        }
        return dbHelpers.getProductById(id);
    },
    
    createProduct: async (product) => {
        if (useMySQL()) {
            return await mysqlDb.createProduct(product);
        }
        return dbHelpers.createProduct(product);
    },
    
    updateProduct: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateProduct(id, data);
        }
        return dbHelpers.updateProduct(id, data);
    },
    
    deleteProduct: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.deleteProduct(id);
        }
        return dbHelpers.deleteProduct(id);
    },

    // Customers
    getCustomers: async () => {
        if (useMySQL()) {
            const result = await mysqlDb.getCustomers();
            if (result) return result;
        }
        return dbHelpers.getCustomers();
    },
    
    getCustomerById: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.getCustomerById(id);
        }
        return dbHelpers.getCustomerById(id);
    },
    
    getCustomerByPhone: async (phone) => {
        if (useMySQL()) {
            const result = await mysqlDb.getCustomerByPhone(phone);
            if (result) return result;
        }
        return dbHelpers.getCustomerByPhone(phone);
    },
    
    createCustomer: async (customer) => {
        if (useMySQL()) {
            const result = await mysqlDb.createCustomer(customer);
            if (result) return result;
        }
        return dbHelpers.createCustomer(customer);
    },
    
    updateCustomer: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateCustomer(id, data);
        }
        return dbHelpers.updateCustomer(id, data);
    },

    // Orders
    getOrders: async () => {
        if (useMySQL()) {
            const result = await mysqlDb.getOrders();
            if (result) return result;
        }
        return dbHelpers.getOrders();
    },
    
    getOrderById: async (id) => {
        if (useMySQL()) {
            const order = await mysqlDb.getOrderById(id);
            if (order) {
                const items = await mysqlDb.getOrderItems(id);
                order.items = items;
            }
            return order;
        }
        return dbHelpers.getOrderById(id);
    },
    
    getOrderByNumber: async (number) => {
        if (useMySQL()) {
            const order = await mysqlDb.getOrderByNumber(number);
            if (order) {
                const items = await mysqlDb.getOrderItems(order.id);
                order.items = items;
            }
            return order;
        }
        return dbHelpers.getOrderByNumber(number);
    },
    
    createOrder: async (order) => {
        if (useMySQL()) {
            const result = await mysqlDb.createOrder(order);
            if (result) return result;
        }
        return dbHelpers.createOrder(order);
    },
    
    updateOrder: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateOrder(id, data);
        }
        return dbHelpers.updateOrder(id, data);
    },

    // Payments
    getPayments: async () => {
        if (useMySQL()) {
            return await mysqlDb.getPayments();
        }
        return dbHelpers.getPayments();
    },
    
    createPayment: async (payment) => {
        if (useMySQL()) {
            return await mysqlDb.createPayment(payment);
        }
        return dbHelpers.createPayment(payment);
    },
    
    updatePayment: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updatePayment(id, data);
        }
        return dbHelpers.updatePayment(id, data);
    },

    // Delivery Tracking
    getDeliveryTracking: async () => {
        if (useMySQL()) {
            return await mysqlDb.getDeliveryTracking();
        }
        return dbHelpers.getDeliveryTracking();
    },
    
    getDeliveryTrackingByOrderId: async (orderId) => {
        if (useMySQL()) {
            return await mysqlDb.getDeliveryTrackingByOrderId(orderId);
        }
        const tracking = dbHelpers.getDeliveryTracking();
        return tracking.find(t => t.order_id === orderId);
    },
    
    createDeliveryTracking: async (tracking) => {
        if (useMySQL()) {
            return await mysqlDb.createDeliveryTracking(tracking);
        }
        return dbHelpers.createDeliveryTracking(tracking);
    },
    
    updateDeliveryTracking: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateDeliveryTracking(id, data);
        }
        return dbHelpers.updateDeliveryTracking(id, data);
    },

    // Activity Log
    getActivityLog: async () => {
        if (useMySQL()) {
            return await mysqlDb.getActivityLog();
        }
        return dbHelpers.getActivityLog();
    },
    
    addActivity: async (activity) => {
        if (useMySQL()) {
            return await mysqlDb.addActivity(activity);
        }
        return dbHelpers.addActivity(activity);
    },

    // Analytics
    getOrdersByStatus: async () => {
        if (useMySQL()) {
            return await mysqlDb.getOrdersByStatus();
        }
        return dbHelpers.getOrdersByStatus();
    },
    
    getTotalRevenue: async () => {
        if (useMySQL()) {
            return await mysqlDb.getTotalRevenue();
        }
        return dbHelpers.getTotalRevenue();
    },

    // Reservations
    getReservations: async () => {
        if (useMySQL()) {
            return await mysqlDb.getReservations();
        }
        return dbHelpers.getReservations();
    },
    
    getReservationById: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.getReservationById(id);
        }
        return dbHelpers.getReservationById(id);
    },
    
    createReservation: async (reservation) => {
        if (useMySQL()) {
            return await mysqlDb.createReservation(reservation);
        }
        return dbHelpers.createReservation(reservation);
    },
    
    updateReservation: async (id, data) => {
        if (useMySQL()) {
            return await mysqlDb.updateReservation(id, data);
        }
        return dbHelpers.updateReservation(id, data);
    },
    
    deleteReservation: async (id) => {
        if (useMySQL()) {
            return await mysqlDb.deleteReservation(id);
        }
        return dbHelpers.deleteReservation(id);
    }
};

module.exports = { db, initDatabase: db.init, useMySQL: db.isMySQL };
