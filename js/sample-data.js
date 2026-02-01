// Sample Product Data
// This file contains sample data that you can use to populate your Firebase Firestore

const sampleProducts = [
    {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation and 20-hour battery life. Perfect for music lovers and professionals.",
        category: "electronics",
        price: 79.99,
        stock: 50,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
    },
    {
        name: "Smart Watch Series 5",
        description: "Advanced fitness tracker with heart rate monitor, GPS, and water resistance. Stay connected on the go.",
        category: "electronics",
        price: 299.99,
        stock: 30,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
    },
    {
        name: "Men's Classic T-Shirt",
        description: "Comfortable 100% cotton t-shirt available in multiple colors. Perfect for casual wear.",
        category: "clothing",
        price: 19.99,
        stock: 100,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
    },
    {
        name: "Women's Running Shoes",
        description: "Lightweight and breathable running shoes with excellent cushioning. Ideal for daily workouts.",
        category: "sports",
        price: 89.99,
        stock: 45,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
    },
    {
        name: "Modern Table Lamp",
        description: "Stylish LED desk lamp with adjustable brightness and USB charging port. Perfect for your home office.",
        category: "home",
        price: 45.99,
        stock: 25,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500"
    },
    {
        name: "The Art of Programming",
        description: "Comprehensive guide to modern software development. Essential reading for developers.",
        category: "books",
        price: 34.99,
        stock: 60,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500"
    },
    {
        name: "Yoga Mat Premium",
        description: "Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and stretching exercises.",
        category: "sports",
        price: 29.99,
        stock: 80,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"
    },
    {
        name: "Premium Notebook Set",
        description: "High-quality notebook set with premium paper and elegant cover. Perfect for journaling and note-taking.",
        category: "stationary",
        price: 24.99,
        stock: 75,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1596495576834-1a8151c0b3b5?w=500"
    },
    {
        name: "Face Care Kit",
        description: "Complete skincare set with cleanser, toner, and moisturizer. Suitable for all skin types.",
        category: "beauty",
        price: 49.99,
        stock: 35,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500"
    },
    {
        name: "Professional Pen Set",
        description: "Luxury ballpoint pen set with premium ink and comfortable grip. Perfect for office use.",
        category: "stationary",
        price: 39.99,
        stock: 50,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"
    },
    {
        name: "Laptop Stand Aluminum",
        description: "Ergonomic laptop stand made from premium aluminum. Improves posture and reduces neck strain.",
        category: "electronics",
        price: 54.99,
        stock: 50,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"
    },
    {
        name: "Women's Winter Jacket",
        description: "Warm and stylish winter jacket with water-resistant material. Perfect for cold weather.",
        category: "clothing",
        price: 129.99,
        stock: 25,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500"
    }
];

// Instructions to add this data to Firestore:
// 1. Go to Firebase Console -> Firestore Database
// 2. Create a collection named 'products'
// 3. Add documents manually using the data above, or
// 4. Use the following code in browser console (after initializing Firebase):

/*
// Make sure Firebase is initialized first
sampleProducts.forEach(async (product) => {
    try {
        await db.collection('products').add({
            ...product,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Product added:', product.name);
    } catch (error) {
        console.error('Error adding product:', error);
    }
});
*/

// Note: You can also create a script to upload this data programmatically
// or add them one by one through the Firebase Console
