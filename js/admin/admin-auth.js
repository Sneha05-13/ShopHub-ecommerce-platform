// Admin Authentication Management

// Check if user is logged in and has admin role
auth.onAuthStateChanged(async (user) => {
    const currentPath = window.location.pathname;
    
    // If on login page, check if already logged in as admin
    if (currentPath.includes('admin-login.html')) {
        if (user) {
            const isAdmin = await checkAdminRole(user.uid);
            if (isAdmin) {
                window.location.href = 'dashboard.html';
            }
        }
        return;
    }

    // For other admin pages, check authentication and admin role
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }

    const isAdmin = await checkAdminRole(user.uid);
    if (!isAdmin) {
        showNotification('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            auth.signOut();
            window.location.href = '../../index.html';
        }, 2000);
        return;
    }

    // Display admin name
    const adminUserName = document.getElementById('admin-user-name');
    if (adminUserName) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                adminUserName.textContent = userDoc.data().name || user.email;
            }
        } catch (error) {
            console.error('Error loading admin name:', error);
        }
    }
});

// Handle admin logout
const logoutBtn = document.getElementById('admin-logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 1000);
        }).catch((error) => {
            console.error('Logout error:', error);
            showNotification('Error logging out', 'error');
        });
    });
}
