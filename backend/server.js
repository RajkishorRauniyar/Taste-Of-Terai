// ========================================
// Taste Of Terai - Complete Backend Server
// ========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');

const { db, initDatabase, useMySQL } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'taste-of-terai-secret-key-2024';

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Socket.IO setup
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please either:\n` +
            `1. Close the other process using port ${PORT}\n` +
            `2. Use a different port: set PORT=3001 npm start`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-admin', (userId) => {
        socket.join('admin-room');
    });
    
    socket.on('join-delivery', (driverId) => {
        socket.join(`driver-${driverId}`);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.set('io', io);

// Initialize database
async function initializeDatabases() {
    console.log('Initializing databases...');
    await db.init();
    console.log('Database initialization complete');
}

// Run initialization
initializeDatabases().catch(err => console.error('Database initialization error:', err));

// Role hierarchy
const roleHierarchy = {
    'super_admin': 4,
    'admin': 3,
    'manager': 2,
    'order_coordinator': 1,
    'delivery': 0
};

function hasRoleAccess(userRole, requiredRole) {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// ========================================
// Authentication Middleware
// ========================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

// ========================================
// Auth Routes
// ========================================

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const user = await db.getUserByEmail(email);
        
        if (!user || !bcrypt.compareSync(password, user.password) || !user.is_active) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        await db.updateUser(user.id, { last_login: new Date().toISOString() });
        
        await db.addActivity({
            user_id: user.id,
            action: 'login',
            entity_type: 'user',
            ip_address: req.ip
        });
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/register', authenticateToken, requireRole('super_admin'), (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name required' });
        }
        
        if (!hasRoleAccess(req.user.role, role)) {
            return res.status(403).json({ error: 'Cannot create user with higher or equal role' });
        }
        
        const existing = dbHelpers.getUserByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = dbHelpers.createUser({
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
            role: role || 'delivery',
            is_active: 1
        });
        
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/change-password', authenticateToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = dbHelpers.getUserById(req.user.id);
        
        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        dbHelpers.updateUser(req.user.id, { password: hashedPassword });
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = dbHelpers.getUserById(req.user.id);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// ========================================
// Users Routes
// ========================================

app.get('/api/users', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const users = await db.getUsers();
        const result = users.map(u => {
            const { password, ...user } = u;
            return user;
        });
        res.json(result);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users/delivery', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator'), async (req, res) => {
    try {
        const users = await db.getUsers();
        const drivers = users
            .filter(u => u.role === 'delivery' && u.is_active)
            .map(u => ({ id: u.id, name: u.name, phone: u.phone, is_active: u.is_active, last_login: u.last_login }));
        res.json(drivers);
    } catch (error) {
        console.error('Get delivery users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/users/:id', authenticateToken, requireRole('super_admin'), (req, res) => {
    if (req.user.id === req.params.id) {
        return res.status(400).json({ error: 'Cannot deactivate yourself' });
    }
    dbHelpers.updateUser(req.params.id, { is_active: 0 });
    res.json({ message: 'User deactivated successfully' });
});

// ========================================
// Categories Routes
// ========================================

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.getCategories();
        const products = await db.getProducts();
        
        const result = categories
            .filter(c => c.is_active)
            .map(c => ({
                ...c,
                product_count: products.filter(p => p.category_id === c.id).length
            }));
        res.json(result);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/categories', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const categories = await db.getCategories();
        const products = await db.getProducts();
        
        const result = categories.map(c => ({
            ...c,
            product_count: products.filter(p => p.category_id === c.id).length
        }));
        res.json(result);
    } catch (error) {
        console.error('Get admin categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/categories', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { name, description, image } = req.body;
    const category = dbHelpers.createCategory({
        name,
        description: description || null,
        image: image || null,
        is_active: 1,
        sort_order: dbHelpers.getCategories().length + 1
    });
    res.status(201).json({ message: 'Category created', id: category.id });
});

app.put('/api/categories/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { name, description, image, is_active, sort_order } = req.body;
    dbHelpers.updateCategory(req.params.id, { name, description, image, is_active, sort_order });
    res.json({ message: 'Category updated' });
});

app.delete('/api/categories/:id', authenticateToken, requireRole('super_admin', 'admin'), (req, res) => {
    dbHelpers.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
});

// ========================================
// Products Routes
// ========================================

app.get('/api/products', async (req, res) => {
    try {
        const { category, featured, search, limit, offset } = req.query;
        
        let products = await db.getProducts();
        const categories = await db.getCategories();
        
        if (category && category !== 'all') {
            const cat = categories.find(c => c.name === category);
            if (cat) products = products.filter(p => p.category_id === cat.id);
        }
        
        if (featured === 'true') {
            products = products.filter(p => p.is_featured);
        }
        
        if (search) {
            const s = search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(s) || 
                (p.description && p.description.toLowerCase().includes(s))
            );
        }
        
        const start = parseInt(offset) || 0;
        const end = start + (parseInt(limit) || 50);
        
        products = products.slice(start, end).map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return { ...p, category_name: cat ? cat.name : null };
        });
        
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/products', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const products = await db.getProducts();
        const categories = await db.getCategories();
        
        const result = products.map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return { ...p, category_name: cat ? cat.name : null };
        });
        res.json(result);
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await db.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const categories = await db.getCategories();
        const cat = categories.find(c => c.id === product.category_id);
        res.json({ ...product, category_name: cat ? cat.name : null });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/products', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { name, category_id, description, price, original_price, weight, unit, image, badge, in_stock, is_featured } = req.body;
    
    const product = dbHelpers.createProduct({
        name,
        category_id: category_id || null,
        description: description || null,
        price,
        original_price: original_price || null,
        weight: weight || null,
        unit: unit || 'piece',
        image: image || null,
        badge: badge || null,
        in_stock: in_stock !== false ? 1 : 0,
        is_featured: is_featured ? 1 : 0,
        sort_order: dbHelpers.getProducts().length + 1
    });
    
    res.status(201).json({ message: 'Product created', id: product.id });
});

app.put('/api/products/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { name, category_id, description, price, original_price, weight, unit, image, badge, in_stock, is_featured, sort_order } = req.body;
    
    dbHelpers.updateProduct(req.params.id, {
        name, category_id, description, price, original_price,
        weight, unit, image, badge,
        in_stock: in_stock ? 1 : 0,
        is_featured: is_featured ? 1 : 0,
        sort_order
    });
    
    res.json({ message: 'Product updated' });
});

app.delete('/api/products/:id', authenticateToken, requireRole('super_admin', 'admin'), (req, res) => {
    dbHelpers.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted' });
});

// ========================================
// Orders Routes
// ========================================

app.get('/api/orders', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator'), async (req, res) => {
    try {
        const { status, payment_status, search } = req.query;
        
        let orders = await db.getOrders();
        
        if (status && status !== 'all') {
            orders = orders.filter(o => o.status === status);
        }
        
        if (payment_status && payment_status !== 'all') {
            orders = orders.filter(o => o.payment_status === payment_status);
        }
        
        if (search) {
            const s = search.toLowerCase();
            orders = orders.filter(o => 
                o.order_number.toLowerCase().includes(s) ||
                o.customer_name.toLowerCase().includes(s) ||
                (o.customer_phone && o.customer_phone.includes(s))
            );
        }
        
        orders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
        const order = await db.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        console.log('Creating order:', JSON.stringify(req.body));
        const { customer, items, shipping_address, city, district, payment_method, notes, subtotal, delivery_charge, total } = req.body;
        
        if (!customer || !items || !shipping_address) {
            return res.status(400).json({ error: 'Customer, items and shipping address required' });
        }
        
        // Find or create customer
        let customerData = await db.getCustomerByPhone(customer.phone);
        
        if (!customerData) {
            customerData = await db.createCustomer({
                name: customer.name,
                email: customer.email || null,
                phone: customer.phone,
                address: customer.address || null,
                city: city || null,
                district: district || null
            });
            console.log('Created new customer:', customerData.id);
        }
        
        // Calculate totals if not provided
        let orderSubtotal = subtotal;
        let orderDeliveryCharge = delivery_charge;
        let orderTotal = total;
        
        if (!orderSubtotal || !orderTotal) {
            orderSubtotal = 0;
            items.forEach(item => {
                orderSubtotal += (item.price || 0) * (item.quantity || 1);
            });
            orderDeliveryCharge = (district === 'Kathmandu' || district === 'Lalitpur') ? 0 : 100;
            orderTotal = orderSubtotal + orderDeliveryCharge;
        }
        
        const order = await db.createOrder({
            customer_id: customerData.id,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_email: customer.email || null,
            shipping_address,
            city: city || null,
            district: district || null,
            subtotal: orderSubtotal,
            delivery_charge: orderDeliveryCharge || 0,
            total: orderTotal,
            items: items,
            payment_method: payment_method || 'cash',
            notes: notes || null
        });
        
        console.log('Order created successfully:', order.order_number);
        
        // Notify admins via WebSocket
        io.to('admin-room').emit('new-order', { 
            id: order.id, 
            orderNumber: order.order_number, 
            total: orderTotal, 
            customer: customer.name 
        });
        
        res.status(201).json({ message: 'Order created', orderId: order.id, orderNumber: order.order_number });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

app.put('/api/orders/:id/status', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const order = await db.updateOrder(req.params.id, { status });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Update delivery tracking if delivered
        if (status === 'delivered') {
            const tracking = await db.getDeliveryTrackingByOrderId(req.params.id);
            if (tracking) {
                await db.updateDeliveryTracking(tracking.id, { 
                    status: 'delivered', 
                    delivery_time: new Date().toISOString() 
                });
            }
            
            if (order.payment_method === 'cash') {
                await db.updateOrder(req.params.id, { payment_status: 'completed' });
            }
        }
        
        io.emit('order-status-updated', { orderId: req.params.id, status });
        
        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/orders/:id/assign', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator'), (req, res) => {
    const { driver_id } = req.body;
    
    const driver = dbHelpers.getUserById(driver_id);
    
    if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    
    dbHelpers.updateOrder(req.params.id, { 
        assigned_to: driver_id, 
        status: 'out_for_delivery' 
    });
    
    // Create or update delivery tracking
    let tracking = dbHelpers.getDeliveryTracking().find(t => t.order_id === req.params.id);
    
    if (tracking) {
        dbHelpers.updateDeliveryTracking(tracking.id, {
            driver_id,
            driver_name: driver.name,
            driver_phone: driver.phone,
            status: 'in_transit',
            pickup_time: new Date().toISOString()
        });
    } else {
        tracking = dbHelpers.createDeliveryTracking({
            order_id: req.params.id,
            driver_id,
            driver_name: driver.name,
            driver_phone: driver.phone,
            status: 'in_transit',
            pickup_time: new Date().toISOString()
        });
    }
    
    io.to(`driver-${driver_id}`).emit('new-delivery', { orderId: req.params.id });
    
    res.json({ message: 'Order assigned to driver' });
});

// ========================================
// Customers Routes
// ========================================

app.get('/api/customers', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator'), async (req, res) => {
    try {
        const { search } = req.query;
        
        let customers = await db.getCustomers();
        const orders = await db.getOrders();
        
        if (search) {
            const s = search.toLowerCase();
            customers = customers.filter(c => 
                c.name.toLowerCase().includes(s) || 
                c.phone.includes(s) ||
                (c.email && c.email.toLowerCase().includes(s))
            );
        }
        
        // Add order counts and total spent
        customers = customers.map(c => {
            const customerOrders = orders.filter(o => o.customer_id === c.id);
            const orderCount = customerOrders.length;
            const totalSpent = customerOrders
                .filter(o => o.payment_status === 'completed')
                .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            
            return { ...c, order_count: orderCount, total_spent: totalSpent };
        });
        
        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/customers/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator'), async (req, res) => {
    try {
        const customer = await db.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const orders = await db.getOrders();
        const customerOrders = orders
            .filter(o => o.customer_id === req.params.id)
            .map(o => ({ id: o.id, order_number: o.order_number, total: o.total, status: o.status, payment_status: o.payment_status, created_at: o.created_at }));
        
        res.json({ ...customer, orders: customerOrders });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// Delivery Routes
// ========================================

app.get('/api/delivery/tracking', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'order_coordinator', 'delivery'), (req, res) => {
    const { driver_id, status } = req.query;
    
    let tracking = dbHelpers.getDeliveryTracking();
    
    if (driver_id) {
        tracking = tracking.filter(t => t.driver_id === driver_id);
    }
    
    if (status) {
        tracking = tracking.filter(t => t.status === status);
    }
    
    // Add order details
    tracking = tracking.map(t => {
        const order = dbHelpers.getOrderById(t.order_id);
        return {
            ...t,
            order_number: order ? order.order_number : 'N/A',
            customer_name: order ? order.customer_name : 'N/A',
            customer_phone: order ? order.customer_phone : 'N/A',
            shipping_address: order ? order.shipping_address : 'N/A',
            total: order ? order.total : 0
        };
    });
    
    res.json(tracking);
});

app.get('/api/delivery/my-deliveries', authenticateToken, requireRole('delivery'), (req, res) => {
    const tracking = dbHelpers.getDeliveryTracking()
        .filter(t => t.driver_id === req.user.id)
        .map(t => {
            const order = dbHelpers.getOrderById(t.order_id);
            return {
                ...t,
                order_number: order ? order.order_number : 'N/A',
                customer_name: order ? order.customer_name : 'N/A',
                customer_phone: order ? order.customer_phone : 'N/A',
                shipping_address: order ? order.shipping_address : 'N/A',
                total: order ? order.total : 0
            };
        });
    
    res.json(tracking);
});

app.put('/api/delivery/:orderId/update', authenticateToken, requireRole('delivery'), (req, res) => {
    const { status, current_location, estimated_arrival, notes } = req.body;
    
    const tracking = dbHelpers.getDeliveryTracking().find(t => t.order_id === req.params.orderId && t.driver_id === req.user.id);
    
    if (!tracking) {
        return res.status(404).json({ error: 'Delivery not found' });
    }
    
    dbHelpers.updateDeliveryTracking(tracking.id, { status, current_location, estimated_arrival, notes });
    
    if (status === 'delivered') {
        dbHelpers.updateOrder(req.params.orderId, { status: 'delivered', payment_status: 'completed' });
    }
    
    io.to('admin-room').emit('delivery-updated', { orderId: req.params.orderId, status });
    
    res.json({ message: 'Delivery updated' });
});

// ========================================
// Payments Routes
// ========================================

app.get('/api/payments', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const payments = dbHelpers.getPayments().map(p => {
        const order = dbHelpers.getOrderById(p.order_id);
        return {
            ...p,
            order_number: order ? order.order_number : 'N/A',
            customer_name: order ? order.customer_name : 'N/A'
        };
    });
    res.json(payments);
});

app.post('/api/payments', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { order_id, amount, method, reference, transaction_id, notes } = req.body;
    
    const payment = dbHelpers.createPayment({
        order_id,
        amount,
        method,
        reference: reference || null,
        transaction_id: transaction_id || null,
        status: 'completed',
        notes: notes || null
    });
    
    dbHelpers.updateOrder(order_id, { payment_status: 'completed', payment_reference: transaction_id || reference });
    
    res.status(201).json({ message: 'Payment recorded', id: payment.id });
});

app.post('/api/payments/:id/refund', authenticateToken, requireRole('super_admin', 'admin'), (req, res) => {
    const { reason } = req.body;
    
    const payments = dbHelpers.getPayments();
    const payment = payments.find(p => p.id === req.params.id);
    
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status === 'refunded') {
        return res.status(400).json({ error: 'Payment already refunded' });
    }
    
    dbHelpers.updatePayment(req.params.id, { 
        status: 'refunded', 
        notes: `Refunded: ${reason}` 
    });
    
    dbHelpers.updateOrder(payment.order_id, { payment_status: 'refunded' });
    
    res.json({ message: 'Payment refunded' });
});

// ========================================
// Analytics Routes
// ========================================

app.get('/api/analytics/overview', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const { period } = req.query;
        
        let orders = await db.getOrders();
        const customers = await db.getCustomers();
        
        const now = new Date();
        let startDate = new Date(0);
        
        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'month') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (period === 'year') {
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }
        
        orders = orders.filter(o => new Date(o.created_at) >= startDate);
        
        const revenue = orders
            .filter(o => o.payment_status === 'completed')
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        
        const avgOrder = orders.length > 0 ? revenue / orders.length : 0;
        
        const newCustomers = customers.filter(c => new Date(c.created_at) >= startDate).length;
        
        const allOrders = await db.getOrders();
        const pendingOrders = allOrders.filter(o => 
            ['pending', 'confirmed', 'preparing'].includes(o.status)
        ).length;
        
        res.json({
            revenue,
            totalOrders: orders.length,
            averageOrderValue: avgOrder,
            newCustomers,
            pendingOrders
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/analytics/revenue', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const orders = await db.getOrders();
        const completedOrders = orders.filter(o => o.payment_status === 'completed');
        
        // Group by month
        const monthly = {};
        completedOrders.forEach(o => {
            const date = new Date(o.created_at);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthly[month]) {
                monthly[month] = { period: month, revenue: 0, orders: 0 };
            }
            monthly[month].revenue += parseFloat(o.total) || 0;
            monthly[month].orders += 1;
        });
        
        res.json(Object.values(monthly).sort((a, b) => a.period.localeCompare(b.period)));
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/analytics/popular-items', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const orders = await db.getOrders();
        const items = {};
        
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (!items[item.name]) {
                        items[item.name] = { product_name: item.name, total_sold: 0, revenue: 0 };
                    }
                    items[item.name].total_sold += item.quantity || 1;
                    items[item.name].revenue += (item.price || 0) * (item.quantity || 1);
                });
            }
        });
        
        res.json(Object.values(items).sort((a, b) => b.total_sold - a.total_sold).slice(0, 10));
    } catch (error) {
        console.error('Get popular items error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/analytics/peak-hours', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const orders = await db.getOrders();
        const hours = Array(24).fill(0);
        
        orders.forEach(order => {
            const hour = new Date(order.created_at).getHours();
            hours[hour]++;
        });
        
        const result = hours.map((count, hour) => ({ hour: String(hour).padStart(2, '0'), orders: count }));
        res.json(result);
    } catch (error) {
        console.error('Get peak hours error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/analytics/orders-by-status', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
    try {
        const ordersByStatus = await db.getOrdersByStatus();
        const orders = await db.getOrders();
        
        const result = Object.entries(ordersByStatus).map(([status, count]) => {
            const statusOrders = orders.filter(o => o.status === status);
            const revenue = statusOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            return { status, count, revenue };
        });
        res.json(result);
    } catch (error) {
        console.error('Get orders by status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// Activity Log Routes
// ========================================

app.get('/api/activity-log', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
    try {
        const { limit } = req.query;
        const logs = await db.getActivityLog();
        const users = await db.getUsers();
        
        const logsWithUsers = logs.map(l => {
            const user = users.find(u => u.id === l.user_id);
            return {
                ...l,
                user_name: user ? user.name : 'System'
            };
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json(logsWithUsers.slice(0, parseInt(limit) || 100));
    } catch (error) {
        console.error('Get activity log error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// Reservations Routes
// ========================================

// Get all reservations (admin)
app.get('/api/admin/reservations', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { status, date } = req.query;
    let reservations = dbHelpers.getReservations();
    
    if (status && status !== 'all') {
        reservations = reservations.filter(r => r.status === status);
    }
    
    if (date) {
        reservations = reservations.filter(r => r.reservation_date === date);
    }
    
    res.json(reservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

// Get single reservation
app.get('/api/admin/reservations/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const reservation = dbHelpers.getReservationById(req.params.id);
    if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
});

// Create reservation (public endpoint for customers)
app.post('/api/reservations', (req, res) => {
    const { guest_name, guest_email, guest_phone, guest_count, reservation_date, reservation_time, special_requests } = req.body;
    
    if (!guest_name || !guest_email || !guest_phone || !reservation_date || !reservation_time || !guest_count) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    const reservation = {
        guest_name,
        guest_email,
        guest_phone,
        guest_count: parseInt(guest_count),
        reservation_date,
        reservation_time,
        special_requests: special_requests || '',
        table_number: null
    };
    
    const created = dbHelpers.createReservation(reservation);
    res.status(201).json(created);
});

// Update reservation status
app.put('/api/admin/reservations/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
    const { status, table_number } = req.body;
    const reservation = dbHelpers.getReservationById(req.params.id);
    
    if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
    }
    
    const updated = dbHelpers.updateReservation(req.params.id, { status, table_number });
    
    // Log activity
    dbHelpers.addActivity({
        user_id: req.user.id,
        action: 'reservation_updated',
        details: `Updated reservation for ${reservation.guest_name} - Status: ${status}`
    });
    
    res.json(updated);
});

// Delete/cancel reservation
app.delete('/api/admin/reservations/:id', authenticateToken, requireRole('super_admin', 'admin'), (req, res) => {
    const reservation = dbHelpers.getReservationById(req.params.id);
    
    if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
    }
    
    dbHelpers.deleteReservation(req.params.id);
    
    // Log activity
    dbHelpers.addActivity({
        user_id: req.user.id,
        action: 'reservation_cancelled',
        details: `Cancelled reservation for ${reservation.guest_name}`
    });
    
    res.json({ message: 'Reservation cancelled successfully' });
});

// ========================================
// Public Routes
// ========================================

app.get('/api/public/products', (req, res) => {
    const products = dbHelpers.getProducts()
        .filter(p => p.in_stock)
        .map(p => ({
            id: p.id,
            name: p.name,
            category_id: p.category_id,
            description: p.description,
            price: p.price,
            original_price: p.original_price,
            weight: p.weight,
            unit: p.unit,
            image: p.image,
            badge: p.badge,
            in_stock: p.in_stock,
            is_featured: p.is_featured
        }));
    res.json(products);
});

// ========================================
// Serve Frontend
// ========================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

console.log(`Server running on http://localhost:${PORT}`);
console.log(`API available at http://localhost:${PORT}/api`);
console.log(`Admin panel at http://localhost:${PORT}/admin.html`);

module.exports = app;
