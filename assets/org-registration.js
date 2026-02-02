// assets/org-registration.js - Organization user registration logic

document.addEventListener('DOMContentLoaded', function() {
  // Get form and button references
  const orgForm = document.getElementById('form-organization');
  const orgSubmitBtn = document.getElementById('org-register-btn');
  const orgErrorContainer = document.getElementById('org-error');

  // Handle form submission
  if (orgForm) {
    orgForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleOrganizationRegistration();
    });
  }

  // Allow registration on Ctrl+Enter
  const orgInputs = orgForm ? orgForm.querySelectorAll('input, textarea, select') : [];
  orgInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleOrganizationRegistration();
      }
    });
  });
});

/**
 * Handle organization registration
 */
function handleOrganizationRegistration() {
  // Get form elements - Organization details
  const orgName = document.getElementById('org-name').value.trim();
  const website = document.getElementById('org-website').value.trim();
  const industry = document.getElementById('org-industry').value;
  const companySize = document.getElementById('org-size').value;

  // Contact person details
  const contactFirstName = document.getElementById('org-contact-firstName').value.trim();
  const contactLastName = document.getElementById('org-contact-lastName').value.trim();
  const contactEmail = document.getElementById('org-contact-email').value.trim();
  const contactPhone = document.getElementById('org-contact-phone').value.trim();

  // Credentials
  const password = document.getElementById('org-password').value;
  const confirmPassword = document.getElementById('org-confirmPassword').value;
  const termsCheckbox = document.getElementById('org-terms');

  const errorContainer = document.getElementById('org-error');
  const successContainer = document.getElementById('org-success');

  // Reset messages
  if (errorContainer) errorContainer.style.display = 'none';
  if (successContainer) successContainer.style.display = 'none';

  // Validation
  const validation = validateOrganizationForm(
    orgName, website, industry, companySize,
    contactFirstName, contactLastName, contactEmail, contactPhone,
    password, confirmPassword, termsCheckbox
  );

  if (!validation.valid) {
    showError(validation.message, errorContainer);
    return;
  }

  // All validation passed
  try {
    const orgData = {
      organization: {
        name: sanitizeInput(orgName),
        website: sanitizeInput(website),
        industry: sanitizeInput(industry),
        companySize: sanitizeInput(companySize)
      },
      primaryContact: {
        firstName: sanitizeInput(contactFirstName),
        lastName: sanitizeInput(contactLastName),
        email: sanitizeInput(contactEmail),
        phone: sanitizeInput(contactPhone)
      },
      password: password, // In production, hash before storage
      role: 'admin' // Primary contact is admin
    };

    const result = storeUser(orgData, 'organization');

    if (result.success) {
      // Show success message
      if (successContainer) {
        successContainer.innerHTML = `
          <strong>Success!</strong> Organization registered successfully!<br/>
          Welcome ${contactFirstName}! A verification link has been sent to ${contactEmail}.<br/>
          Redirecting to dashboard...
        `;
        successContainer.style.display = 'block';
      }

      // Redirect after a short delay
      setTimeout(() => {
        redirectToDashboard();
      }, 3000);
    } else {
      showError(result.message, errorContainer);
    }
  } catch (error) {
    showError('An unexpected error occurred. Please try again.', errorContainer);
    console.error('Organization registration error:', error);
  }
}

/**
 * Validate organization registration form
 */
function validateOrganizationForm(orgName, website, industry, companySize, 
                                  contactFirstName, contactLastName, contactEmail, contactPhone,
                                  password, confirmPassword, termsCheckbox) {
  
  // Organization details validation
  if (!orgName) {
    return { valid: false, message: 'Organization name is required.' };
  }

  if (orgName.length < 2) {
    return { valid: false, message: 'Organization name must be at least 2 characters.' };
  }

  if (!website) {
    return { valid: false, message: 'Website URL is required.' };
  }

  if (!isValidUrl(website)) {
    return { valid: false, message: 'Please enter a valid website URL (e.g., https://example.com).' };
  }

  if (!industry) {
    return { valid: false, message: 'Please select an industry.' };
  }

  if (!companySize) {
    return { valid: false, message: 'Please select company size.' };
  }

  // Contact person validation
  if (!contactFirstName) {
    return { valid: false, message: 'Primary contact first name is required.' };
  }

  if (!contactLastName) {
    return { valid: false, message: 'Primary contact last name is required.' };
  }

  if (!contactEmail) {
    return { valid: false, message: 'Primary contact email is required.' };
  }

  if (!isValidEmail(contactEmail)) {
    return { valid: false, message: 'Please enter a valid email address for primary contact.' };
  }

  if (!contactPhone) {
    return { valid: false, message: 'Primary contact phone number is required.' };
  }

  if (!isValidPhone(contactPhone)) {
    return { valid: false, message: 'Please enter a valid phone number.' };
  }

  // Credentials validation
  if (!password) {
    return { valid: false, message: 'Password is required.' };
  }

  if (!isValidPassword(password)) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters and include uppercase, lowercase, and number.' 
    };
  }

  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password.' };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match.' };
  }

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
