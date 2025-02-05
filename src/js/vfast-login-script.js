// vfast-login-script.js
if(getAuthToken()) {
    window.location.href = "./dashboard.html"
    // setAuthToken(null);
}

// Function to handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    apiRequest('/user/login', {
        method: 'POST',
        body: {
            username: document.getElementById('email').value,
            password: document.getElementById('password').value
        },
    }, false)
    .then(function(response) {
        setAuthToken(response.token);
        
        // alert('Login successful');
        window.location.href = 'admin.html';
    })
    .catch(function(error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    });
});

// Function to handle Google Sign-In response
function handleCredentialResponse(response) {
    apiRequest('/user/gauth', {
        method: 'POST',
        body: { token: response.credential },
    }, false)
    .then(response => {
        setAuthToken(response.data.access_token);
        // alert('Google Sign-In successful');
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.error('Google Sign-In error:', error);
        alert('Google Sign-In failed: ' + error.message);
    });
}
