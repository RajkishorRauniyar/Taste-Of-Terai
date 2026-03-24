// ========================================
// Taste Of Terai - Main JavaScript
// ========================================

// Products Data
const products = [
    {
        id: 1,
        name: "Khajuri",
        category: "Traditional Sweets",
        price: 500,
        originalPrice: 600,
        weight: "500 gm",
        description: "Traditional date palm sweet, handcrafted with authentic recipe. Made from fresh date palm jaggery and premium ingredients.",
        image: "https://images.unsplash.com/photo-1599639668273-41d7364fc51a?w=400&h=300&fit=crop",
        badge: "Best Seller",
        inStock: true
    },
    {
        id: 2,
        name: "Thekuwa",
        category: "Traditional Sweets",
        price: 500,
        originalPrice: 600,
        weight: "500 gm",
        description: "Traditional Nepalese wheat flour sweet with jaggery. Handmade with love using authentic Terai recipe.",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
        badge: "Popular",
        inStock: true
    },
    {
        id: 3,
        name: "Mix Dry Fruits",
        category: "Dry Fruits",
        price: 1000,
        originalPrice: 1200,
        weight: "500 gm",
        description: "Premium mix of almonds, cashews, raisins, walnuts, and apricots. Rich in nutrients and delicious taste.",
        image: "https://images.unsplash.com/photo-1599598425947-730816b1ee3c?w=400&h=300&fit=crop",
        badge: "Premium",
        inStock: true
    },
    {
        id: 4,
        name: "Mix Dry Fruits Ladoo",
        category: "Ladoo",
        price: 1100,
        originalPrice: 1300,
        weight: "500 gm",
        description: "Delicious ladoo made with premium dry fruits, ghee, and jaggery. A healthy and tasty treat.",
        image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=300&fit=crop",
        badge: "New",
        inStock: true
    },
    {
        id: 5,
        name: "Besan Laddu",
        category: "Ladoo",
        price: 450,
        originalPrice: 500,
        weight: "500 gm",
        description: "Classic gram flour laddu with aromatic spices and ghee. Traditional favorite for generations.",
        image: "https://images.unsplash.com/photo-1627665460198-2457172596d6?w=400&h=300&fit=crop",
        badge: "Traditional",
        inStock: true
    },
    {
        id: 6,
        name: "Motichoor Laddu",
        category: "Ladoo",
        price: 550,
        originalPrice: 650,
        weight: "500 gm",
        description: "Fine gram flour pearls soaked in rose-flavored sugar syrup. Soft and melt-in-your-mouth delicious.",
        image: "https://images.unsplash.com/photo-1605197136312-dba8b5595f5d?w=400&h=300&fit=crop",
        badge: "Favorite",
        inStock: true
    },
    {
        id: 7,
        name: "Kaju Katli",
        category: "Premium Sweets",
        price: 850,
        originalPrice: 1000,
        weight: "500 gm",
        description: "Premium cashew fudge with silver leaf decoration. Royal treat for special occasions.",
        image: "https://images.unsplash.com/photo-1605197136312-dba8b5595f5d?w=400&h=300&fit=crop",
        badge: "Premium",
        inStock: true
    },
    {
        id: 8,
        name: "Gulab Jamun",
        category: "Traditional Sweets",
        price: 400,
        originalPrice: 450,
        weight: "500 gm",
        description: "Soft dough balls soaked in rose-flavored sugar syrup. Classic Indian sweet loved by all.",
        image: "https://images.unsplash.com/photo-1627665460198-2457172596d6?w=400&h=300&fit=crop",
        badge: "Popular",
        inStock: true
    }
];

// Categories
const categories = [
    { name: "All Products", count: products.length },
    { name: "Traditional Sweets", count: products.filter(p => p.category === "Traditional Sweets").length },
    { name: "Ladoo", count: products.filter(p => p.category === "Ladoo").length },
    { name: "Dry Fruits", count: products.filter(p => p.category === "Dry Fruits").length },
    { name: "Premium Sweets", count: products.filter(p => p.category === "Premium Sweets").length }
];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initSearch();
    initCart();
    initMenu();
    initProducts();
    initAnimations();
    initNewsletter();
    initMap();
    initResponsive();
});

// Handle responsive adjustments
function initResponsive() {
    // Handle window resize
    window.addEventListener('resize', function() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            closeMobileMenu();
            
            // Reset dropdowns
            document.querySelectorAll('.dropdown').forEach(d => {
                d.classList.remove('active');
            });
        }
    });
    
    // Prevent double-tap zoom on buttons
    document.querySelectorAll('button, .nav-link, .product-action-btn, .add-to-cart-btn, .buy-now-btn').forEach(el => {
        el.addEventListener('touchend', function(e) {
            // Only prevent default if it's the last touch point
            if (e.changedTouches.length === 1) {
                // Let the click event fire naturally
            }
        });
    });
    
    // iOS Safari viewport fix
    if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
        document.body.style.minHeight = '-webkit-fill-available';
        
        // Fix for 100vh on iOS Safari
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.minHeight = '100vh';
            hero.style.height = '-webkit-fill-available';
        }
    }
}

// Header Scroll Effect
function initHeader() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Search Functionality
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', function() {
            searchModal.classList.add('active');
            searchInput.focus();
        });
        
        closeSearch.addEventListener('click', function() {
            searchModal.classList.remove('active');
        });
        
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
            }
        });
        
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                searchProducts(query);
            }
        });
    }
}

// Search Products
function searchProducts(query) {
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
    // Display search results
    console.log('Search results:', filtered);
}

// Cart Functionality
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', function() {
            cartModal.classList.add('active');
            updateCartDisplay();
        });
        
        closeCart.addEventListener('click', function() {
            cartModal.classList.remove('active');
        });
        
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cartModal.classList.remove('active');
            }
        });
        
        checkoutBtn.addEventListener('click', function() {
            cartModal.classList.remove('active');
            window.location.href = 'checkout.html';
        });
    }
}

// Update Cart Display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-basket"></i><p>Your cart is empty</p></div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">Rs. ${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Rs. ${total}`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Update Quantity
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(p => p.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(p => p.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(p => p.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
}

// Buy Now - Direct purchase
function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Add single product to cart and go to checkout
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(p => p.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

// Buy Now from details modal
function buyNowFromDetails() {
    addFromDetails();
    window.location.href = 'checkout.html';
}

// Global functions
window.buyNow = buyNow;
window.buyNowFromDetails = buyNowFromDetails;

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Menu Toggle
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Mobile dropdown handling
    initMobileDropdowns();
}

// Mobile Dropdown Toggle
function initMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-link');
        
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                // Only handle clicks on mobile
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    
                    // Close other dropdowns
                    dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(d => d.classList.remove('active'));
            }
        }
    });
}

// Close mobile menu on outside click
function closeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
    }
}

// Products Display
function initProducts() {
    const featuredProducts = document.getElementById('featuredProducts');
    if (featuredProducts) {
        displayProducts(products.slice(0, 4), featuredProducts);
    }
    
    // Initialize category filters
    initCategoryFilters();
}

// Display Products
function displayProducts(productsToShow, container) {
    container.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-aos="fade-up">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="viewProduct(${product.id})" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="product-action-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-weight"><i class="fas fa-scale-balanced"></i> ${product.weight || '500 gm'}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">Rs. ${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">Rs. ${product.originalPrice}</span>` : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" style="flex: 1;">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="buy-now-btn" onclick="buyNow(${product.id})" style="flex: 1;">
                        <i class="fas fa-bolt"></i> Buy Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// View Product Details
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productDetailsModal');
    if (modal) {
        document.getElementById('productDetailsImage').src = product.image;
        document.getElementById('productDetailsCategory').textContent = product.category;
        document.getElementById('productDetailsTitle').textContent = product.name;
        document.getElementById('productDetailsPrice').textContent = `Rs. ${product.price}`;
        document.getElementById('productDetailsDescription').textContent = product.description;
        document.getElementById('productDetailsId').value = product.id;
        modal.classList.add('active');
    }
}

// Category Filters
function initCategoryFilters() {
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        categoryList.innerHTML = categories.map((cat, index) => `
            <li>
                <a href="#" class="${index === 0 ? 'active' : ''}" onclick="filterProducts('${cat.name}', this)">
                    ${cat.name}
                    <span class="count">${cat.count}</span>
                </a>
            </li>
        `).join('');
    }
}

// Filter Products
function filterProducts(category, element) {
    const productsGrid = document.getElementById('productsGrid');
    
    // Update active category
    document.querySelectorAll('.category-list a').forEach(a => a.classList.remove('active'));
    element.classList.add('active');
    
    const filtered = category === 'All Products' 
        ? products 
        : products.filter(p => p.category === category);
    
    displayProducts(filtered, productsGrid);
}

// Animations
function initAnimations() {
    // Add fade-up animation to elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Newsletter Form
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate subscription
            showNotification('Thank you for subscribing!');
            this.reset();
        });
    }
}

// Map Initialization (placeholder - can be replaced with actual Google Maps API)
function initMap() {
    // The map is embedded via iframe in index.html
    // For dynamic map with markers, you would integrate Google Maps JavaScript API here
}

// Export products data for other modules
window.productsData = products;
window.categoriesData = categories;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.productsData = products;
window.updateQuantity = updateQuantity;
window.removeFromCartGlobal = removeFromCart;
window.viewProductGlobal = viewProduct;
window.filterProductsGlobal = filterProducts;

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
