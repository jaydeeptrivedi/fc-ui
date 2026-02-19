/**
 * Admin Portal - Shared JavaScript Utilities
 */

// Auth check and UI initialization
document.addEventListener('DOMContentLoaded', () => {
  // Skip auth check on signin page
  if (window.location.pathname.includes('signin.html')) return;
  
  // Require authentication
  if (typeof AdminData !== 'undefined' && !AdminData.requireAuth()) return;
  
  // Initialize user UI
  initUserUI();
  
  // Apply role-based UI restrictions
  applyRoleRestrictions();
});

function initUserUI() {
  const user = AdminData.getCurrentUser();
  if (!user) return;
  
  // Update user dropdown in navbar
  const userDropdown = document.querySelector('.dropdown-toggle');
  if (userDropdown) {
    const roleBadge = AdminData.getRoleBadgeClass(user.role);
    const roleDisplay = AdminData.getRoleDisplayName(user.role);
    userDropdown.innerHTML = `
      <i class="bi bi-person-circle me-1"></i>${escapeHtml(user.name)}
      <span class="badge ${roleBadge} ms-1" style="font-size: 0.65rem;">${user.role.includes('Global') ? 'HQ' : 'Regional'}</span>
    `;
  }
  
  // Update dropdown menu with user info and logout
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (dropdownMenu) {
    const countriesText = user.countries && user.countries.length > 0 
      ? user.countries.join(', ') 
      : 'All Countries';
    dropdownMenu.innerHTML = `
      <li class="px-3 py-2">
        <div class="small text-secondary">Signed in as</div>
        <div class="fw-semibold">${escapeHtml(user.name)}</div>
        <div class="small"><span class="badge ${AdminData.getRoleBadgeClass(user.role)}">${AdminData.getRoleDisplayName(user.role)}</span></div>
        <div class="small text-secondary mt-1"><i class="bi bi-globe me-1"></i>${escapeHtml(countriesText)}</div>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" onclick="AdminData.logout(); return false;"><i class="bi bi-box-arrow-left me-2"></i>Sign Out</a></li>
    `;
  }
}

function applyRoleRestrictions() {
  const canEdit = AdminData.canEdit();
  
  // Hide create buttons for read-only users
  if (!canEdit) {
    document.querySelectorAll('[data-requires-edit], .btn-create, a[href*="edit-subscription.html"]:not([href*="?id="])').forEach(el => {
      if (!el.href || !el.href.includes('?id=')) {
        el.style.display = 'none';
      }
    });
    
    // Hide edit/delete action buttons
    document.querySelectorAll('.btn-edit, .btn-delete, [onclick*="delete"], [onclick*="Delete"]').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show read-only banner
    const main = document.querySelector('.admin-main');
    if (main && !document.querySelector('.readonly-banner')) {
      const banner = document.createElement('div');
      banner.className = 'readonly-banner alert alert-info alert-dismissible fade show mb-3 py-2';
      banner.innerHTML = `
        <i class="bi bi-eye me-2"></i><strong>Read-Only Mode</strong> - You have view-only access.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      main.insertBefore(banner, main.firstChild);
    }
  }
  
  // For regional users, add country filter indicator
  if (!AdminData.isGlobalRole()) {
    const countries = AdminData.getUserCountries();
    if (countries.length > 0) {
      const main = document.querySelector('.admin-main');
      if (main && !document.querySelector('.region-banner')) {
        const banner = document.createElement('div');
        banner.className = 'region-banner alert alert-secondary alert-dismissible fade show mb-3 py-2';
        banner.innerHTML = `
          <i class="bi bi-geo-alt me-2"></i><strong>Regional View:</strong> ${escapeHtml(countries.join(', '))}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        main.insertBefore(banner, main.firstChild);
      }
    }
  }
}

// Sidebar Toggle (for mobile)
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (sidebarToggle && sidebar && backdrop) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });

    // Close sidebar on nav link click (mobile)
    sidebar.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          sidebar.classList.remove('show');
          backdrop.classList.remove('show');
        }
      });
    });
  }
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show toast notification
function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `admin-toast toast show align-items-center text-bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${escapeHtml(message)}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Format currency
function formatCurrency(amount, currency = '€') {
  return `${currency}${parseFloat(amount).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Debounce function for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export data to JSON file
function exportDataToFile() {
  const data = AdminData.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fc-admin-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Data exported successfully', 'success');
}

// Import data from JSON file
function importDataFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      AdminData.importData(data);
      showToast('Data imported successfully', 'success');
      location.reload();
    } catch (err) {
      showToast('Invalid JSON file', 'danger');
    }
  };
  reader.readAsText(file);
}

// Confirm action with modal
function confirmAction(message, onConfirm) {
  if (confirm(message)) {
    onConfirm();
  }
}

// Print current page
function printPage() {
  window.print();
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  } catch (err) {
    showToast('Failed to copy', 'danger');
  }
}

// Generate unique ID
function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check if date is valid
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Get relative time (e.g., "2 days ago")
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Sort array by property
function sortBy(array, property, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Filter array by multiple criteria
function filterBy(array, filters) {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
    });
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save (prevent default)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    // Could trigger save action if form is open
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      const instance = bootstrap.Modal.getInstance(modal);
      if (instance) instance.hide();
    });
  }
});

// Initialize tooltips
document.addEventListener('DOMContentLoaded', () => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
});

// Console info
console.log('%cFC Admin Portal', 'font-size: 20px; font-weight: bold; color: #0d6efd;');
console.log('%cManage products, subscriptions, and promo codes', 'font-size: 12px; color: #6c757d;');
