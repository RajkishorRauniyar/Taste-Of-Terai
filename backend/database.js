// ========================================
// Taste Of Terai - Database Setup (JSON-based)
// ========================================

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'database.json');

// In-memory database
let db = {
    users: [],
    customers: [],
    categories: [],
    products: [],
    orders: [],
    payments: [],
    delivery_tracking: [],
    activity_log: [],
    invitations: [],
    reservations: []
};

// Load database from file
function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            db = JSON.parse(data);
        } else {
            seedInitialData();
            saveDB();
        }
    } catch (error) {
        console.error('Error loading database:', error);
        seedInitialData();
    }
}

// Save database to file
function saveDB() {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Initialize database
function initDatabase() {
    console.log('Initializing database...');
    loadDB();
    console.log('Database initialized successfully');
}

// Seed initial data
function seedInitialData() {
    // Create default admin
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.users.push({
        id: uuidv4(),
        email: 'admin@tasteofterai.com',
        password: hashedPassword,
        name: 'Super Admin',
        phone: '+977-9765151023',
        role: 'super_admin',
        is_active: 1,
        created_at: new Date().toISOString()
    });

    // Seed categories
    const categories = [
        { id: uuidv4(), name: 'Traditional Sweets', description: 'Authentic traditional Nepali sweets', is_active: 1, sort_order: 1 },
        { id: uuidv4(), name: 'Ladoo', description: 'Various types of ladoo', is_active: 1, sort_order: 2 },
        { id: uuidv4(), name: 'Dry Fruits', description: 'Premium dry fruits', is_active: 1, sort_order: 3 },
        { id: uuidv4(), name: 'Premium Sweets', description: 'Premium quality sweets', is_active: 1, sort_order: 4 },
        { id: uuidv4(), name: 'Gift Boxes', description: 'Beautifully packed gift boxes', is_active: 1, sort_order: 5 }
    ];
    db.categories = categories;

    // Seed products
    const products = [
        {
            id: uuidv4(),
            name: 'Khajuri',
            category_id: categories[0].id,
            description: 'Traditional date palm sweet, handcrafted with authentic recipe.',
            price: 500,
            original_price: 600,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400&h=300&fit=crop',
            badge: 'Best Seller',
            in_stock: 1,
            is_featured: 1,
            sort_order: 1,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Thekuwa',
            category_id: categories[0].id,
            description: 'Traditional Nepalese wheat flour sweet with jaggery.',
            price: 500,
            original_price: 600,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
            badge: 'Popular',
            in_stock: 1,
            is_featured: 1,
            sort_order: 2,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Mix Dry Fruits',
            category_id: categories[2].id,
            description: 'Premium mix of almonds, cashews, raisins, walnuts, and apricots.',
            price: 1000,
            original_price: 1200,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1599598425947-730816b1ee3c?w=400&h=300&fit=crop',
            badge: 'Premium',
            in_stock: 1,
            is_featured: 1,
            sort_order: 3,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Mix Dry Fruits Ladoo',
            category_id: categories[1].id,
            description: 'Delicious ladoo made with premium dry fruits, ghee, and jaggery.',
            price: 1100,
            original_price: 1300,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=300&fit=crop',
            badge: 'New',
            in_stock: 1,
            is_featured: 1,
            sort_order: 4,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Besan Laddu',
            category_id: categories[1].id,
            description: 'Classic gram flour laddu with aromatic spices and ghee.',
            price: 450,
            original_price: 500,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1627665460198-2457172596d6?w=400&h=300&fit=crop',
            badge: 'Traditional',
            in_stock: 1,
            is_featured: 0,
            sort_order: 5,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Motichoor Laddu',
            category_id: categories[1].id,
            description: 'Fine gram flour pearls soaked in rose-flavored sugar syrup.',
            price: 550,
            original_price: 650,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1605197136312-dba8b5595f5d?w=400&h=300&fit=crop',
            badge: 'Favorite',
            in_stock: 1,
            is_featured: 1,
            sort_order: 6,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Kaju Katli',
            category_id: categories[3].id,
            description: 'Premium cashew fudge with silver leaf decoration.',
            price: 850,
            original_price: 1000,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1605197136312-dba8b5595f5d?w=400&h=300&fit=crop',
            badge: 'Premium',
            in_stock: 1,
            is_featured: 1,
            sort_order: 7,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Gulab Jamun',
            category_id: categories[0].id,
            description: 'Soft dough balls soaked in rose-flavored sugar syrup.',
            price: 400,
            original_price: 450,
            weight: '500 gm',
            image: 'https://images.unsplash.com/photo-1627665460198-2457172596d6?w=400&h=300&fit=crop',
            badge: 'Popular',
            in_stock: 1,
            is_featured: 0,
            sort_order: 8,
            created_at: new Date().toISOString()
        }
    ];
    db.products = products;

    console.log('Database seeded with initial data');
}

// Database helper functions
const dbHelpers = {
    // Users
    getUsers: () => db.users,
    getUserById: (id) => db.users.find(u => u.id === id),
    getUserByEmail: (email) => db.users.find(u => u.email === email),
    createUser: (user) => {
        user.id = uuidv4();
        user.created_at = new Date().toISOString();
        db.users.push(user);
        saveDB();
        return user;
    },
    updateUser: (id, data) => {
        const index = db.users.findIndex(u => u.id === id);
        if (index !== -1) {
            db.users[index] = { ...db.users[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.users[index];
        }
        return null;
    },

    // Categories
    getCategories: () => db.categories,
    getCategoryById: (id) => db.categories.find(c => c.id === id),
    createCategory: (category) => {
        category.id = uuidv4();
        category.created_at = new Date().toISOString();
        db.categories.push(category);
        saveDB();
        return category;
    },
    updateCategory: (id, data) => {
        const index = db.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            db.categories[index] = { ...db.categories[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.categories[index];
        }
        return null;
    },
    deleteCategory: (id) => {
        const index = db.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            db.categories[index].is_active = 0;
            saveDB();
            return true;
        }
        return false;
    },

    // Products
    getProducts: () => db.products,
    getProductById: (id) => db.products.find(p => p.id === id),
    createProduct: (product) => {
        product.id = uuidv4();
        product.created_at = new Date().toISOString();
        db.products.push(product);
        saveDB();
        return product;
    },
    updateProduct: (id, data) => {
        const index = db.products.findIndex(p => p.id === id);
        if (index !== -1) {
            db.products[index] = { ...db.products[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.products[index];
        }
        return null;
    },
    deleteProduct: (id) => {
        const index = db.products.findIndex(p => p.id === id);
        if (index !== -1) {
            db.products[index].in_stock = 0;
            saveDB();
            return true;
        }
        return false;
    },

    // Customers
    getCustomers: () => db.customers,
    getCustomerById: (id) => db.customers.find(c => c.id === id),
    getCustomerByPhone: (phone) => db.customers.find(c => c.phone === phone),
    createCustomer: (customer) => {
        customer.id = uuidv4();
        customer.created_at = new Date().toISOString();
        db.customers.push(customer);
        saveDB();
        return customer;
    },
    updateCustomer: (id, data) => {
        const index = db.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            db.customers[index] = { ...db.customers[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.customers[index];
        }
        return null;
    },

    // Orders
    getOrders: () => db.orders,
    getOrderById: (id) => db.orders.find(o => o.id === id),
    getOrderByNumber: (number) => db.orders.find(o => o.order_number === number),
    createOrder: (order) => {
        order.id = uuidv4();
        order.order_number = 'TOT-' + Date.now();
        order.created_at = new Date().toISOString();
        order.status = 'pending';
        order.payment_status = 'pending';
        db.orders.push(order);
        saveDB();
        
        // Add status history
        db.activity_log.push({
            id: uuidv4(),
            action: 'order_created',
            entity_type: 'order',
            entity_id: order.id,
            details: `Order ${order.order_number} created`,
            created_at: new Date().toISOString()
        });
        
        return order;
    },
    updateOrder: (id, data) => {
        const index = db.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            db.orders[index] = { ...db.orders[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.orders[index];
        }
        return null;
    },

    // Payments
    getPayments: () => db.payments,
    createPayment: (payment) => {
        payment.id = uuidv4();
        payment.created_at = new Date().toISOString();
        db.payments.push(payment);
        saveDB();
        return payment;
    },
    updatePayment: (id, data) => {
        const index = db.payments.findIndex(p => p.id === id);
        if (index !== -1) {
            db.payments[index] = { ...db.payments[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.payments[index];
        }
        return null;
    },

    // Delivery Tracking
    getDeliveryTracking: () => db.delivery_tracking,
    createDeliveryTracking: (tracking) => {
        tracking.id = uuidv4();
        tracking.created_at = new Date().toISOString();
        db.delivery_tracking.push(tracking);
        saveDB();
        return tracking;
    },
    updateDeliveryTracking: (id, data) => {
        const index = db.delivery_tracking.findIndex(d => d.id === id);
        if (index !== -1) {
            db.delivery_tracking[index] = { ...db.delivery_tracking[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.delivery_tracking[index];
        }
        return null;
    },

    // Activity Log
    getActivityLog: () => db.activity_log,
    addActivity: (activity) => {
        activity.id = uuidv4();
        activity.created_at = new Date().toISOString();
        db.activity_log.push(activity);
        saveDB();
        return activity;
    },

    // Invitations
    getInvitations: () => db.invitations,
    createInvitation: (invitation) => {
        invitation.id = uuidv4();
        invitation.token = uuidv4();
        invitation.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        invitation.created_at = new Date().toISOString();
        db.invitations.push(invitation);
        saveDB();
        return invitation;
    },
    updateInvitation: (id, data) => {
        const index = db.invitations.findIndex(i => i.id === id);
        if (index !== -1) {
            db.invitations[index] = { ...db.invitations[index], ...data };
            saveDB();
            return db.invitations[index];
        }
        return null;
    },

    // Analytics helpers
    getOrdersByStatus: () => {
        const result = {};
        db.orders.forEach(o => {
            result[o.status] = (result[o.status] || 0) + 1;
        });
        return result;
    },
    getTotalRevenue: () => {
        return db.orders
            .filter(o => o.payment_status === 'completed')
            .reduce((sum, o) => sum + (o.total || 0), 0);
    },
    
    // Reservations
    getReservations: () => db.reservations,
    getReservationById: (id) => db.reservations.find(r => r.id === id),
    createReservation: (reservation) => {
        reservation.id = uuidv4();
        reservation.status = 'pending';
        reservation.created_at = new Date().toISOString();
        db.reservations.push(reservation);
        saveDB();
        return reservation;
    },
    updateReservation: (id, data) => {
        const index = db.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
            db.reservations[index] = { ...db.reservations[index], ...data, updated_at: new Date().toISOString() };
            saveDB();
            return db.reservations[index];
        }
        return null;
    },
    deleteReservation: (id) => {
        const index = db.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
            db.reservations[index].status = 'cancelled';
            saveDB();
            return true;
        }
        return false;
    },

};

module.exports = { db, dbHelpers, initDatabase };
