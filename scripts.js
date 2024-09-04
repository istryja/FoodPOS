document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Example: Hardcoded credentials (replace this with an actual backend or Google Script)
    const validUsername = 'admin';
    const validPassword = 'password123';
  
    if (username === validUsername && password === validPassword) {
      window.location.href = 'dashboard.html'; // Redirect to the dashboard on successful login
    } else {
      document.getElementById('error-message').textContent = 'Invalid credentials, please try again.';
    }
  });
  