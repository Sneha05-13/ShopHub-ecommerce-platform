// Products Page JavaScript

let allProducts = [];
let filteredProducts = [];

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const categoryFilter = urlParams.get('category');

// Load products from Firestore
async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '<p>Loading products...</p>';

    try {
        let query = db.collection('products');
        
        // Apply category filter if specified
        if (categoryFilter) {
            query = query.where('category', '==', categoryFilter);
        }

        const productsSnapshot = await query.get();

        if (productsSnapshot.empty) {
            productsGrid.innerHTML = '<p>No products available.</p>';
            return;
        }

        allProducts = [];
        productsSnapshot.forEach(doc => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });

        filteredProducts = [...allProducts];
        displayProducts();
        loadCategoryFilter();
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Display products in grid
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p>No products found matching your criteria.</p>';
        return;
    }

    productsGrid.innerHTML = '';
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description ? product.description.substring(0, 60) + '...' : ''}</p>
            <p class="product-price">${formatCurrency(product.price)}</p>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                <button class="btn btn-secondary" onclick="viewProduct('${product.id}')">View</button>
            </div>
        </div>
    `;
    
    return card;
}

// Load category options for filter
function loadCategoryFilter() {
    const categoryFilterSelect = document.getElementById('category-filter');
    if (!categoryFilterSelect) return;

    const categories = [...new Set(allProducts.map(p => p.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        if (category === categoryFilter) {
            option.selected = true;
        }
        categoryFilterSelect.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const categorySelect = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-input');

    filteredProducts = [...allProducts];

    // Category filter
    if (categorySelect && categorySelect.value !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === categorySelect.value);
    }

    // Search filter
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }

    // Sort
    if (sortSelect) {
        const sortValue = sortSelect.value;
        if (sortValue === 'name') {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortValue === 'price-low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }
    }

    displayProducts();
}

// Add product to cart
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!', 'success');
}

// View product details
function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    const categoryFilterSelect = document.getElementById('category-filter');
    const sortFilterSelect = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-input');

    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener('change', applyFilters);
    }

    if (sortFilterSelect) {
        sortFilterSelect.addEventListener('change', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
});
