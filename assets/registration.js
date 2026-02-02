// assets/registration.js - Individual user registration logic

document.addEventListener('DOMContentLoaded', function() {
  // Get form and button references
  const indivForm = document.getElementById('form-individual');
  const indivSubmitBtn = document.getElementById('indiv-register-btn');
  const indivErrorContainer = document.getElementById('indiv-error');

  // Handle form submission
  if (indivForm) {
    indivForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleIndividualRegistration();
    });
  }

  // Allow registration on Ctrl+Enter in any field
  const indivInputs = indivForm ? indivForm.querySelectorAll('input, textarea') : [];
  indivInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleIndividualRegistration();
      }
    });
  });
});

/**
 * Handle individual user registration
 */
function handleIndividualRegistration() {
  // Get form elements
  const firstName = document.getElementById('indiv-firstName').value.trim();
  const lastName = document.getElementById('indiv-lastName').value.trim();
  const email = document.getElementById('indiv-email').value.trim();
  const password = document.getElementById('indiv-password').value;
  const confirmPassword = document.getElementById('indiv-confirmPassword').value;
  const termsCheckbox = document.getElementById('indiv-terms');
  const errorContainer = document.getElementById('indiv-error');
  const successContainer = document.getElementById('indiv-success');

  // Reset messages
  if (errorContainer) errorContainer.style.display = 'none';
  if (successContainer) successContainer.style.display = 'none';

  // Validation
  const validation = validateIndividualForm(firstName, lastName, email, password, confirmPassword, termsCheckbox);
  
  if (!validation.valid) {
    showError(validation.message, errorContainer);
    return;
  }

  // All validation passed
  try {
    const userData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email),
      password: password // In production, this should be hashed before storage
    };

    const result = storeUser(userData, 'individual');

    if (result.success) {
      // Show success message
      if (successContainer) {
        successContainer.innerHTML = `<strong>Success!</strong> Welcome ${firstName}! You're all set. Redirecting to dashboard...`;
        successContainer.style.display = 'block';
      }
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        redirectToDashboard();
      }, 2000);
    } else {
      showError(result.message, errorContainer);
    }
  } catch (error) {
    showError('An unexpected error occurred. Please try again.', errorContainer);
    console.error('Registration error:', error);
  }
}

/**
 * Validate individual registration form
 */
function validateIndividualForm(firstName, lastName, email, password, confirmPassword, termsCheckbox) {
  // Check empty fields
  if (!firstName) {
    return { valid: false, message: 'First name is required.' };
  }
  
  if (!lastName) {
    return { valid: false, message: 'Last name is required.' };
  }

  if (!email) {
    return { valid: false, message: 'Email is required.' };
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  if (!password) {
    return { valid: false, message: 'Password is required.' };
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters and include uppercase, lowercase, and number.' 
    };
  }

  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password.' };
  }

  // Check password match
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match.' };
  }

  // Check terms
  if (!termsCheckbox || !termsCheckbox.checked) {
    return { valid: false, message: 'You must agree to the terms and conditions.' };
  }

  return { valid: true };
}

/**
 * Show error message
 */
function showError(message, container) {
  if (container) {
    container.innerHTML = `<strong>Error:</strong> ${message}`;
    container.style.display = 'block';
  }
}
