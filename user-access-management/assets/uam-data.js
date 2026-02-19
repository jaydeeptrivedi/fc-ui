/**
 * User Access Management - Data Management (Local Storage)
 * Manages user accounts and their access privileges
 */

const UAMData = {
  STORAGE_KEYS: {
    USERS: 'fc_uam_users',
    AUDIT_LOG: 'fc_uam_audit'
  },

  // Subscription Portal access levels (Platform access is separate)
  ACCESS_LEVELS: {
    SUBSCRIPTION_GLOBAL_ADMIN: {
      id: 'subscription_global_admin',
      name: 'Subscription Portal - Global Admin',
      description: 'Full access to all subscription management features globally',
      icon: 'bi-shield-fill-check',
      color: 'danger'
    },
    SUBSCRIPTION_GLOBAL_ANALYST: {
      id: 'subscription_global_analyst',
      name: 'Subscription Portal - Global Analyst',
      description: 'Read-only access to all subscription data globally',
      icon: 'bi-eye',
      color: 'info'
    },
    SUBSCRIPTION_REGIONAL_MANAGER: {
      id: 'subscription_regional_manager',
      name: 'Subscription Portal - Regional Manager',
      description: 'Full access to subscription management for assigned regions',
      icon: 'bi-geo-alt-fill',
      color: 'warning'
    },
    SUBSCRIPTION_REGIONAL_ANALYST: {
      id: 'subscription_regional_analyst',
      name: 'Subscription Portal - Regional Analyst',
      description: 'Read-only access to subscription data for assigned regions',
      icon: 'bi-binoculars',
      color: 'primary'
    }
  },

  // Available regions/countries
  REGIONS: [
    'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 
    'Belgium', 'Austria', 'Switzerland', 'Poland', 'Czech Republic',
    'United Kingdom', 'Ireland', 'Portugal', 'Greece', 'Hungary',
    'USA', 'Canada', 'Mexico', 'Brazil', 'Argentina',
    'Australia', 'New Zealand', 'Japan', 'South Korea', 'India'
  ],

  // ==================== USER MANAGEMENT ====================

  getUsers() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USERS);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default users
    const defaults = this.getDefaultUsers();
    this.saveUsers(defaults);
    return defaults;
  },

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUser(userId) {
    return this.getUsers().find(u => u.id === userId);
  },

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  updateUser(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveUsers(users);
      this.logAudit('UPDATE_USER', userId, updates);
      return users[index];
    }
    return null;
  },

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: 'USR-' + Date.now(),
      ...userData,
      platformWebAccess: true,      // Default: has web access
      platformMobileAccess: true,   // Default: has mobile access
      subscriptionPortalAccess: false,
      subscriptionPortalRole: null,
      assignedCountries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      status: 'active'
    };
    users.push(newUser);
    this.saveUsers(users);
    this.logAudit('CREATE_USER', newUser.id, { email: userData.email });
    return newUser;
  },

  deleteUser(userId) {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    this.saveUsers(filtered);
    this.logAudit('DELETE_USER', userId, {});
  },

  grantSubscriptionAccess(userId, role, countries = []) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].subscriptionPortalAccess = true;
      users[index].subscriptionPortalRole = role;
      users[index].assignedCountries = countries;
      users[index].accessGrantedAt = new Date().toISOString();
      users[index].updatedAt = new Date().toISOString();
      this.saveUsers(users);
      this.logAudit('GRANT_ACCESS', userId, { role, countries });
      return users[index];
    }
    return null;
  },

  revokeSubscriptionAccess(userId) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].subscriptionPortalAccess = false;
      users[index].subscriptionPortalRole = null;
      users[index].assignedCountries = [];
      users[index].accessRevokedAt = new Date().toISOString();
      users[index].updatedAt = new Date().toISOString();
      this.saveUsers(users);
      this.logAudit('REVOKE_ACCESS', userId, {});
      return users[index];
    }
    return null;
  },

  updatePlatformAccess(userId, webAccess, mobileAccess) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].platformWebAccess = webAccess;
      users[index].platformMobileAccess = mobileAccess;
      users[index].updatedAt = new Date().toISOString();
      this.saveUsers(users);
      this.logAudit('UPDATE_PLATFORM_ACCESS', userId, { webAccess, mobileAccess });
      return users[index];
    }
    return null;
  },

  // ==================== AUDIT LOG ====================

  getAuditLog() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.AUDIT_LOG);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default audit entries
    const defaults = this.getDefaultAuditLog();
    localStorage.setItem(this.STORAGE_KEYS.AUDIT_LOG, JSON.stringify(defaults));
    return defaults;
  },

  getDefaultAuditLog() {
    return [
      {
        id: 'LOG-001',
        action: 'GRANT_ACCESS',
        userId: 'USR-006',
        details: { role: 'subscription_global_admin', countries: [] },
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-19T07:30:00Z'
      },
      {
        id: 'LOG-002',
        action: 'UPDATE_PLATFORM_ACCESS',
        userId: 'USR-005',
        details: { webAccess: true, mobileAccess: false },
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-18T14:20:00Z'
      },
      {
        id: 'LOG-003',
        action: 'GRANT_ACCESS',
        userId: 'USR-007',
        details: { role: 'subscription_global_analyst', countries: [] },
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-17T10:15:00Z'
      },
      {
        id: 'LOG-004',
        action: 'GRANT_ACCESS',
        userId: 'USR-008',
        details: { role: 'subscription_regional_manager', countries: ['Germany', 'Austria', 'Switzerland'] },
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-16T09:00:00Z'
      },
      {
        id: 'LOG-005',
        action: 'GRANT_ACCESS',
        userId: 'USR-009',
        details: { role: 'subscription_regional_analyst', countries: ['France', 'Belgium', 'Netherlands'] },
        performedBy: 'it.admin@fc.com',
        timestamp: '2026-02-15T16:45:00Z'
      },
      {
        id: 'LOG-006',
        action: 'REVOKE_ACCESS',
        userId: 'USR-002',
        details: {},
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-14T11:30:00Z'
      },
      {
        id: 'LOG-007',
        action: 'CREATE_USER',
        userId: 'USR-005',
        details: { email: 'marco.rossi@aziendaagricola.it' },
        performedBy: 'system',
        timestamp: '2026-02-12T09:30:00Z'
      },
      {
        id: 'LOG-008',
        action: 'UPDATE_USER',
        userId: 'USR-003',
        details: { company: 'Wijngaard BV' },
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-10T14:00:00Z'
      },
      {
        id: 'LOG-009',
        action: 'GRANT_ACCESS',
        userId: 'USR-010',
        details: { role: 'subscription_regional_analyst', countries: ['Spain', 'Portugal'] },
        performedBy: 'it.admin@fc.com',
        timestamp: '2026-02-08T10:20:00Z'
      },
      {
        id: 'LOG-010',
        action: 'UPDATE_PLATFORM_ACCESS',
        userId: 'USR-004',
        details: { webAccess: true, mobileAccess: true },
        performedBy: 'superadmin@fc.com',
        timestamp: '2026-02-05T08:15:00Z'
      }
    ];
  },

  logAudit(action, userId, details) {
    const logs = this.getAuditLog();
    logs.unshift({
      id: 'LOG-' + Date.now(),
      action,
      userId,
      details,
      performedBy: this.getCurrentUser()?.email || 'system',
      timestamp: new Date().toISOString()
    });
    // Keep only last 500 entries
    if (logs.length > 500) logs.length = 500;
    localStorage.setItem(this.STORAGE_KEYS.AUDIT_LOG, JSON.stringify(logs));
  },

  // ==================== AUTHENTICATION ====================

  login(email, password) {
    // Demo authentication - in production this would hit an API
    const demoAccounts = [
      { email: 'superadmin@fc.com', password: 'admin123', name: 'Super Admin', role: 'super_admin' },
      { email: 'it.admin@fc.com', password: 'admin123', name: 'IT Administrator', role: 'it_admin' }
    ];

    const account = demoAccounts.find(a => 
      a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (account) {
      const session = {
        email: account.email,
        name: account.name,
        role: account.role,
        loginAt: new Date().toISOString()
      };
      sessionStorage.setItem('fc_uam_session', JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  logout() {
    sessionStorage.removeItem('fc_uam_session');
  },

  getSession() {
    const session = sessionStorage.getItem('fc_uam_session');
    return session ? JSON.parse(session) : null;
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  getCurrentUser() {
    return this.getSession();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'signin.html';
      return false;
    }
    return true;
  },

  // ==================== STATISTICS ====================

  getStats() {
    const users = this.getUsers();
    const withPortalAccess = users.filter(u => u.subscriptionPortalAccess);
    
    return {
      totalUsers: users.length,
      platformWebAccess: users.filter(u => u.platformWebAccess !== false).length,
      platformMobileAccess: users.filter(u => u.platformMobileAccess !== false).length,
      subscriptionAccess: withPortalAccess.length,
      noPortalAccess: users.filter(u => !u.subscriptionPortalAccess).length,
      globalAdmins: withPortalAccess.filter(u => u.subscriptionPortalRole === 'subscription_global_admin').length,
      globalAnalysts: withPortalAccess.filter(u => u.subscriptionPortalRole === 'subscription_global_analyst').length,
      regionalManagers: withPortalAccess.filter(u => u.subscriptionPortalRole === 'subscription_regional_manager').length,
      regionalAnalysts: withPortalAccess.filter(u => u.subscriptionPortalRole === 'subscription_regional_analyst').length,
      activeUsers: users.filter(u => u.status === 'active').length
    };
  },

  getAccessByCountry() {
    const users = this.getUsers().filter(u => u.subscriptionPortalAccess && u.assignedCountries?.length > 0);
    const countryMap = {};
    
    users.forEach(user => {
      user.assignedCountries.forEach(country => {
        if (!countryMap[country]) {
          countryMap[country] = { managers: 0, analysts: 0 };
        }
        if (user.subscriptionPortalRole?.includes('manager')) {
          countryMap[country].managers++;
        } else if (user.subscriptionPortalRole?.includes('analyst')) {
          countryMap[country].analysts++;
        }
      });
    });
    
    return countryMap;
  },

  // ==================== DEFAULT DATA ====================

  getDefaultUsers() {
    return [
      // Platform users (registered via core platform) - have web & mobile by default
      {
        id: 'USR-001',
        email: 'john.farmer@example.com',
        name: 'John Farmer',
        company: 'Green Fields Farm',
        country: 'Germany',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: false,
        subscriptionPortalRole: null,
        assignedCountries: [],
        createdAt: '2025-08-15T10:30:00Z',
        updatedAt: '2025-08-15T10:30:00Z',
        lastLogin: '2026-02-18T14:22:00Z',
        status: 'active',
        registrationSource: 'platform'
      },
      {
        id: 'USR-002',
        email: 'marie.dupont@example.com',
        name: 'Marie Dupont',
        company: 'Vignobles Dupont',
        country: 'France',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: false,
        subscriptionPortalRole: null,
        assignedCountries: [],
        createdAt: '2025-09-20T08:15:00Z',
        updatedAt: '2025-09-20T08:15:00Z',
        lastLogin: '2026-02-17T09:45:00Z',
        status: 'active',
        registrationSource: 'platform'
      },
      {
        id: 'USR-003',
        email: 'carlos.silva@example.com',
        name: 'Carlos Silva',
        company: 'Olivares del Sur',
        country: 'Spain',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: false,
        subscriptionPortalRole: null,
        assignedCountries: [],
        createdAt: '2025-10-05T14:20:00Z',
        updatedAt: '2025-10-05T14:20:00Z',
        lastLogin: '2026-02-15T16:30:00Z',
        status: 'active',
        registrationSource: 'platform'
      },
      {
        id: 'USR-004',
        email: 'anna.mueller@example.com',
        name: 'Anna Müller',
        company: 'Bioland Hof',
        country: 'Germany',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: false,
        subscriptionPortalRole: null,
        assignedCountries: [],
        createdAt: '2025-11-12T11:00:00Z',
        updatedAt: '2025-11-12T11:00:00Z',
        lastLogin: '2026-02-19T08:00:00Z',
        status: 'active',
        registrationSource: 'platform'
      },
      {
        id: 'USR-005',
        email: 'luca.rossi@example.com',
        name: 'Luca Rossi',
        company: 'Azienda Agricola Rossi',
        country: 'Italy',
        platformWebAccess: true,
        platformMobileAccess: false,  // Mobile only - for demo variety
        subscriptionPortalAccess: false,
        subscriptionPortalRole: null,
        assignedCountries: [],
        createdAt: '2025-12-01T09:30:00Z',
        updatedAt: '2025-12-01T09:30:00Z',
        lastLogin: null,
        status: 'active',
        registrationSource: 'platform'
      },
      // Users with Subscription Portal access
      {
        id: 'USR-006',
        email: 'global.admin@fc.com',
        name: 'Thomas Weber',
        company: 'FieldClimate HQ',
        country: 'Austria',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_global_admin',
        assignedCountries: [],
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2025-06-01T10:00:00Z',
        accessGrantedAt: '2024-01-15T08:00:00Z',
        lastLogin: '2026-02-19T07:30:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-007',
        email: 'global.analyst@fc.com',
        name: 'Sarah Schmidt',
        company: 'FieldClimate HQ',
        country: 'Austria',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_global_analyst',
        assignedCountries: [],
        createdAt: '2024-03-20T09:00:00Z',
        updatedAt: '2025-06-01T10:00:00Z',
        accessGrantedAt: '2024-03-20T09:00:00Z',
        lastLogin: '2026-02-18T15:20:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-008',
        email: 'germany.manager@fc.com',
        name: 'Hans Braun',
        company: 'FieldClimate Germany',
        country: 'Germany',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_regional_manager',
        assignedCountries: ['Germany', 'Austria', 'Switzerland'],
        createdAt: '2024-06-10T10:00:00Z',
        updatedAt: '2025-08-15T14:00:00Z',
        accessGrantedAt: '2024-06-10T10:00:00Z',
        lastLogin: '2026-02-19T08:45:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-009',
        email: 'france.manager@fc.com',
        name: 'Claire Dubois',
        company: 'FieldClimate France',
        country: 'France',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_regional_manager',
        assignedCountries: ['France', 'Belgium'],
        createdAt: '2024-07-15T09:00:00Z',
        updatedAt: '2025-07-15T09:00:00Z',
        accessGrantedAt: '2024-07-15T09:00:00Z',
        lastLogin: '2026-02-18T14:20:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-010',
        email: 'france.analyst@fc.com',
        name: 'Pierre Martin',
        company: 'FieldClimate France',
        country: 'France',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_regional_analyst',
        assignedCountries: ['France', 'Belgium'],
        createdAt: '2024-09-05T11:00:00Z',
        updatedAt: '2025-09-05T11:00:00Z',
        accessGrantedAt: '2024-09-05T11:00:00Z',
        lastLogin: '2026-02-17T10:30:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-011',
        email: 'spain.manager@fc.com',
        name: 'Elena Garcia',
        company: 'FieldClimate Iberia',
        country: 'Spain',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_regional_manager',
        assignedCountries: ['Spain', 'Portugal'],
        createdAt: '2025-01-20T09:00:00Z',
        updatedAt: '2025-10-20T09:00:00Z',
        accessGrantedAt: '2025-01-20T09:00:00Z',
        lastLogin: '2026-02-18T11:15:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-012',
        email: 'italy.manager@fc.com',
        name: 'Marco Bianchi',
        company: 'FieldClimate Italy',
        country: 'Italy',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_regional_manager',
        assignedCountries: ['Italy'],
        createdAt: '2024-11-10T10:00:00Z',
        updatedAt: '2025-11-10T10:00:00Z',
        accessGrantedAt: '2024-11-10T10:00:00Z',
        lastLogin: '2026-02-19T09:00:00Z',
        status: 'active',
        registrationSource: 'internal'
      },
      {
        id: 'USR-013',
        email: 'germany.analyst@fc.com',
        name: 'Lisa Weber',
        company: 'FieldClimate Germany',
        country: 'Germany',
        platformWebAccess: true,
        platformMobileAccess: true,
        subscriptionPortalAccess: true,
        subscriptionPortalRole: 'subscription_regional_analyst',
        assignedCountries: ['Germany', 'Austria', 'Switzerland'],
        createdAt: '2024-08-20T08:30:00Z',
        updatedAt: '2025-08-20T08:30:00Z',
        accessGrantedAt: '2024-08-20T08:30:00Z',
        lastLogin: '2026-02-18T16:45:00Z',
        status: 'active',
        registrationSource: 'internal'
      }
    ];
  },

  // ==================== UTILITIES ====================

  resetAllData() {
    localStorage.removeItem(this.STORAGE_KEYS.USERS);
    localStorage.removeItem(this.STORAGE_KEYS.AUDIT_LOG);
  },

  exportData() {
    return {
      users: this.getUsers(),
      auditLog: this.getAuditLog(),
      exportedAt: new Date().toISOString()
    };
  }
};

// Make available globally
window.UAMData = UAMData;
