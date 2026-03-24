# Taste Of Terai - Complete Project Review & Deployment Guide

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Code Review Findings](#2-code-review-findings)
3. [System Requirements](#3-system-requirements)
4. [Installation & Setup](#4-installation--setup)
5. [Database Configuration](#5-database-configuration)
6. [Server Initialization](#6-server-initialization)
7. [Production Deployment](#7-production-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

# 1. Project Overview

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | - |
| **Backend** | Node.js, Express.js | Node 18+/Express 4.18+ |
| **Database** | JSON File Storage | - |
| **Authentication** | JWT (JSON Web Tokens) | jwt 9.0+ |
| **Security** | Helmet, CORS, Rate Limiting | - |
| **Real-time** | Socket.IO | 4.7+ |

## Project Structure

```
TasteOfTerai/
├── public/                    # Frontend files
│   ├── index.html            # Home page
│   ├── products.html         # Products listing
│   ├── about.html            # About us page
│   ├── contact.html          # Contact page
│   ├── checkout.html         # Checkout page
│   ├── orders.html           # Order tracking
│   ├── admin.html            # Admin panel
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── main.js          # Main JavaScript
│   │   └── cart.js          # Cart functionality
│   └── manifest.json         # PWA manifest
├── backend/
│   ├── server.js             # Express server
│   ├── database.js           # JSON database
│   ├── database.json         # Data file (auto-created)
│   ├── package.json          # Dependencies
│   └── API.md                # API documentation
├── DEPLOYMENT-GUIDE.md       # This guide
└── taste_of_terai_database.sql  # MySQL alternative
```

---

# 2. Code Review Findings

## ✅ Frontend Components (Verified Complete)

### Pages Created
| Page | Status | Features |
|------|--------|----------|
| index.html | ✅ Complete | Hero section, products, testimonials, founders |
| products.html | ✅ Complete | Product grid, categories, search, filters |
| about.html | ✅ Complete | Brand story, mission, founders, team |
| contact.html | ✅ Complete | Contact form, map, contact info |
| checkout.html | ✅ Complete | Multi-step checkout, forms |
| orders.html | ✅ Complete | Order tracking, history |
| admin.html | ✅ Complete | Dashboard, CRUD operations |
| track-order.html | ✅ Complete | Order tracking interface |
| Privacy/Terms/Return/Shipping | ✅ Complete | Policy pages |

### CSS Styling (Verified)
- ✅ Warm/traditional color scheme (orange/brown/golden)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Custom properties for theming
- ✅ Khajuri hero background image
- ✅ Animations and hover effects

### JavaScript Features
- ✅ Shopping cart (localStorage-based)
- ✅ Search functionality
- ✅ Category filtering
- ✅ Order management
- ✅ Admin authentication

## ✅ Backend Components (Verified Complete)

### API Endpoints (Documented in backend/API.md)
| Category | Endpoints |
|----------|-----------|
| Authentication | Login, Register, Change Password, Me |
| Users | CRUD, Invite, Delivery Team |
| Products | CRUD, Variants, Search, Featured |
| Categories | CRUD, Counts |
| Orders | CRUD, Status Updates, Tracking |
| Customers | CRUD, Addresses |
| Payments | Create, Update, History |
| Delivery | Tracking, Status Updates |
| Activity | Logging, Admin Dashboard |

### Security Features
- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Rate Limiting
- ✅ Helmet Security Headers
- ✅ CORS Configuration
- ✅ Input Validation

### Database Structure (JSON-based)
| Collection | Fields |
|------------|--------|
| users | id, email, password, name, phone, role, is_active |
| customers | id, email, name, phone, addresses |
| categories | id, name, description, is_active, sort_order |
| products | id, name, category_id, price, image, in_stock, is_featured |
| orders | id, customer_id, items, status, total, created_at |
| payments | id, order_id, method, status, transaction_id |
| delivery_tracking | id, order_id, status, location, driver_id |
| activity_log | id, user_id, action, details, timestamp |
| invitations | id, email, role, token, expires_at |

### Default Admin Credentials
```
Email: admin@tasteofterai.com
Password: admin123
```

---

# 3. System Requirements

## Development Environment

### Hardware
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |
| RAM | 4 GB | 8 GB+ |
| Storage | 5 GB | 10 GB+ SSD |

### Software
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x LTS | Runtime |
| npm | 9.x+ | Package Manager |
| Git | 2.40+ | Version Control |
| Browser | Chrome/Firefox/Edge | Testing |

### Operating Systems
- Windows 10/11 (64-bit)
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian 11+)

## Production Environment

### Minimum Server
| Resource | Specification |
|----------|---------------|
| CPU | 1 vCPU |
| RAM | 1 GB |
| Storage | 5 GB SSD |
| Bandwidth | Unlimited |

### Recommended Hosting
- **VPS**: DigitalOcean ($6/mo), Linode ($6/mo), Vultr ($6/mo)
- **PaaS**: Railway ($5/mo), Render (Free-$25/mo)
- **Cloud**: AWS Lightsail ($5/mo)

---

# 4. Installation & Setup

## Step 1: Clone Repository

```bash
# Navigate to projects directory
cd ~/Projects

# Clone the repository
git clone <repository-url> TasteOfTerai

# Enter project directory
cd TasteOfTerai
```

## Step 2: Install Node.js

### Windows
```powershell
# Download from https://nodejs.org/
# Run the installer (LTS version)
node --version
npm --version
```

### macOS
```bash
# Using Homebrew
brew install node@20

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

## Step 3: Install Dependencies

```bash
# Navigate to backend
cd TasteOfTerai/backend

# Install all dependencies
npm install

# Verify installation
ls node_modules  # Should show many packages
```

---

# 5. Database Configuration

## Overview

The project uses **JSON file-based storage** for simplicity. The database file (`database.json`) is automatically created on first run.

### Database File Location
```
backend/database.json
```
n
### Initial Data Seeding

On first run, the server automatically creates:
- **Default Admin User**: admin@tasteofterai.com / admin123
- **5 Categories**: Traditional Sweets, Ladoo, Dry Fruits, Premium Sweets, Gift Boxes
- **Sample Products**: Khajuri, Thekuwa, Mix Dry Fruits, etc.

## Environment Variables (Optional)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-key-change-this

# File Paths
DB_PATH=./database.json
```

---

# 6. Server Initialization

## Development Mode

### Method 1: Using npm scripts (Recommended)
```bash
cd TasteOfTerai/backend
npm start
```

### Method 2: Direct Node execution
```bash
cd TasteOfTerai/backend
node server.js
```

### Method 3: Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name tasteofterai

# View logs
pm2 logs tasteofterai

# Restart after changes
pm2 restart tasteofterai

# Stop server
pm2 stop tasteofterai
```

## Expected Output

```
> taste-of-terai-backend@1.0.0 start
> node server.js

Server running on port 3000
Database initialized successfully
```

## Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin.html |
| API Base | http://localhost:3000/api |

---

# 7. Production Deployment

## Option A: Deploy to Railway (Easiest)

### Step 1: Prepare Code
```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add Environment Variables:
   - `PORT`: 3000
   - `NODE_ENV`: production
   - `JWT_SECRET`: (generate random string)
6. Click "Deploy"

### Step 3: Configure Domain (Optional)
1. Go to Railway project settings
2. Add custom domain
3. Update DNS records at your domain registrar

---

## Option B: Deploy to VPS (DigitalOcean)

### Step 1: Create Droplet
1. Sign up at https://digitalocean.com
2. Create Droplet → Ubuntu 20.04
3. Add SSH key (recommended)
4. Note your server IP address

### Step 2: Connect to Server
```bash
ssh root@your-server-ip
```

### Step 3: Install Software
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2
```

### Step 4: Deploy Application
```bash
# Create directory
mkdir -p /var/www/tasteofterai
cd /var/www/tasteofterai

# Clone repository
git clone your-repo-url .

# Install dependencies
cd backend
npm install --production

# Create environment file
nano .env
```

Add to `.env`:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-random-secret-key-here
```

### Step 5: Start with PM2
```bash
cd /var/www/tasteofterai/backend
pm2 start server.js --name tasteofterai
pm2 save
pm2 startup
```

### Step 6: Configure Nginx
```bash
nano /etc/nginx/sites-available/tasteofterai
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/tasteofterai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Install SSL Certificate
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Option C: Deploy to Render

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Deploy on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Create "New Web Service"
4. Connect GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 3000
   - `JWT_SECRET`: (random string)
7. Deploy

---

# 8. Troubleshooting

## Common Issues

### "Port already in use"
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Database not initializing"
```bash
# Check file permissions
ls -la backend/database.json
chmod 755 backend/
```

### "JWT token errors"
```env
# Ensure JWT_SECRET is set in production
JWT_SECRET=your-secret-key
```

### "CORS errors"
Check CORS configuration in `backend/server.js`:
```javascript
app.use(cors({
    origin: 'https://yourdomain.com',
    // ...
}));
```

## Performance Optimization

### For High Traffic
1. Enable PM2 cluster mode
2. Add Redis for session caching
3. Enable Nginx caching
4. Use CDN for static assets

### Database Backup
```bash
# Backup database.json
cp backend/database.json backup-$(date +%Y%m%d).json
```

---

# Quick Reference

## Start Development Server
```bash
cd backend
npm start
# Open http://localhost:3000
```

## Admin Login
- URL: http://localhost:3000/admin.html
- Email: admin@tasteofterai.com
- Password: admin123

## API Endpoints
- Base URL: http://localhost:3000/api
- Documentation: See backend/API.md

---

*Last Updated: February 2026*
*Version: 1.0.0*
*Taste Of Terai - Authentic Nepali Mithai*
