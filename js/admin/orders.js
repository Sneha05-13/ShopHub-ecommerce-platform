// Admin Orders Management JavaScript

// Load all orders
async function loadOrders() {
    const ordersTable = document.getElementById('orders-table');
    if (!ordersTable) return;

    ordersTable.innerHTML = '<tr><td colspan="7">Loading orders...</td></tr>';

    try {
        const ordersSnapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        if (ordersSnapshot.empty) {
            ordersTable.innerHTML = '<tr><td colspan="7">No orders found</td></tr>';
            return;
        }

        ordersTable.innerHTML = '';
        
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
                <td>${order.items.length}</td>
                <td>${formatCurrency(order.total)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>
                    <button class="action-btn view" onclick="viewOrder('${order.id}')">View</button>
                    <button class="action-btn edit" onclick="updateOrderStatus('${order.id}')">Update Status</button>
                </td>
            `;
            ordersTable.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersTable.innerHTML = '<tr><td colspan="7">Error loading orders</td></tr>';
    }
}

// View order details
async function viewOrder(orderId) {
    try {
        const orderDoc = await db.collection('orders').doc(orderId).get();
        
        if (!orderDoc.exists) {
            showNotification('Order not found', 'error');
            return;
        }

        const order = { id: orderDoc.id, ...orderDoc.data() };
        
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

        // Build items list
        let itemsHTML = '<div class="order-items-list">';
        order.items.forEach(item => {
            itemsHTML += `
                <div class="order-item-detail">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
            `;
        });
        itemsHTML += '</div>';

        const orderDetailsDiv = document.getElementById('order-details');
        orderDetailsDiv.innerHTML = `
            <div class="order-details-info">
                <p><strong>Order ID:</strong> #${order.id}</p>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${order.userEmail}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
            </div>
            <h3>Items</h3>
            ${itemsHTML}
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ecf0f1;">
                <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}</p>
                <p><strong>Tax:</strong> ${formatCurrency(order.tax)}</p>
                <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
            </div>
        `;

        document.getElementById('order-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading order:', error);
        showNotification('Error loading order details', 'error');
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    const newStatus = prompt('Enter new status (pending, completed, cancelled):');
    
    if (!newStatus || !['pending', 'completed', 'cancelled'].includes(newStatus.toLowerCase())) {
        showNotification('Invalid status', 'error');
        return;
    }

    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus.toLowerCase(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotification('Order status updated', 'success');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status', 'error');
    }
}

// Close modal
const closeModal = document.querySelector('.close');
if (closeModal) {
    closeModal.addEventListener('click', () => {
        document.getElementById('order-modal').style.display = 'none';
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('order-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', loadOrders);
