// Home Page JavaScript
// Load featured categories and products

// Sample categories for display
const categories = [
    { id: 'electronics', name: 'Electronics', icon: '💻' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'stationary', name: 'Stationary', icon: '📝' }
];

// Load categories on home page
function loadCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
        `;
        categoryCard.addEventListener('click', () => {
            window.location.href = `html/customer/products.html?category=${category.id}`;
        });
        categoriesGrid.appendChild(categoryCard);
    });
}

// Load featured products from Firestore
async function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featured-products');
    if (!productsGrid) return;

    productsGrid.innerHTML = '<p>Loading products...</p>';

    try {
        // Fetch products from Firestore (limit to 6 featured products)
        const productsSnapshot = await db.collection('products')
            .where('featured', '==', true)
            .limit(6)
            .get();

        if (productsSnapshot.empty) {
            productsGrid.innerHTML = '<p>No featured products available.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productsSnapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">${formatCurrency(product.price)}</p>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                <button class="btn btn-secondary" onclick="viewProduct('${product.id}')">View Details</button>
            </div>
        </div>
    `;
    
    return card;
}

// Add product to cart
function addToCart(productId) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    showNotification('Product added to cart!', 'success');
}

// View product details
function viewProduct(productId) {
    window.location.href = `html/customer/product-details.html?id=${productId}`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadFeaturedProducts();
});
