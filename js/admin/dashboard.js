// Admin Dashboard JavaScript

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Get total products count
        const productsSnapshot = await db.collection('products').get();
        document.getElementById('total-products').textContent = productsSnapshot.size;

        // Get total orders count and revenue
        const ordersSnapshot = await db.collection('orders').get();
        document.getElementById('total-orders').textContent = ordersSnapshot.size;

        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            totalRevenue += order.total || 0;
        });
        document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);

        // Get total customers count
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'customer')
            .get();
        document.getElementById('total-customers').textContent = usersSnapshot.size;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recent orders
async function loadRecentOrders() {
    const recentOrdersTable = document.getElementById('recent-orders');
    if (!recentOrdersTable) return;

    recentOrdersTable.innerHTML = '<tr><td colspan="5">Loading orders...</td></tr>';

    try {
        const ordersSnapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        if (ordersSnapshot.empty) {
            recentOrdersTable.innerHTML = '<tr><td colspan="5">No orders found</td></tr>';
            return;
        }

        recentOrdersTable.innerHTML = '';
        
        for (const doc of ordersSnapshot.docs) {
            const order = { id: doc.id, ...doc.data() };
            
            let customerName = order.userEmail;
            try {
                const userDoc = await db.collection('users').doc(order.userId).get();
                if (userDoc.exists) {
                    customerName = userDoc.data().name || order.userEmail;
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }

            let orderDate = 'N/A';
            try {
                if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                    orderDate = order.createdAt.toDate().toLocaleDateString();
                } else if (order.createdAt instanceof Date) {
                    orderDate = order.createdAt.toLocaleDateString();
                }
            } catch (error) {
                console.error('Error parsing date:', error);
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${customerName}</td>
                <td>${orderDate}</td>
                <td>${formatCurrency(order.total)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
            `;
            recentOrdersTable.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        recentOrdersTable.innerHTML = '<tr><td colspan="5">Error loading orders</td></tr>';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecentOrders();
});
