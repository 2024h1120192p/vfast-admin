// vfast-adminAuth.js
import { apiRequest, setAuthToken } from './vfast-apiClient.js';

/**
 * Admin Login
 * @param {object} credentials - The login credentials.
 * @param {string} credentials.username - The admin username.
 * @param {string} credentials.password - The admin password.
 * @returns {Promise<object>} The response data.
 */
export async function adminLogin(credentials) {
    const response = await apiRequest('/api/v1/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }, false);
    // Assuming the token is returned in the response, set it
    if (response.token) {
        setAuthToken(response.token);
    }
    return response;
}

/**
 * Verify Admin OTP
 * @param {object} otpData - The OTP data.
 * @param {string} otpData.otp - The OTP code.
 * @returns {Promise<object>} The response data.
 */
export async function verifyAdminOtp(otpData) {
    const response = await apiRequest('/api/v1/admin/verify-otp', {
        method: 'POST',
        body: JSON.stringify(otpData),
    }, true);
    return response;
}

/**
 * Admin Google Authentication
 * @param {object} gAuthData - The Google Auth data.
 * @param {string} gAuthData.token - The Google Auth token.
 * @returns {Promise<object>} The response data.
 */
export async function adminGAuth(gAuthData) {
    const response = await apiRequest('/api/v1/admin/gauth', {
        method: 'POST',
        body: JSON.stringify(gAuthData),
    }, false);
    // Assuming the token is returned in the response, set it
    if (response.token) {
        setAuthToken(response.token);
    }
    return response;
}
