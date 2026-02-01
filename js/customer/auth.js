// Customer Authentication Management
// This file handles user authentication state across all customer pages

// Check authentication state on page load
auth.onAuthStateChanged((user) => {
    const authLink = document.getElementById('auth-link');
    
    if (user) {
        // User is logged in
        if (authLink) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in
        if (authLink) {
            authLink.textContent = 'Login';
            authLink.href = getLoginPath();
        }
    }
});

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    auth.signOut().then(() => {
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = getHomePath();
        }, 1000);
    }).catch((error) => {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    });
}

// Helper function to get login path based on current location
function getLoginPath() {
    if (window.location.pathname.includes('/html/customer/')) {
        return 'login.html';
    }
    return 'html/customer/login.html';
}

// Helper function to get home path based on current location
function getHomePath() {
    if (window.location.pathname.includes('/html/customer/')) {
        return '../../index.html';
    }
    return 'index.html';
}

// Update cart count from localStorage
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Initialize cart count on page load
updateCartCount();

// Mobile menu toggle
const mobileMenuIcon = document.getElementById('mobile-menu-icon');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuIcon && navLinks) {
    mobileMenuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}
