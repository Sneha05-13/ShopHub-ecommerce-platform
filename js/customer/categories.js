// Categories Page JavaScript

const categories = [
    { id: 'electronics', name: 'Electronics', icon: '💻', description: 'Laptops, phones, and accessories' },
    { id: 'clothing', name: 'Clothing', icon: '👕', description: 'Fashion for men, women, and kids' },
    { id: 'home', name: 'Home & Garden', icon: '🏠', description: 'Furniture and home decor' },
    { id: 'books', name: 'Books', icon: '📚', description: 'Books and magazines' },
    { id: 'sports', name: 'Sports', icon: '⚽', description: 'Sports equipment and gear' },
    { id: 'stationary', name: 'Stationary', icon: '📝', description: 'Office and school supplies' }
];

// Load all categories
function loadCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        `;
        categoryCard.addEventListener('click', () => {
            window.location.href = `products.html?category=${category.id}`;
        });
        categoriesGrid.appendChild(categoryCard);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadCategories);
