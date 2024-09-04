db.collection('orders').where('status', '==', 'Pending')
  .onSnapshot((snapshot) => {
    const activeOrders = [];
    snapshot.forEach((doc) => {
      activeOrders.push({ id: doc.id, ...doc.data() });
    });
    updateDashboard(activeOrders);
  });

function updateDashboard(activeOrders) {
  const orderList = document.getElementById('orderList');
  if (activeOrders.length > 0) {
    orderList.innerHTML = activeOrders.map(order => `
      <li>
        Order ID: ${order.id} - $${order.total.toFixed(2)}
        <button onclick="updateOrderStatus('${order.id}', 'Completed')">Complete</button>
      </li>
    `).join('');
  } else {
    orderList.innerHTML = '<li>No active orders</li>';
  }

  // Update sales summary
  let salesToday = 0;
  let totalOrders = activeOrders.length;
  activeOrders.forEach(order => {
    salesToday += order.total;
  });
  document.getElementById('salesToday').textContent = `$${salesToday.toFixed(2)}`;
  document.getElementById('totalOrders').textContent = totalOrders;
}

// Update order status
function updateOrderStatus(orderId, status) {
  db.collection('orders').doc(orderId).update({ status })
    .then(() => {
      console.log(`Order ${orderId} marked as ${status}`);
    })
    .catch((error) => {
      console.error('Error updating order:', error);
    });
}
