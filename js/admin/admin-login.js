// Admin Login Page JavaScript

const adminLoginForm = document.getElementById('admin-login-form');

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            // Sign in with Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Check if user has admin role
            const isAdmin = await checkAdminRole(user.uid);
            
            if (!isAdmin) {
                // Not an admin, sign out
                await auth.signOut();
                showNotification('Access denied. Admin privileges required.', 'error');
                return;
            }

            showNotification('Login successful!', 'success');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Invalid email or password', 'error');
        }
    });
}


