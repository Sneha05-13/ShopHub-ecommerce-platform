// Cart Page JavaScript

let cartItems = [];
let productsData = {};

// Load cart items
async function loadCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    if (!cartItemsDiv) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <a href="products.html" class="btn btn-primary">Shop Now</a>
            </div>
        `;
        updateCartSummary();
        return;
    }

    cartItemsDiv.innerHTML = '<p>Loading cart...</p>';

    try {
        // Fetch product details for all cart items
        cartItems = [];
        for (const item of cart) {
            const productDoc = await db.collection('products').doc(item.id).get();
            if (productDoc.exists) {
                const product = { id: productDoc.id, ...productDoc.data() };
                productsData[item.id] = product;
                cartItems.push({
                    ...product,
                    quantity: item.quantity
                });
            }
        }

        displayCartItems();
        updateCartSummary();
    } catch (error) {
        console.error('Error loading cart:', error);
        cartItemsDiv.innerHTML = '<p>Error loading cart items.</p>';
    }
}

// Display cart items
function displayCartItems() {
    const cartItemsDiv = document.getElementById('cart-items');
    
    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <a href="products.html" class="btn btn-primary">Shop Now</a>
            </div>
        `;
        return;
    }

    cartItemsDiv.innerHTML = '';
    
    cartItems.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${item.imageUrl || 'https://via.placeholder.com/100'}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p class="cart-item-price">${formatCurrency(item.price)}</p>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <span class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</span>
        `;
        cartItemsDiv.appendChild(cartItemDiv);
    });
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Item removed from cart', 'info');
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (taxElement) taxElement.textContent = formatCurrency(tax);
    if (totalElement) totalElement.textContent = formatCurrency(total);
}

// Handle checkout
async function handleCheckout() {
    const user = auth.currentUser;
    
    if (!user) {
        showNotification('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    try {
        // Calculate totals
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        // Create order in Firestore
        const orderData = {
            userId: user.uid,
            userEmail: user.email,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: subtotal,
            tax: tax,
            total: total,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('orders').add(orderData);

        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();

        showNotification('Order placed successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Error placing order. Please try again.', 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
