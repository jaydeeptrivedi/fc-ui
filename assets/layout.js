// assets/layout.js

// Seed demo data for testing (ensure demo accounts always exist)
function seedDemoData() {
  try {
    const demoUsers = [
      {
        id: 'user_org_demo',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@abc.com',
        username: 'janedoe_admin',
        password: 'SecurePass123',
        type: 'organization',
        category: 'agriculture',
        focus: 'farmer',
        country: 'austria',
        language: 'english',
        organization: {
          name: 'abc Corporation',
          category: 'agriculture',
          focus: 'farmer'
        },
        primaryContact: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@abc.com',
          username: 'janedoe_admin',
          country: 'austria',
          language: 'english'
        },
        role: 'admin',
        createdAt: new Date().toISOString(),
        isVerified: true
      },
      {
        id: 'user_individual_demo',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        username: 'johnsmith_farmer',
        password: 'Password123',
        type: 'individual',
        category: 'agriculture',
        focus: 'farmer',
        country: 'austria',
        language: 'english',
        createdAt: new Date().toISOString(),
        isVerified: true
      }
    ];

    const usersJson = localStorage.getItem('fc_users');
    let users = usersJson ? JSON.parse(usersJson) : [];
    
    // Ensure demo accounts exist - replace them if they exist, add if missing
    const demoIds = ['user_org_demo', 'user_individual_demo'];
    demoIds.forEach(demoId => {
      const existingIndex = users.findIndex(u => u.id === demoId);
      const demoUser = demoUsers.find(u => u.id === demoId);
      
      if (existingIndex >= 0) {
        // Replace existing demo user with fresh data
        users[existingIndex] = demoUser;
      } else {
        // Add new demo user if missing
        users.push(demoUser);
      }
    });
    
    localStorage.setItem('fc_users', JSON.stringify(users));
    console.log('Demo users ensured - all demo accounts are available with correct credentials');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}

function initializeLayout() {
  // Wait for auth.js to load
  if (typeof getCurrentUser !== 'function') {
    setTimeout(initializeLayout, 100);
    return;
  }

  const page = document.documentElement.getAttribute('data-page') || '';
  const shell = document.getElementById('app-shell');
  if (!shell) return;

  // Get current user
  const currentUser = getCurrentUser();
  const userName = currentUser?.firstName || (currentUser?.primaryContact?.firstName) || 'User';
  const orgName = currentUser?.organization?.name || '';
  const isOrg = currentUser?.type === 'organization';
  const isLoggedIn = !!currentUser;

  shell.innerHTML = `
    <nav class="navbar navbar-expand topbar-brand navbar-dark sticky-top">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="./index.html">
          <span class="brand-badge">FC</span>
          <span>Platform</span>
        </a>
        ${isLoggedIn ? `
        <div class="ms-3 d-flex flex-column justify-content-center" style="flex: 1;">
          ${isOrg ? `<div class="text-white small fw-semibold">${orgName}</div>` : ''}
          <div class="text-light small">${userName}</div>
        </div>
        ` : ''}
        <div class="d-flex gap-2 align-items-center">
          <a href="./demo.html" class="btn btn-outline-light btn-sm">
            <i class="bi bi-arrow-left me-1"></i>Back to Demo Quicklinks
          </a>
          ${!isLoggedIn ? `
          <a class="btn btn-sm btn-outline-light" href="./registration.html" title="Create Account">
            <span style="font-size: 14px;">+ Sign Up</span>
          </a>
          ` : ''}
          ${isLoggedIn ? `
          <button class="btn btn-sm btn-outline-light" id="logoutBtn" type="button" title="Sign Out">Sign Out</button>
          ` : ''}
          <button class="btn btn-sm btn-outline-light" type="button" title="Notifications" aria-label="Notifications"><i class="bi bi-bell"></i></button>
          <button class="btn btn-sm btn-outline-light" type="button" title="Profile" aria-label="Profile"><i class="bi bi-person-circle"></i></button>
          <button class="btn btn-sm btn-outline-light" type="button" title="Settings" aria-label="Settings"><i class="bi bi-gear"></i></button>
        </div>
      </div>
    </nav>
  `;

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logoutUser();
      window.location.href = './signin.html';
    });
  }

  const sidebar = document.getElementById('sidebar-slot');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-rail d-flex flex-column align-items-center py-3 gap-2">
      ${navItem('licenses', 'bi-card-checklist', 'User Licenses', './index.html', page)}
      ${navItem('devices', 'bi-broadcast', 'Devices', '#', page)}
      ${navItem('api', 'bi-plug', 'API', '#', page)}
      ${isOrg ? navItem('users', 'bi-people', 'User Management', './user-management.html', page) : ''}
      <div class="flex-grow-1"></div>
      ${navItem('help', 'bi-question-circle', 'Help', '#', page)}
    </div>
  `;

  function navItem(key, icon, label, href, activePage) {
    const active = key === activePage ? 'btn-primary' : 'btn-outline-secondary';
    return `
      <a class="btn ${active} sidebar-btn d-flex align-items-center justify-content-center"
         href="${href}" aria-label="${label}" title="${label}">
        <i class="${icon}" style="font-size:18px;"></i>
      </a>
    `;
  }
}

// Confirm action with Bootstrap modal
function confirmAction(message, onConfirm, options = {}) {
  const title = options.title || 'Confirm Action';
  const confirmText = options.confirmText || 'Confirm';
  const confirmClass = options.confirmClass || 'btn-danger';
  
  let modalEl = document.getElementById('confirmActionModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'confirmActionModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title" id="confirmModalTitle"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="confirmModalBody"></div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn" id="confirmModalBtn"></button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }
  
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalBody').textContent = message;
  const confirmBtn = document.getElementById('confirmModalBtn');
  confirmBtn.textContent = confirmText;
  confirmBtn.className = `btn ${confirmClass}`;
  
  const handleConfirm = () => {
    modal.hide();
    onConfirm();
  };
  
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  document.getElementById('confirmModalBtn').addEventListener('click', handleConfirm);
  
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// Button loading state helpers
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (!button) return;
  
  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span>${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

// Seed data on page load
seedDemoData();

// Initialize layout immediately (auth.js is already loaded)
initializeLayout();
