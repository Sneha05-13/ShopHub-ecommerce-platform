// Product Details Page JavaScript

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Load product details
async function loadProductDetails() {
    const productDetailsDiv = document.getElementById('product-details');
    if (!productDetailsDiv || !productId) return;

    productDetailsDiv.innerHTML = '<p>Loading product details...</p>';

    try {
        const productDoc = await db.collection('products').doc(productId).get();

        if (!productDoc.exists) {
            productDetailsDiv.innerHTML = '<p>Product not found.</p>';
            return;
        }

        const product = { id: productDoc.id, ...productDoc.data() };
        displayProductDetails(product);
    } catch (error) {
        console.error('Error loading product:', error);
        productDetailsDiv.innerHTML = '<p>Error loading product details.</p>';
    }
}

// Display product details
function displayProductDetails(product) {
    const productDetailsDiv = document.getElementById('product-details');
    
    productDetailsDiv.innerHTML = `
        <div class="product-details-image-container">
            <img src="${product.imageUrl || 'https://via.placeholder.com/500'}" alt="${product.name}" class="product-details-image">
        </div>
        <div class="product-details-info">
            <h1>${product.name}</h1>
            <p class="product-price">${formatCurrency(product.price)}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Stock:</strong> ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
            <p>${product.description || 'No description available.'}</p>
            
            <div class="quantity-selector">
                <button onclick="decrementQuantity()">-</button>
                <input type="number" id="quantity" value="1" min="1" max="${product.stock}">
                <button onclick="incrementQuantity()">+</button>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="addToCartFromDetails()" ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    `;
}

// Increment quantity
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const max = parseInt(quantityInput.max);
        const current = parseInt(quantityInput.value);
        if (current < max) {
            quantityInput.value = current + 1;
        }
    }
}

// Decrement quantity
function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const min = parseInt(quantityInput.min);
        const current = parseInt(quantityInput.value);
        if (current > min) {
            quantityInput.value = current - 1;
        }
    }
}

// Add to cart from details page
function addToCartFromDetails() {
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value);

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity: quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${quantity} item(s) added to cart!`, 'success');
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadProductDetails);
