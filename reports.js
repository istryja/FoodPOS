// Fetch and display sales based on date range
function fetchSalesData(startDate, endDate) {
    let totalSales = 0;
  
    // Firestore query to get orders between startDate and endDate
    db.collection('orders')
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          totalSales += doc.data().total;  // Sum total sales
        });
        
        document.getElementById('totalSales').textContent = `$${totalSales.toFixed(2)}`;
        
        // Load sales chart
        loadSalesChart(totalSales);
      })
      .catch((error) => {
        console.error('Error fetching sales data:', error);
      });
  }
  
  // Load sales chart using Chart.js
  function loadSalesChart(totalSales) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Sales'],
        datasets: [{
          label: 'Total Sales',
          data: [totalSales],
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Fetch top selling items based on date range
  function fetchTopSellingItems(startDate, endDate) {
    db.collection('orders')
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get().then((snapshot) => {
      const itemSales = {};
  
      snapshot.forEach((doc) => {
        const items = doc.data().items;
  
        // Tally up sales per item
        items.forEach((item) => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = 0;
          }
          itemSales[item.name] += 1;  // Count how many times each item was ordered
        });
      });
  
      // Sort items by the number of sales
      const sortedItems = Object.keys(itemSales).sort((a, b) => itemSales[b] - itemSales[a]);
  
      // Display top 5 selling items
      const topSellingItemsList = document.getElementById('topSellingItems');
      topSellingItemsList.innerHTML = sortedItems.slice(0, 5).map(itemName => `
        <li>${itemName} - ${itemSales[itemName]} sales</li>
      `).join('');
    });
  }
  
  // Fetch low stock inventory items
  function fetchLowStockItems() {
    const lowStockThreshold = 5;  // Customize as needed
    
    db.collection('inventory').where('stock', '<=', lowStockThreshold).get()
      .then((snapshot) => {
        const lowStockList = document.getElementById('inventoryStatus');
        
        if (snapshot.empty) {
          lowStockList.innerHTML = '<li>All stock levels are good.</li>';
        } else {
          lowStockList.innerHTML = snapshot.docs.map(doc => `
            <li>${doc.data().name} - ${doc.data().stock} remaining</li>
          `).join('');
        }
      })
      .catch((error) => {
        console.error('Error fetching low stock items:', error);
      });
  }
  
  // Initialize the reports page
  function initReports() {
    const today = new Date();
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
  
    // Default to today's date if no date is selected
    startDateInput.valueAsDate = today;
    endDateInput.valueAsDate = today;
  
    const startDate = startDateInput.value ? new Date(startDateInput.value) : today;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : today;
  
    fetchSalesData(startDate, endDate);
    fetchTopSellingItems(startDate, endDate);
    fetchLowStockItems();
  }
  
  // Add event listener for filtering by date
  document.getElementById('filterBtn').addEventListener('click', () => {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    fetchSalesData(startDate, endDate);
    fetchTopSellingItems(startDate, endDate);
  });
  
  // Load the reports when the page is loaded
  window.onload = initReports;
  
  // Back to dashboard functionality
  document.getElementById('backToDashboardBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  