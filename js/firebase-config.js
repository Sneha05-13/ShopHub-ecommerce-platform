// Firebase Configuration and Initialization
// Replace these values with your actual Firebase project configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfo7mj_kEFklzaB81x9YcuMim14rnZULU",
  authDomain: "e-commerce-app-f265d.firebaseapp.com",
  projectId: "e-commerce-app-f265d",
  storageBucket: "e-commerce-app-f265d.firebasestorage.app",
  messagingSenderId: "927599274842",
  appId: "1:927599274842:web:37ea0993336bc879d82163",
  measurementId: "G-5KN3XX4QWX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
let storage;

// Set auth persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('Auth persistence set to LOCAL');
    })
    .catch((error) => {
        console.error('Error setting auth persistence:', error);
    });

// Only initialize storage if the script is loaded
try {
    storage = firebase.storage();
} catch (error) {
    console.log('Firebase Storage not available - this is normal for pages that don\'t use storage');
}

// Helper function to check if user is logged in
function checkAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                resolve(user);
            } else {
                reject('No user logged in');
            }
        });
    });
}

// Helper function to check if user is admin
async function checkAdminRole(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return userDoc.data().role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Error checking admin role:', error);
        return false;
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

console.log('Firebase initialized successfully');
