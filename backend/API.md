# Taste Of Terai - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Roles & Permissions
| Role | Description |
|------|-------------|
| `super_admin` | Full access to all features |
| `admin` | Can manage all resources |
| `manager` | Can manage products, orders, customers |
| `order_coordinator` | Can manage orders |
| `delivery` | Can view and update delivery assignments |

---

## Authentication Endpoints

### POST /api/auth/login
Login to the admin panel.

**Request:**
```json
{
  "email": "admin@tasteofterai.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "...",
    "email": "admin@tasteofterai.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

### POST /api/auth/register
Register a new team member (super_admin only).

**Request:**
```json
{
  "email": "manager@tasteofterai.com",
  "password": "securepassword",
  "name": "John Manager",
  "phone": "+977-9876543210",
  "role": "manager"
}
```

### POST /api/auth/change-password
Change current user's password.

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### GET /api/auth/me
Get current authenticated user info.

---

## Users Management

### GET /api/users
Get all team members (admin+).

### GET /api/users/:id
Get user by ID.

### PUT /api/users/:id
Update user details.

### DELETE /api/users/:id
Deactivate a user (super_admin only).

### GET /api/users/delivery
Get all active delivery personnel.

### POST /api/users/invite
Invite a new team member via email (admin+).

### GET /api/invitations
Get all pending invitations.

---

## Products

### GET /api/products
Get all products (public).

**Query Parameters:**
- `category` - Filter by category name
- `featured` - Get featured products only
- `search` - Search products
- `limit` - Number of results
- `offset` - Pagination offset

### GET /api/admin/products
Get all products with admin details (admin+).

### GET /api/products/:id
Get single product details.

### POST /api/products
Create new product (admin+).

**Request:**
```json
{
  "name": "New Product",
  "category_id": "category-uuid",
  "description": "Product description",
  "price": 500,
  "original_price": 600,
  "weight": "500 gm",
  "image": "https://...",
  "badge": "Best Seller",
  "in_stock": true,
  "is_featured": true
}
```

### PUT /api/products/:id
Update product.

### DELETE /api/products/:id
Delete (deactivate) product.

### GET /api/products/:id/variants
Get product variants.

### POST /api/products/:id/variants
Add variant to product.

---

## Categories

### GET /api/categories
Get all active categories (public).

### GET /api/admin/categories
Get all categories with counts (admin+).

### POST /api/categories
Create category (admin+).

### PUT /api/categories/:id
Update category.

### DELETE /api/categories/:id
Deactivate category.

---

## Orders

### GET /api/orders
Get all orders (admin+).

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)
- `payment_status` - Filter by payment status
- `date_from` - Start date
- `date_to` - End date
- `search` - Search by order number, customer name, phone

### GET /api/orders/:id
Get order details with items and status history.

### POST /api/orders
Create new order (public - for customers).

**Request:**
```json
{
  "customer": {
    "name": "Customer Name",
    "phone": "+977-98xxxxxxx",
    "email": "customer@email.com"
  },
  "items": [
    {
      "product_id": "uuid",
      "name": "Product Name",
      "price": 500,
      "quantity": 2
    }
  ],
  "shipping_address": "Full address",
  "city": "Kathmandu",
  "district": "Kathmandu",
  "payment_method": "cash",
  "notes": "Special instructions"
}
```

### PUT /api/orders/:id/status
Update order status (admin+).

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed"
}
```

Valid statuses: `pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`

### PUT /api/orders/:id/assign
Assign order to delivery driver.

**Request:**
```json
{
  "driver_id": "driver-uuid"
}
```

---

## Customers

### GET /api/customers
Get all customers (admin+).

### GET /api/customers/:id
Get customer with order history.

### PUT /api/customers/:id
Update customer details.

---

## Delivery

### GET /api/delivery/tracking
Get all delivery tracking info (admin+).

**Query Parameters:**
- `driver_id` - Filter by driver
- `status` - Filter by status

### GET /api/delivery/my-deliveries
Get current driver's deliveries.

### PUT /api/delivery/:orderId/update
Update delivery status (driver).

**Request:**
```json
{
  "status": "in_transit",
  "current_location": "Location name",
  "estimated_arrival": "2024-01-15T14:00:00Z",
  "notes": "Delivery notes"
}
```

---

## Payments

### GET /api/payments
Get all payments (admin+).

### POST /api/payments
Record a payment (admin+).

### POST /api/payments/:id/refund
Refund a payment (admin+).

---

## Analytics

### GET /api/analytics/overview
Get dashboard overview stats.

**Query Parameters:**
- `period` - today, week, month, year

**Response:**
```json
{
  "revenue": 150000,
  "totalOrders": 45,
  "averageOrderValue": 3333,
  "newCustomers": 12,
  "pendingOrders": 5
}
```

### GET /api/analytics/revenue
Get revenue data.

**Query Parameters:**
- `period` - daily, weekly, monthly

### GET /api/analytics/popular-items
Get top selling products.

### GET /api/analytics/peak-hours
Get order distribution by hour.

### GET /api/analytics/orders-by-status
Get order count by status.

---

## Activity Log

### GET /api/activity-log
Get system activity log (admin+).

**Query Parameters:**
- `user_id` - Filter by user
- `limit` - Number of results

---

## WebSocket Events

Connect to: `http://localhost:3000`

### Events from Server:
- `new-order` - New order placed
- `order-status-updated` - Order status changed
- `product-created` - New product added
- `product-updated` - Product updated
- `delivery-updated` - Delivery status changed
- `new-delivery` - New delivery assigned to driver

### Events to Server:
- `join-admin` - Join admin room
- `join-delivery` - Join delivery room for specific driver

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
