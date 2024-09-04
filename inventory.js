// Initialize Firebase Firestore reference for inventory collection
const inventoryRef = db.collection('inventory');

// Function to display inventory items
function displayInventory(items) {
  const inventoryList = document.getElementById('inventoryList');
  inventoryList.innerHTML = items.map(item => `
    <li>
      ${item.name} - $${item.price.toFixed(2)} (Stock: ${item.stock})
      <button onclick="deleteItem('${item.id}')">Delete</button>
      <button onclick="updateStock('${item.id}', ${item.stock})">Update Stock</button>
    </li>
  `).join('');
}

// Fetch and display inventory from Firestore
function loadInventory() {
  inventoryRef.get().then(snapshot => {
    const inventoryItems = [];
    snapshot.forEach(doc => {
      inventoryItems.push({ id: doc.id, ...doc.data() });
    });
    displayInventory(inventoryItems);
  }).catch(error => {
    console.error('Error loading inventory:', error);
  });
}

// Function to add new inventory item
document.getElementById('addInventoryForm').addEventListener('submit', (event) => {
    event.preventDefault();
  
    const itemName = document.getElementById('itemName').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemStock = parseInt(document.getElementById('itemStock').value);
  
    const newItem = {
      name: itemName,
      price: itemPrice,
      stock: itemStock
    };
  
    inventoryRef.add(newItem)
      .then(() => {
        alert('Item added successfully');
        document.getElementById('addInventoryForm').reset();
        loadInventory();  // Reload the updated inventory list
  
        // Show confirmation message
        const confirmationMessage = document.createElement('div');
        confirmationMessage.className = 'confirmation';
        confirmationMessage.textContent = 'Item added successfully!';
        document.querySelector('.add-inventory').appendChild(confirmationMessage);
  
        // Remove the confirmation message after 3 seconds
        setTimeout(() => {
          confirmationMessage.remove();
        }, 3000);
      })
      .catch(error => {
        console.error('Error adding item to inventory:', error);
      });
  });
  

// Function to delete inventory item
function deleteItem(itemId) {
  inventoryRef.doc(itemId).delete()
    .then(() => {
      alert('Item deleted successfully');
      loadInventory();
    })
    .catch(error => {
      console.error('Error deleting item:', error);
    });
}

// Function to update stock quantity
function updateStock(itemId, currentStock) {
  const newStock = prompt('Enter new stock quantity:', currentStock);
  
  if (newStock !== null && !isNaN(newStock)) {
    inventoryRef.doc(itemId).update({ stock: parseInt(newStock) })
      .then(() => {
        alert('Stock updated successfully');
        loadInventory();
      })
      .catch(error => {
        console.error('Error updating stock:', error);
      });
  }
}

// Load inventory when the page loads
window.onload = loadInventory;

// Back to dashboard
document.getElementById('backToDashboardBtn').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});
