/**
 * User Access Management - Shared JavaScript Utilities
 */

// Mobile sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('uamSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggle = document.getElementById('sidebarToggle');

  if (toggle && sidebar && backdrop) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });
  }

  // Update user info in navbar
  updateNavbarUser();
});

function updateNavbarUser() {
  const user = UAMData.getCurrentUser();
  const userNameEl = document.getElementById('currentUserName');
  if (userNameEl && user) {
    userNameEl.textContent = user.name || user.email;
  }
}

// HTML escaping
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Format date with time
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Relative time (e.g., "2 hours ago")
function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

// Get user initials
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Get subscription portal role display info
function getPortalRoleInfo(role) {
  const roles = {
    'subscription_global_admin': {
      label: 'Global Admin',
      badge: 'global-admin',
      icon: 'bi-shield-fill-check',
      color: 'danger'
    },
    'subscription_global_analyst': {
      label: 'Global Analyst',
      badge: 'global-analyst',
      icon: 'bi-eye',
      color: 'info'
    },
    'subscription_regional_manager': {
      label: 'Regional Manager',
      badge: 'regional-manager',
      icon: 'bi-geo-alt-fill',
      color: 'warning'
    },
    'subscription_regional_analyst': {
      label: 'Regional Analyst',
      badge: 'regional-analyst',
      icon: 'bi-binoculars',
      color: 'primary'
    }
  };
  return roles[role] || null;
}

// Render subscription portal badge HTML
function renderPortalBadge(role) {
  const info = getPortalRoleInfo(role);
  if (!info) {
    return '<span class="badge bg-secondary-subtle text-secondary"><i class="bi bi-dash-circle me-1"></i>No Portal Access</span>';
  }
  return `<span class="access-badge ${info.badge}"><i class="bi ${info.icon}"></i>${info.label}</span>`;
}

// Render platform access badges (web & mobile)
function renderPlatformAccess(user) {
  const webAccess = user.platformWebAccess !== false;
  const mobileAccess = user.platformMobileAccess !== false;
  
  let badges = [];
  if (webAccess) {
    badges.push('<span class="badge bg-primary-subtle text-primary me-1"><i class="bi bi-globe me-1"></i>Web</span>');
  }
  if (mobileAccess) {
    badges.push('<span class="badge bg-success-subtle text-success"><i class="bi bi-phone me-1"></i>Mobile</span>');
  }
  if (!webAccess && !mobileAccess) {
    return '<span class="badge bg-danger-subtle text-danger"><i class="bi bi-x-circle me-1"></i>No Platform Access</span>';
  }
  return badges.join('');
}

// Legacy support - alias for backward compatibility
function getAccessLevelInfo(accessLevel) {
  return getPortalRoleInfo(accessLevel);
}

function renderAccessBadge(accessLevel) {
  return renderPortalBadge(accessLevel);
}

// Render country tags
function renderCountryTags(countries, limit = 3) {
  if (!countries || countries.length === 0) {
    return '<span class="text-secondary small">-</span>';
  }
  
  const visible = countries.slice(0, limit);
  const remaining = countries.length - limit;
  
  let html = visible.map(c => `<span class="country-tag"><i class="bi bi-geo-alt"></i>${escapeHtml(c)}</span>`).join('');
  
  if (remaining > 0) {
    html += `<span class="country-tag">+${remaining} more</span>`;
  }
  
  return html;
}

// Render status indicator
function renderStatus(status) {
  const statusMap = {
    'active': { class: 'active', label: 'Active' },
    'pending': { class: 'pending', label: 'Pending' },
    'inactive': { class: 'inactive', label: 'Inactive' }
  };
  const s = statusMap[status] || statusMap['inactive'];
  return `<span class="d-flex align-items-center gap-1"><span class="status-dot ${s.class}"></span>${s.label}</span>`;
}

// Toast notification
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  const toast = document.createElement('div');
  toast.className = `toast show align-items-center text-bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi ${icons[type] || icons.info} me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 150);
  }, 4000);

  // Manual dismiss
  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 150);
  });
}

// Confirm dialog
function confirmAction(message) {
  return confirm(message);
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'danger');
  });
}

// URL parameter helper
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Debounce function
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

// Logout function
function logout() {
  UAMData.logout();
  window.location.href = 'signin.html';
}

// Console branding
console.log('%cFC User Access Management', 'font-size: 20px; font-weight: bold; color: #6f42c1;');
console.log('%cManage platform access privileges', 'font-size: 12px; color: #6b7280;');
