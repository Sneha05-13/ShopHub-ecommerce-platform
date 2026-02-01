// Profile Page JavaScript

console.log('Profile.js loaded successfully');

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Check if user is logged in
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'User not logged in');
    
    if (!user) {
        console.log('Redirecting to login page...');
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }

    console.log('Loading user profile and orders...');
    try {
        await loadUserProfile(user);
        await loadOrderHistory(user);
        console.log('Profile and orders loaded successfully');
    } catch (error) {
        console.error('Error loading profile data:', error);
        showNotification('Error loading profile data', 'error');
    }
});

// Load user profile data
async function loadUserProfile(user) {
    console.log('Loading user profile for UID:', user.uid);
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        console.log('User document exists:', userDoc.exists);
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('User data loaded:', userData);
            
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-email').value = user.email;
            document.getElementById('profile-phone').value = userData.phone || '';
            document.getElementById('profile-address').value = userData.address || '';
        } else {
            console.log('No user document found, creating one...');
            // Create user document if it doesn't exist
            await db.collection('users').doc(user.uid).set({
                name: user.displayName || '',
                email: user.email,
                phone: '',
                address: '',
                role: 'customer',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Load the newly created data
            await loadUserProfile(user);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Error loading profile data', 'error');
    }
}

// Handle profile form submission
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;

        const name = document.getElementById('profile-name').value;
        const phone = document.getElementById('profile-phone').value;
        const address = document.getElementById('profile-address').value;

        try {
            // Update user data in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: user.email,
                phone: phone,
                address: address,
                role: 'customer',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Error updating profile', 'error');
        }
    });
}

// Load order history
async function loadOrderHistory(user) {
    console.log('Loading order history for UID:', user.uid);
    const orderHistoryDiv = document.getElementById('order-history');
    if (!orderHistoryDiv) {
        console.log('Order history div not found');
        return;
    }

    orderHistoryDiv.innerHTML = '<p>Loading orders...</p>';

    try {
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        console.log('Orders snapshot size:', ordersSnapshot.size);

        if (ordersSnapshot.empty) {
            console.log('No orders found');
            orderHistoryDiv.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orderHistoryDiv.innerHTML = '';
        
        ordersSnapshot.forEach(doc => {
            const order = { id: doc.id, ...doc.data() };
            console.log('Processing order:', order);
            const orderItem = createOrderItem(order);
            orderHistoryDiv.appendChild(orderItem);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        orderHistoryDiv.innerHTML = '<p>Error loading order history.</p>';
    }
}

// Create order item element
function createOrderItem(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    
    const orderDate = order.createdAt ? 
        (order.createdAt.toDate ? order.createdAt.toDate().toLocaleDateString() : 
         new Date(order.createdAt).toLocaleDateString()) : 'N/A';
    const statusClass = order.status || 'pending';
    
    orderDiv.innerHTML = `
        <div class="order-header">
            <h4>Order #${order.id ? order.id.substring(0, 8) : 'Unknown'}</h4>
            <span class="status-badge ${statusClass}">${order.status || 'Pending'}</span>
        </div>
        <div class="order-details">
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Items:</strong> ${order.items ? order.items.length : 0}</p>
            <p><strong>Total:</strong> ${order.total ? formatCurrency(order.total) : '$0.00'}</p>
        </div>
    `;
    
    return orderDiv;
}

// Handle logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);
        }).catch((error) => {
            console.error('Logout error:', error);
            showNotification('Error logging out', 'error');
        });
    });
}
