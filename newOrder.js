let order = [];  // Array to hold the selected items
let totalCost = 0;  // Variable to track the total cost

// Function to load menu items from Firestore and display them
function loadMenuItems() {
  const menuList = document.getElementById('menuItems');

  // Fetch menu items from Firestore (assumes "inventory" collection exists)
  db.collection('inventory').get().then((snapshot) => {
    if (snapshot.empty) {
      menuList.innerHTML = '<p>No menu items available</p>';
    } else {
      menuList.innerHTML = snapshot.docs.map(doc => {
        const item = doc.data();
        return `
          <li>
            ${item.name} - $${item.price.toFixed(2)} (Stock: ${item.stock})
            ${item.stock > 0 ? `<button onclick="addItemToOrder('${doc.id}', '${item.name}', ${item.price})">Add</button>` : '<span>Out of stock</span>'}
          </li>
        `;
      }).join('');
    }
  }).catch((error) => {
    console.error('Error loading menu items:', error);
    menuList.innerHTML = '<p>Error loading menu items</p>';
  });
}

// Function to add item to the order
function addItemToOrder(id, name, price) {
  order.push({ id, name, price });
  totalCost += price;
  updateOrderSummary();
}

// Function to update the order summary
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

// Function to remove an item from the order
function removeItemFromOrder(index) {
  totalCost -= order[index].price;
  order.splice(index, 1);
  updateOrderSummary();
}

// Complete the order and store it in Firestore
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
  
      // Store the order in Firestore
      db.collection('orders').add(orderData)
        .then(() => {
          alert('Order completed successfully');
  
          // Reduce stock in inventory for each item in the order
          order.forEach(item => {
            const itemId = item.id;
  
            // Fetch the current stock level from Firestore
            db.collection('inventory').doc(itemId).get().then((doc) => {
              if (doc.exists) {
                const currentStock = doc.data().stock;
  
                // Update the stock level (subtract 1 for each item ordered)
                db.collection('inventory').doc(itemId).update({
                  stock: currentStock - 1
                }).then(() => {
                  console.log(`Stock updated for ${item.name}`);
                }).catch((error) => {
                  console.error(`Error updating stock for ${item.name}:`, error);
                });
              }
            });
          });
  
          // Clear the order and reset the UI
          order = [];
          totalCost = 0;
          updateOrderSummary();  // Update the summary display after clearing the order
        })
        .catch((error) => {
          console.error('Error saving order to Firestore:', error);
          alert('Error completing order. Please try again.');
        });
    }
  });
  

// Load menu items when the page loads
window.onload = loadMenuItems;

// Back to dashboard button functionality
document.getElementById('backToDashboardBtn').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});
