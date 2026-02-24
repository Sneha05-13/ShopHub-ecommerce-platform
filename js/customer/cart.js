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

    // Get payment information
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    let paymentDetails = { method: paymentMethod };

    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value.trim();
        const cardExpiry = document.getElementById('card-expiry').value.trim();
        const cardCvv = document.getElementById('card-cvv').value.trim();

        if (!cardNumber || !cardExpiry || !cardCvv) {
            showNotification('Please fill in all card details', 'error');
            return;
        }
        paymentDetails.cardNumber = cardNumber.replace(/\s/g, '').slice(-4).padStart(16, '*'); // Mask for security
    } else if (paymentMethod === 'netbanking') {
        const bank = document.getElementById('bank-select').value;
        if (!bank) {
            showNotification('Please select your bank', 'error');
            return;
        }
        paymentDetails.bank = bank;
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
            payment: paymentDetails,
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

// Handle payment method toggle
function setupPaymentToggle() {
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    const cardDetails = document.getElementById('card-details');
    const netbankingDetails = document.getElementById('netbanking-details');

    paymentRadios.forEach(radio => {
        // Set initial active state
        if (radio.checked) {
            radio.closest('.payment-option').classList.add('active');
        }

        radio.addEventListener('change', (e) => {
            // Remove active class from all options
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
            
            // Add active class to current option
            e.target.closest('.payment-option').classList.add('active');

            // Toggle detail sections
            cardDetails.style.display = (e.target.value === 'card') ? 'block' : 'none';
            netbankingDetails.style.display = (e.target.value === 'netbanking') ? 'block' : 'none';
        });
    });

    // Simple formatting for card number
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += value[i];
            }
            e.target.value = formattedValue.trim();
        });
    }

    // Simple formatting for expiry
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
            } else {
                e.target.value = value;
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupPaymentToggle();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
