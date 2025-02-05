if(getAuthToken()) {
    window.location.href = "./admin.html"
    // setAuthToken(null);
}

// Function to handle Google Sign-In response
function handleCredentialResponse(response) {
    console.log(response.credential)
    apiRequest('/user/gauth', {
        method: 'POST',
        body: { token: response.credential },
    }, false)
    .then(response => {
        console.log(response.data.access_token)
        setAuthToken(response.data.access_token);
        console.log('Google Sign-In successful');
        window.location.href = 'admin.html';
    })
    .catch(error => {
        console.error('Google Sign-In error:', error);
        alert('Google Sign-In failed: ' + error.message);
    });
}
