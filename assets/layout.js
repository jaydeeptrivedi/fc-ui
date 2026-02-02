// assets/layout.js

// Seed demo data for testing (preserve current user if already logged in)
function seedDemoData() {
  const currentUserJson = localStorage.getItem('fc_currentUser');
  const usersJson = localStorage.getItem('fc_users');
  
  // Only seed if no users exist yet
  if (!usersJson) {
    const demoUsers = [
      {
        id: 'user_org_demo',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@abc.com',
        username: 'janedoe_admin',
        password: 'SecurePass123',
        type: 'organization',
        organization: {
          name: 'abc Corporation',
          website: 'https://abc.example.com',
          industry: 'technology',
          companySize: '11-50'
        },
        primaryContact: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@abc.com',
          username: 'janedoe_admin',
          phone: '+1 (555) 123-4567'
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
        username: 'johnsmith_dev',
        password: 'Password123',
        type: 'individual',
        createdAt: new Date().toISOString(),
        isVerified: true
      }
    ];

    localStorage.setItem('fc_users', JSON.stringify(demoUsers));
  }
  
  // Restore current user if it was cleared
  if (currentUserJson && !localStorage.getItem('fc_currentUser')) {
    localStorage.setItem('fc_currentUser', currentUserJson);
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
          ${!isLoggedIn ? `
          <a class="btn btn-sm btn-outline-light" href="./registration.html" title="Create Account">
            <span style="font-size: 14px;">+ Sign Up</span>
          </a>
          ` : ''}
          ${isLoggedIn ? `
          <button class="btn btn-sm btn-outline-light" id="logoutBtn" type="button" title="Sign Out">Sign Out</button>
          ` : ''}
          <button class="btn btn-sm btn-outline-light" type="button" title="Notifications">🔔</button>
          <button class="btn btn-sm btn-outline-light" type="button" title="Profile">👤</button>
          <button class="btn btn-sm btn-outline-light" type="button" title="Settings">⚙️</button>
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
      ${navItem('licenses', '🧾', 'User Licenses', './index.html', page)}
      ${navItem('devices', '📡', 'Devices', '#', page)}
      ${navItem('api', '🔌', 'API', '#', page)}
      ${isOrg ? navItem('users', '👥', 'User Management', './user-management.html', page) : ''}
      <div class="flex-grow-1"></div>
      ${navItem('help', '❓', 'Help', '#', page)}
    </div>
  `;

  function navItem(key, icon, label, href, activePage) {
    const active = key === activePage ? 'btn-primary' : 'btn-outline-secondary';
    return `
      <a class="btn ${active} sidebar-btn d-flex align-items-center justify-content-center"
         href="${href}" aria-label="${label}" title="${label}">
        <span style="font-size:18px; line-height:1;">${icon}</span>
      </a>
    `;
  }
}

// Seed data on page load
seedDemoData();

// Initialize layout immediately (auth.js is already loaded)
initializeLayout();
