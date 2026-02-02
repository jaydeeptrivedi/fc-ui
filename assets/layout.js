// assets/layout.js
(function() {
  const page = document.documentElement.getAttribute('data-page') || '';
  const shell = document.getElementById('app-shell');
  if (!shell) return;

  shell.innerHTML = `
    <nav class="navbar navbar-expand topbar-brand navbar-dark sticky-top">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="./index.html">
          <span class="brand-badge">FC</span>
          <span>Platform</span>
        </a>
        <div class="d-flex gap-2 align-items-center">
          <a class="btn btn-sm btn-outline-light" href="./registration.html" title="Create Account">
            <span style="font-size: 14px;">+ Sign Up</span>
          </a>
          <button class="btn btn-sm btn-outline-light" type="button" title="Notifications">🔔</button>
          <button class="btn btn-sm btn-outline-light" type="button" title="Profile">👤</button>
          <button class="btn btn-sm btn-outline-light" type="button" title="Settings">⚙️</button>
        </div>
      </div>
    </nav>
  `;

  const sidebar = document.getElementById('sidebar-slot');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-rail d-flex flex-column align-items-center py-3 gap-2">
      ${navItem('licenses', '🧾', 'User Licenses', './index.html', page)}
      ${navItem('devices', '📡', 'Devices', '#', page)}
      ${navItem('api', '🔌', 'API', '#', page)}
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
})();
