const BASE_URL = 'https://vfast-backend-16dd4b0bfa8f.herokuapp.com/api/v1';
// const BASE_URL = 'https://ec2-15-207-110-230.ap-south-1.compute.amazonaws.com/api/v1';
// const BASE_URL = 'https://e86a-103-144-92-171.ngrok-free.app/api/v1';

/**
 * Set the authentication token.
 * @param {string} token - The OAuth2 token.
 */
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Get the current authentication token.
 * @returns {string|null} The OAuth2 token.
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Clear the authentication token.
 */
function clearAuthToken(token) {
    localStorage.removeItem('authToken');
}

async function apiRequest(endpoint, options = {}, requiresAuth = false) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const authToken = getAuthToken();
    if (requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log("ApiRequest - ", url);

    const fetchOptions = {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    };

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                errorMessage = JSON.stringify(errorData.detail);
            }
        } catch (e) {
            console.log(e);
        }
        throw new Error(errorMessage);
    }
    // Handle HTTP 204 No Content
    if (response.status === 204) {
        return {};
    }
    return await response.json();
}
