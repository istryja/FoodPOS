let order = [];  // Declare the order array
let totalCost = 0;  // Declare the total cost

// Function to add item to order
function addItemToOrder(id) {
  const item = menuItems.find(menuItem => menuItem.id === id);
  order.push(item);
  totalCost += item.price;
  updateOrderSummary();
}

// Function to update order summary display
function updateOrderSummary() {
  const orderSummary = document.getElementById('orderSummary');
  orderSummary.innerHTML = order.map((item, index) => `
    <li>
      ${item.name} - $${item.price.toFixed(2)}
      <button onclick="removeItemFromOrder(${index})">Remove</button>
    </li>
  `).join('');
  
  document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
}

// Function to remove item from order
function removeItemFromOrder(index) {
  totalCost -= order[index].price;
  order.splice(index, 1);
  updateOrderSummary();
}

// Order completion logic with Firestore integration
document.getElementById('completeOrderBtn').addEventListener('click', () => {
  if (order.length === 0) {
    alert('No items in the order');
  } else {
    const orderData = {
      items: order,  // The list of items in the order
      total: totalCost,  // Total cost of the order
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),  // Automatically get server time
      status: 'Pending'  // Set initial status to 'Pending'
    };

    console.log('Attempting to save order to Firestore:', orderData);

    // Store the order in Firestore
    db.collection('orders').add(orderData)
      .then(() => {
        console.log('Order successfully saved:', order);
        order = [];
        totalCost = 0;
        updateOrderSummary();  // Update the summary display after clearing the order
        alert('Order completed successfully');
      })
      .catch((error) => {
        console.error('Error saving order to Firestore:', error);
        alert('Error completing order. Please try again.');
      });
  }
});
