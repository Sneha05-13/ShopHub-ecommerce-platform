# E-Commerce Web Application

A complete e-commerce web application built with HTML, CSS, JavaScript, and Firebase. Features both customer and admin sections for a full shopping experience.

## Features

### Customer Section
- **Home Page**: Hero section, featured categories, and featured products
- **Categories Page**: Browse all product categories
- **Products Page**: View all products with filtering, sorting, and search
- **Product Details**: Detailed product information with add to cart functionality
- **Shopping Cart**: Manage cart items, update quantities, and checkout
- **User Authentication**: Sign up and login with Firebase Auth
- **User Profile**: Manage account information and view order history
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Section
- **Admin Dashboard**: Overview statistics (products, orders, revenue, customers)
- **Products Management**: Add, edit, and delete products with image upload
- **Orders Management**: View all orders, order details, and update order status
- **Sales Reports**: View sales statistics, sales by category, and top products
- **Protected Access**: Admin-only access with role-based authentication

## Project Structure

```
ecommercee/
├── index.html                  # Home page
├── css/
│   ├── customer-style.css      # Customer section styles
│   └── admin-style.css         # Admin section styles
├── js/
│   ├── firebase-config.js      # Firebase configuration
│   ├── sample-data.js          # Sample product data
│   ├── customer/
│   │   ├── auth.js            # Customer authentication
│   │   ├── home.js            # Home page functionality
│   │   ├── login.js           # Login/signup page
│   │   ├── categories.js      # Categories page
│   │   ├── products.js        # Products listing
│   │   ├── product-details.js # Product details page
│   │   ├── cart.js            # Shopping cart
│   │   └── profile.js         # User profile
│   └── admin/
│       ├── admin-auth.js       # Admin authentication
│       ├── admin-login.js      # Admin login page
│       ├── dashboard.js        # Admin dashboard
│       ├── products.js         # Products management
│       ├── orders.js           # Orders management
│       └── sales-reports.js    # Sales reports
├── html/
│   ├── customer/
│   │   ├── login.html
│   │   ├── categories.html
│   │   ├── products.html
│   │   ├── product-details.html
│   │   ├── cart.html
│   │   └── profile.html
│   └── admin/
│       ├── admin-login.html
│       ├── dashboard.html
│       ├── products.html
│       ├── orders.html
│       └── sales-reports.html
└── assets/
    └── images/                 # Store product images here
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication**: Enable Email/Password sign-in method
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage for product images

4. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll down to "Your apps" section
   - Click on the web icon (</>)
   - Copy the Firebase configuration object

5. Update `js/firebase-config.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

### 2. Firestore Database Setup

Create the following collections in Firestore:

#### Collection: `products`
Fields:
- `name` (string)
- `description` (string)
- `category` (string)
- `price` (number)
- `stock` (number)
- `imageUrl` (string)
- `featured` (boolean)
- `createdAt` (timestamp)

#### Collection: `users`
Fields:
- `name` (string)
- `email` (string)
- `role` (string) - "customer" or "admin"
- `phone` (string - optional)
- `address` (string - optional)
- `createdAt` (timestamp)

#### Collection: `orders`
Fields:
- `userId` (string)
- `userEmail` (string)
- `items` (array of objects)
- `subtotal` (number)
- `tax` (number)
- `total` (number)
- `status` (string) - "pending", "completed", or "cancelled"
- `createdAt` (timestamp)

### 3. Firestore Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Read for all, Write for admin only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users: Users can read/write their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders: Users can read their own orders, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Storage Security Rules

Update your Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Add Sample Data

1. Open `js/sample-data.js` to see sample product data
2. Go to Firebase Console → Firestore Database
3. Create a collection named `products`
4. You can either:
   - Add products manually using the sample data, or
   - Open your website in a browser, open the console, and run the code provided in the sample-data.js file

### 6. Create Admin User

1. First, sign up as a regular user through the website
2. Go to Firebase Console → Firestore Database
3. Find the user document in the `users` collection
4. Edit the document and change the `role` field to `"admin"`
5. Now you can log in as admin at `/html/admin/admin-login.html`

### 7. Run the Application

1. You can use any local web server to run the application:
   
   **Option 1: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   
   **Option 2: Using Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option 3: Using VS Code Live Server**
   - Install "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

2. Open your browser and navigate to `http://localhost:8000`

## Usage Guide

### Customer Features

1. **Browse Products**: 
   - Visit the home page to see featured products
   - Click on categories to filter products
   - Use the search and filter options on the products page

2. **Shopping Cart**:
   - Add products to cart from product listings or detail pages
   - View cart by clicking the cart icon in navigation
   - Update quantities or remove items
   - Proceed to checkout (requires login)

3. **User Account**:
   - Sign up for a new account or login
   - Update profile information
   - View order history

### Admin Features

1. **Access Admin Panel**:
   - Navigate to `/html/admin/admin-login.html`
   - Login with admin credentials

2. **Manage Products**:
   - Add new products with images
   - Edit existing products
   - Delete products
   - Upload product images to Firebase Storage

3. **Manage Orders**:
   - View all customer orders
   - View detailed order information
   - Update order status (pending, completed, cancelled)

4. **View Reports**:
   - Dashboard shows overview statistics
   - Sales reports show detailed analytics
   - View top-selling products
   - View sales by category

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Storage
- **Design**: Responsive design with CSS Grid and Flexbox
- **Icons**: Unicode emojis

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Important Notes

1. **Firebase Quotas**: Free tier has limits. Monitor your usage in Firebase Console.
2. **Security**: Always use proper security rules in production.
3. **Images**: Product images are stored in Firebase Storage. You can also use external URLs.
4. **Admin Access**: Protect admin credentials and only assign admin role to trusted users.
5. **Testing**: Test thoroughly before deploying to production.

## Troubleshooting

### Issue: Products not loading
- Check Firebase configuration in `js/firebase-config.js`
- Verify Firestore security rules
- Check browser console for errors

### Issue: Cannot login
- Verify Email/Password authentication is enabled in Firebase
- Check if user exists in Firestore with correct role

### Issue: Images not uploading
- Check Storage security rules
- Verify Storage is enabled in Firebase project

### Issue: Admin panel not accessible
- Make sure user has `role: "admin"` in Firestore
- Check admin authentication logic

## Future Enhancements

- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Wishlist functionality
- Advanced search with filters
- Order tracking
- Admin analytics dashboard
- Multi-language support

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check:
- Firebase Documentation: https://firebase.google.com/docs
- JavaScript Documentation: https://developer.mozilla.org/

---

**Happy Shopping! 🛒**
