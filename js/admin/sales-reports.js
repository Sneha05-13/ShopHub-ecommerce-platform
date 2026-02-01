// Admin Sales Reports JavaScript

// Load sales statistics
async function loadSalesStats() {
    try {
        const ordersSnapshot = await db.collection('orders').get();
        
        if (ordersSnapshot.empty) {
            document.getElementById('total-sales').textContent = '$0.00';
            document.getElementById('total-orders-count').textContent = '0';
            document.getElementById('average-order-value').textContent = '$0.00';
            document.getElementById('products-sold').textContent = '0';
            console.log('No orders found for sales stats');
            return;
        }

        let totalSales = 0;
        let totalOrders = ordersSnapshot.size;
        let totalProductsSold = 0;

        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            totalSales += order.total || 0;
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    totalProductsSold += item.quantity || 0;
                });
            }
        });

        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        document.getElementById('total-sales').textContent = formatCurrency(totalSales);
        document.getElementById('total-orders-count').textContent = totalOrders;
        document.getElementById('average-order-value').textContent = formatCurrency(averageOrderValue);
        document.getElementById('products-sold').textContent = totalProductsSold;

    } catch (error) {
        console.error('Error loading sales stats:', error);
        document.getElementById('total-sales').textContent = 'Error';
        document.getElementById('total-orders-count').textContent = 'Error';
        document.getElementById('average-order-value').textContent = 'Error';
        document.getElementById('products-sold').textContent = 'Error';
    }
}

// Load sales by category
async function loadSalesByCategory() {
    const categorySalesTable = document.getElementById('category-sales');
    if (!categorySalesTable) return;

    categorySalesTable.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    try {
        const ordersSnapshot = await db.collection('orders').get();
        
        if (ordersSnapshot.empty) {
            categorySalesTable.innerHTML = '<tr><td colspan="3">No sales data available</td></tr>';
            console.log('No orders found for category sales');
            return;
        }
        
        const categoryData = {};

        // Aggregate sales by category
        for (const orderDoc of ordersSnapshot.docs) {
            const order = orderDoc.data();
            
            if (!order.items || !Array.isArray(order.items)) {
                console.log('Order has no valid items:', orderDoc.id);
                continue;
            }
            
            for (const item of order.items) {
                // Get product details to find category
                try {
                    const productDoc = await db.collection('products').doc(item.productId).get();
                    if (productDoc.exists) {
                        const product = productDoc.data();
                        const category = product.category || 'Other';
                        
                        if (!categoryData[category]) {
                            categoryData[category] = {
                                units: 0,
                                revenue: 0
                            };
                        }
                        
                        categoryData[category].units += item.quantity || 0;
                        categoryData[category].revenue += (item.price || 0) * (item.quantity || 0);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                }
            }
        }

        if (Object.keys(categoryData).length === 0) {
            categorySalesTable.innerHTML = '<tr><td colspan="3">No sales data available</td></tr>';
            return;
        }

        categorySalesTable.innerHTML = '';
        
        // Sort by revenue
        const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1].revenue - a[1].revenue);

        sortedCategories.forEach(([category, data]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                <td>${data.units}</td>
                <td>${formatCurrency(data.revenue)}</td>
            `;
            categorySalesTable.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading category sales:', error);
        categorySalesTable.innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
    }
}

// Load top selling products
async function loadTopProducts() {
    const topProductsTable = document.getElementById('top-products');
    if (!topProductsTable) return;

    topProductsTable.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    try {
        const ordersSnapshot = await db.collection('orders').get();
        
        if (ordersSnapshot.empty) {
            topProductsTable.innerHTML = '<tr><td colspan="3">No sales data available</td></tr>';
            console.log('No orders found for top products');
            return;
        }
        
        const productData = {};

        // Aggregate sales by product
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            
            if (!order.items || !Array.isArray(order.items)) {
                console.log('Order has no valid items:', doc.id);
                return;
            }
            
            order.items.forEach(item => {
                if (!item.productId) {
                    console.log('Item has no productId:', item);
                    return;
                }
                
                if (!productData[item.productId]) {
                    productData[item.productId] = {
                        name: item.name || 'Unknown Product',
                        units: 0,
                        revenue: 0
                    };
                }
                
                productData[item.productId].units += item.quantity || 0;
                productData[item.productId].revenue += (item.price || 0) * (item.quantity || 0);
            });
        });

        if (Object.keys(productData).length === 0) {
            topProductsTable.innerHTML = '<tr><td colspan="3">No sales data available</td></tr>';
            return;
        }

        topProductsTable.innerHTML = '';
        
        // Sort by revenue and take top 10
        const sortedProducts = Object.entries(productData)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 10);

        sortedProducts.forEach(([productId, data]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.units}</td>
                <td>${formatCurrency(data.revenue)}</td>
            `;
            topProductsTable.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading top products:', error);
        topProductsTable.innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadSalesStats();
    loadSalesByCategory();
    loadTopProducts();
});
