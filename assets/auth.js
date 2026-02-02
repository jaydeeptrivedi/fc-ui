// assets/auth.js - Shared authentication utilities

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
function isValidPassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate phone number (basic international format)
 */
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Store user data in localStorage (demo only - replace with API calls in production)
 */
function storeUser(userData, type) {
  try {
    const users = JSON.parse(localStorage.getItem('fc_users')) || [];
    
    // Check if user already exists
    if (users.some(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered.' };
    }
    
    // Add user with type and timestamp
    const newUser = {
      ...userData,
      type, // 'individual' or 'organization'
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
      isVerified: false
    };
    
    users.push(newUser);
    localStorage.setItem('fc_users', JSON.stringify(users));
    
    // Also set current user session
    localStorage.setItem('fc_currentUser', JSON.stringify(newUser));
    
    return { success: true, message: 'Account created successfully!', user: newUser };
  } catch (error) {
    return { success: false, message: 'Error storing user data: ' + error.message };
  }
}

/**
 * Get current logged-in user
 */
function getCurrentUser() {
  try {
    const userJson = localStorage.getItem('fc_currentUser');
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Logout user
 */
function logoutUser() {
  localStorage.removeItem('fc_currentUser');
}

/**
 * Redirect to dashboard
 */
function redirectToDashboard() {
  window.location.href = './index.html';
}
