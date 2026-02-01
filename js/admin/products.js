// Admin Products Management JavaScript

let currentProductId = null;

// Load all products
async function loadProducts() {
    const productsTable = document.getElementById('products-table');
    if (!productsTable) return;

    productsTable.innerHTML = '<tr><td colspan="6">Loading products...</td></tr>';

    try {
        const productsSnapshot = await db.collection('products').get();

        if (productsSnapshot.empty) {
            productsTable.innerHTML = '<tr><td colspan="6">No products found</td></tr>';
            return;
        }

        productsTable.innerHTML = '';
        
        productsSnapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.imageUrl || 'https://via.placeholder.com/50'}" alt="${product.name}"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="action-btn edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            `;
            productsTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productsTable.innerHTML = '<tr><td colspan="6">Error loading products</td></tr>';
    }
}

// Open product modal for adding new product
const addProductBtn = document.getElementById('add-product-btn');
if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
        currentProductId = null;
        document.getElementById('modal-title').textContent = 'Add Product';
        document.getElementById('product-form').reset();
        document.getElementById('product-modal').style.display = 'block';
    });
}

// Close modal
const closeModal = document.querySelector('.close');
if (closeModal) {
    closeModal.addEventListener('click', () => {
        document.getElementById('product-modal').style.display = 'none';
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('product-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Edit product
async function editProduct(productId) {
    try {
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (!productDoc.exists) {
            showNotification('Product not found', 'error');
            return;
        }

        const product = productDoc.data();
        currentProductId = productId;

        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = productId;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.imageUrl || '';

        document.getElementById('product-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Error loading product', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await db.collection('products').doc(productId).delete();
        showNotification('Product deleted successfully', 'success');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

// Handle product form submission
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);
        const imageUrl = document.getElementById('product-image').value;
        const imageFile = document.getElementById('product-image-file').files[0];

        let finalImageUrl = imageUrl;

        try {
            // Upload image if file is selected
            if (imageFile) {
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`products/${Date.now()}_${imageFile.name}`);
                await imageRef.put(imageFile);
                finalImageUrl = await imageRef.getDownloadURL();
            }

            const productData = {
                name: name,
                description: description,
                category: category,
                price: price,
                stock: stock,
                imageUrl: finalImageUrl || 'https://via.placeholder.com/300',
                featured: false,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (currentProductId) {
                // Update existing product
                await db.collection('products').doc(currentProductId).update(productData);
                showNotification('Product updated successfully', 'success');
            } else {
                // Add new product
                productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('products').add(productData);
                showNotification('Product added successfully', 'success');
            }

            document.getElementById('product-modal').style.display = 'none';
            loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Error saving product', 'error');
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadProducts);
