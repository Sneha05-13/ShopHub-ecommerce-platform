// Login and Signup Page JavaScript

// Toggle between login and signup forms
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
}

// Handle login form submission
const loginFormElement = document.getElementById('login-form-element');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            // Sign in with Firebase Auth
            await auth.signInWithEmailAndPassword(email, password);
            
            showNotification('Login successful!', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message, 'error');
        }
    });
}

// Handle signup form submission
const signupFormElement = document.getElementById('signup-form-element');
if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            // Create user with Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                role: 'customer',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showNotification('Account created successfully!', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            showNotification(error.message, 'error');
        }
    });
}
