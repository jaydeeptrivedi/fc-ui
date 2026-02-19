/**
 * Subscription Portal - Data Management (Local Storage)
 * Provides CRUD operations for Products, Subscriptions, and Promos
 */

const AdminData = {
  // Storage keys
  STORAGE_KEYS: {
    PRODUCTS: 'fc_admin_products',
    SUBSCRIPTIONS: 'fc_admin_subscriptions',
    PROMOS: 'fc_admin_promos'
  },

  // Available countries for promo targeting
  COUNTRIES: [
    'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 
    'Belgium', 'Austria', 'Switzerland', 'Poland', 'Czech Republic',
    'United Kingdom', 'Ireland', 'Portugal', 'Greece', 'Hungary',
    'USA', 'Canada', 'Mexico', 'Brazil', 'Argentina',
    'Australia', 'New Zealand', 'Japan', 'South Korea', 'India'
  ],

  // ==================== PRODUCTS ====================
  
  getProducts() {
    const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
    if (data) {
      return JSON.parse(data);
    }
    // Return default products
    const defaults = this.getDefaultProducts();
    this.saveProducts(defaults);
    return defaults;
  },

  saveProducts(products) {
    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct(product) {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  },

  updateProduct(product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
      this.saveProducts(products);
    }
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  getDefaultProducts() {
    return [
      // Client API Product (Tier-based pricing with regional currency/prices)
      {
        id: 'PROD-001',
        name: 'Client API',
        type: 'Client API',
        unit: 'Subscription',
        devicePrice: 30,
        billing: 'Annual',
        status: 'Active',
        description: 'API access with tiered pricing. Regional pricing in local currencies.',
        tiers: [
          { tier: 1, name: 'Tier 1', callsPerDay: 48, price: 49 },
          { tier: 2, name: 'Tier 2', callsPerDay: 500, price: 249 },
          { tier: 3, name: 'Tier 3', callsPerDay: 1500, price: 499 }
        ],
        regions: [
          { code: 'EU', name: 'Europe', currency: 'EUR', devicePrice: 30, tierPrices: { 1: 49, 2: 249, 3: 499 } },
          { code: 'US', name: 'United States', currency: 'USD', devicePrice: 35, tierPrices: { 1: 55, 2: 275, 3: 549 } },
          { code: 'UK', name: 'United Kingdom', currency: 'GBP', devicePrice: 25, tierPrices: { 1: 42, 2: 215, 3: 429 } },
          { code: 'APAC', name: 'Asia Pacific', currency: 'USD', devicePrice: 25, tierPrices: { 1: 39, 2: 199, 3: 399 } },
          { code: 'LATAM', name: 'Latin America', currency: 'USD', devicePrice: 20, tierPrices: { 1: 35, 2: 175, 3: 349 } }
        ]
      },
      // Disease Models (Bracket pricing per license/device)
      {
        id: 'PROD-002',
        name: 'Disease Models - Crop License',
        type: 'Disease Models',
        unit: 'License',
        price: 96,
        billing: 'Annual',
        status: 'Active',
        description: 'Per-device license for crop disease models. Bracket pricing applies.',
        brackets: [
          { min: 1, max: 10, price: 96 },
          { min: 11, max: 20, price: 82 },
          { min: 21, max: 50, price: 72 },
          { min: 51, max: 100, price: 67 },
          { min: 101, max: null, price: 60 }
        ],
        models: [
          { name: 'Apple Scab Model', crop: 'Apple', diseases: ['Venturia inaequalis'], status: 'Active' },
          { name: 'Grape Downy Mildew', crop: 'Viticulture', diseases: ['Plasmopara viticola'], status: 'Active' },
          { name: 'Potato Late Blight', crop: 'Potato', diseases: ['Phytophthora infestans'], status: 'Active' },
          { name: 'Wheat Rust Model', crop: 'Wheat', diseases: ['Puccinia triticina', 'Puccinia striiformis'], status: 'Active' },
          { name: 'Tomato Early Blight', crop: 'Tomato', diseases: ['Alternaria solani'], status: 'Inactive' }
        ],
        regions: [
          { code: 'EU', name: 'Europe', currency: 'EUR', bracketPrices: { 1: 96, 2: 82, 3: 72, 4: 67, 5: 60 } },
          { code: 'US', name: 'United States', currency: 'USD', bracketPrices: { 1: 105, 2: 90, 3: 79, 4: 74, 5: 66 } },
          { code: 'UK', name: 'United Kingdom', currency: 'GBP', bracketPrices: { 1: 82, 2: 70, 3: 62, 4: 57, 5: 51 } },
          { code: 'APAC', name: 'Asia Pacific', currency: 'USD', bracketPrices: { 1: 77, 2: 66, 3: 58, 4: 54, 5: 48 } },
          { code: 'LATAM', name: 'Latin America', currency: 'USD', bracketPrices: { 1: 67, 2: 57, 3: 50, 4: 47, 5: 42 } }
        ]
      },
      // FarmView (placeholder)
      {
        id: 'PROD-003',
        name: 'FarmView with Satellite',
        type: 'FarmView',
        unit: 'CropZone',
        price: 50,
        billing: 'Annual',
        status: 'Active',
        description: 'FarmView with Satellite imagery per CropZone'
      },
      // Weather Forecast (placeholder)
      {
        id: 'PROD-004',
        name: 'Weather Forecast',
        type: 'Weather Forecast',
        unit: 'Subscription',
        price: 99,
        billing: 'Annual',
        status: 'Active',
        description: 'Weather forecast data subscription'
      }
    ];
  },

  // ==================== SUBSCRIPTIONS ====================
  
  getSubscriptions() {
    const data = localStorage.getItem(this.STORAGE_KEYS.SUBSCRIPTIONS);
    if (data) {
      return JSON.parse(data);
    }
    // Return default subscriptions
    const defaults = this.getDefaultSubscriptions();
    this.saveSubscriptions(defaults);
    return defaults;
  },

  saveSubscriptions(subscriptions) {
    localStorage.setItem(this.STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  },

  addSubscription(subscription) {
    const subscriptions = this.getSubscriptions();
    subscriptions.push(subscription);
    this.saveSubscriptions(subscriptions);
  },

  updateSubscription(subscription) {
    const subscriptions = this.getSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscription.id);
    if (index !== -1) {
      subscriptions[index] = subscription;
      this.saveSubscriptions(subscriptions);
    }
  },

  deleteSubscription(id) {
    const subscriptions = this.getSubscriptions().filter(s => s.id !== id);
    this.saveSubscriptions(subscriptions);
  },

  getDefaultSubscriptions() {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const startDate = today.toISOString().split('T')[0];
    const endDate = nextYear.toISOString().split('T')[0];

    return [
      // Austria - visible to Germany/Austria/Switzerland regional users
      {
        id: 'SUB-001',
        product: 'Client API',
        productType: 'Client API',
        plan: 'Tier 1',
        start: startDate,
        expiry: endDate,
        devices: ['device001', 'device002'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Vineyard Solutions GmbH',
          billEmail: 'billing@vineyard-solutions.de',
          billAddress: 'Weinstrasse 42, Vienna, 1010',
          billCountry: 'Austria',
          billVat: 'ATU12345678',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 109,
        promoCode: '',
        notes: 'Annual contract - 2 devices',
        paymentMethod: 'Online',
        invoiceNumber: 'INV-2025-001'
      },
      // Germany - visible to Germany/Austria/Switzerland regional users
      {
        id: 'SUB-002',
        product: 'Disease Models - Apple (3 licenses)',
        productType: 'Disease Models',
        plan: 'DM License',
        crop: 'apple',
        cropName: 'Apple',
        licenses: 3,
        start: startDate,
        expiry: endDate,
        devices: ['device010', 'device011', 'device012'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Bayern Obst GmbH',
          billEmail: 'billing@bayern-obst.de',
          billAddress: 'Obstweg 15, Munich, 80331',
          billCountry: 'Germany',
          billVat: 'DE123456789',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 288,
        promoCode: 'GERMANY15',
        notes: 'German market - apple disease models',
        paymentMethod: 'Invoice',
        invoiceNumber: 'INV-2025-002'
      },
      // France - visible to France/Belgium regional users
      {
        id: 'SUB-003',
        product: 'Client API',
        productType: 'Client API',
        plan: 'Tier 2',
        start: startDate,
        expiry: endDate,
        devices: ['device020', 'device021', 'device022', 'device023'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Vignobles Bordeaux SARL',
          billEmail: 'comptabilite@vignobles-bordeaux.fr',
          billAddress: '45 Rue du Vin, Bordeaux, 33000',
          billCountry: 'France',
          billVat: 'FR12345678901',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 369,
        promoCode: 'FRANCE25',
        notes: 'French vineyard - Tier 2 with 4 devices',
        paymentMethod: 'Online',
        invoiceNumber: 'INV-2025-003'
      },
      // France - visible to France/Belgium regional users
      {
        id: 'SUB-004',
        product: 'Disease Models - Grape (5 licenses)',
        productType: 'Disease Models',
        plan: 'DM License',
        crop: 'grape',
        cropName: 'Grape / Vine',
        licenses: 5,
        start: startDate,
        expiry: endDate,
        devices: ['device024', 'device025', 'device026', 'device027', 'device028'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Champagne Laurent & Fils',
          billEmail: 'admin@champagne-laurent.fr',
          billAddress: '12 Avenue Champagne, Reims, 51100',
          billCountry: 'France',
          billVat: 'FR98765432109',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 480,
        promoCode: '',
        notes: 'Champagne region - grape disease models',
        paymentMethod: 'Invoice',
        invoiceNumber: 'INV-2025-004'
      },
      // Belgium - visible to France/Belgium regional users
      {
        id: 'SUB-005',
        product: 'FarmView with Satellite for 15 CropZones',
        productType: 'FarmView',
        plan: 'Standard',
        cropZones: 15,
        start: startDate,
        expiry: endDate,
        devices: [],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Ferme Belge NV',
          billEmail: 'info@ferme-belge.be',
          billAddress: 'Landbouwstraat 88, Brussels, 1000',
          billCountry: 'Belgium',
          billVat: 'BE0123456789',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 750,
        promoCode: '',
        notes: 'Belgian farm - FarmView subscription',
        paymentMethod: 'Online',
        invoiceNumber: 'INV-2025-005'
      },
      // Spain - visible to Spain/Portugal regional users
      {
        id: 'SUB-006',
        product: 'Client API',
        productType: 'Client API',
        plan: 'Tier 3',
        start: startDate,
        expiry: endDate,
        devices: ['device030', 'device031', 'device032', 'device033', 'device034', 'device035'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Olivares del Sol S.L.',
          billEmail: 'contabilidad@olivares-sol.es',
          billAddress: 'Calle Olivo 100, Sevilla, 41001',
          billCountry: 'Spain',
          billVat: 'ES12345678A',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 679,
        promoCode: 'SPAIN30',
        notes: 'Spanish olive farm - Tier 3 enterprise',
        paymentMethod: 'Invoice',
        invoiceNumber: 'INV-2025-006'
      },
      // Spain - visible to Spain/Portugal regional users
      {
        id: 'SUB-007',
        product: 'Disease Models - Citrus (8 licenses)',
        productType: 'Disease Models',
        plan: 'DM License',
        crop: 'citrus',
        cropName: 'Citrus',
        licenses: 8,
        start: startDate,
        expiry: endDate,
        devices: ['device040', 'device041', 'device042', 'device043', 'device044', 'device045', 'device046', 'device047'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Naranjas Valencia SL',
          billEmail: 'admin@naranjas-valencia.es',
          billAddress: 'Avenida Naranja 55, Valencia, 46001',
          billCountry: 'Spain',
          billVat: 'ESB87654321',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 656,
        promoCode: '',
        notes: 'Valencia citrus - disease models',
        paymentMethod: 'Online',
        invoiceNumber: 'INV-2025-007'
      },
      // Portugal - visible to Spain/Portugal regional users
      {
        id: 'SUB-008',
        product: 'Client API',
        productType: 'Client API',
        plan: 'Tier 2',
        start: startDate,
        expiry: endDate,
        devices: ['device050', 'device051'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Vinhos do Douro Lda',
          billEmail: 'financeiro@vinhos-douro.pt',
          billAddress: 'Rua do Porto 200, Porto, 4050',
          billCountry: 'Portugal',
          billVat: 'PT123456789',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 309,
        promoCode: '',
        notes: 'Portuguese vineyard - Douro region',
        paymentMethod: 'Online',
        invoiceNumber: 'INV-2025-008'
      },
      // Italy - visible to Italy regional users
      {
        id: 'SUB-009',
        product: 'Client API',
        productType: 'Client API',
        plan: 'Tier 2',
        start: startDate,
        expiry: endDate,
        devices: ['device060', 'device061', 'device062'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'AgriTech Toscana S.r.l.',
          billEmail: 'billing@agritech-toscana.it',
          billAddress: 'Via Roma 100, Florence, 50100',
          billCountry: 'Italy',
          billVat: 'IT12345678901',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 339,
        promoCode: 'ITALY20',
        notes: 'Tuscan agriculture - API subscription',
        paymentMethod: 'Invoice',
        invoiceNumber: 'INV-2025-009'
      },
      // Italy - visible to Italy regional users
      {
        id: 'SUB-010',
        product: 'Disease Models - Grape (10 licenses)',
        productType: 'Disease Models',
        plan: 'DM License',
        crop: 'grape',
        cropName: 'Grape / Vine',
        licenses: 10,
        start: startDate,
        expiry: endDate,
        devices: ['device070', 'device071', 'device072', 'device073', 'device074', 'device075', 'device076', 'device077', 'device078', 'device079'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Vini Piemonte SpA',
          billEmail: 'contabilita@vini-piemonte.it',
          billAddress: 'Strada del Vino 50, Turin, 10100',
          billCountry: 'Italy',
          billVat: 'IT98765432109',
          billMethod: 'Self Pay'
        },
        status: 'Active',
        cost: 820,
        promoCode: '',
        notes: 'Piedmont wines - grape disease models',
        paymentMethod: 'Online',
        invoiceNumber: 'INV-2025-010'
      },
      // Switzerland - visible to Germany/Austria/Switzerland regional users
      {
        id: 'SUB-011',
        product: 'Weather Forecast',
        productType: 'Weather Forecast',
        plan: 'Standard',
        start: '2025-10-27',
        expiry: '2026-10-27',
        devices: [],
        billing: 'Reseller',
        billingProfile: {
          billName: 'Weather Analytics AG',
          billEmail: 'accounts@weatheranalytics.ch',
          billAddress: 'Bahnhofstrasse 50, Zurich, 8001',
          billCountry: 'Switzerland',
          billVat: 'CHE-123.456.789',
          billMethod: 'Reseller'
        },
        status: 'Pending',
        cost: 99,
        promoCode: 'WELCOME10',
        notes: 'Swiss weather analytics - Reseller billing',
        paymentMethod: 'Invoice',
        invoiceNumber: ''
      },
      // Pending Client API - Tier 3 with 10 devices (Germany)
      {
        id: 'SUB-012',
        product: 'Client API',
        productType: 'Client API',
        plan: 'Tier 3',
        tier: 3,
        start: '2026-03-01',
        expiry: '2027-03-01',
        devices: ['device100', 'device101', 'device102', 'device103', 'device104', 'device105', 'device106', 'device107', 'device108', 'device109'],
        billing: 'Self Pay',
        billingProfile: {
          billName: 'Precision Farming Solutions GmbH',
          billEmail: 'invoices@precision-farming.de',
          billAddress: 'Agrarstrasse 88, Hamburg, 20095',
          billCountry: 'Germany',
          billVat: 'DE987654321',
          billMethod: 'Self Pay'
        },
        status: 'Pending',
        cost: 799,
        promoCode: '',
        notes: 'Enterprise client - Tier 3 (1500 calls/day) with 10 devices. Awaiting invoice payment.',
        paymentMethod: 'Invoice',
        invoiceNumber: ''
      }
    ];
  },

  // ==================== PROMOS ====================
  
  getPromos() {
    const data = localStorage.getItem(this.STORAGE_KEYS.PROMOS);
    if (data) {
      return JSON.parse(data);
    }
    // Return default promos
    const defaults = this.getDefaultPromos();
    this.savePromos(defaults);
    return defaults;
  },

  savePromos(promos) {
    localStorage.setItem(this.STORAGE_KEYS.PROMOS, JSON.stringify(promos));
  },

  addPromo(promo) {
    const promos = this.getPromos();
    promos.push(promo);
    this.savePromos(promos);
  },

  updatePromo(promo) {
    const promos = this.getPromos();
    const index = promos.findIndex(p => p.id === promo.id);
    if (index !== -1) {
      promos[index] = promo;
      this.savePromos(promos);
    }
  },

  deletePromo(id) {
    const promos = this.getPromos().filter(p => p.id !== id);
    this.savePromos(promos);
  },

  getDefaultPromos() {
    // Match promo codes from main platform (PROMO_CODES in app.js)
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const startDate = today.toISOString().split('T')[0];
    const endDate = nextYear.toISOString().split('T')[0];

    return [
      {
        id: 'PROMO-001',
        code: 'WELCOME10',
        discount: 10,
        description: '10% off first subscription',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: null,
        usageCount: 45,
        countries: [], // Global promo - available to all regions
        notes: 'Welcome promo - matches main platform'
      },
      {
        id: 'PROMO-002',
        code: 'LAUNCH20',
        discount: 20,
        description: '20% off all subscriptions',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 100,
        usageCount: 23,
        countries: [], // Global promo
        notes: 'Launch promotion'
      },
      {
        id: 'PROMO-003',
        code: 'GERMANY15',
        discount: 15,
        description: '15% Germany market special',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 50,
        usageCount: 12,
        countries: ['Germany'], // Germany-specific promo
        notes: 'Germany market promo'
      },
      {
        id: 'PROMO-004',
        code: 'FRANCE25',
        discount: 25,
        description: '25% France summer promotion',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 200,
        usageCount: 67,
        countries: ['France'], // France-specific promo
        notes: 'France summer campaign'
      },
      {
        id: 'PROMO-005',
        code: 'SPAIN30',
        discount: 30,
        description: '30% Spain launch offer',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 30,
        usageCount: 8,
        countries: ['Spain'], // Spain-specific promo
        notes: 'Spain market launch'
      },
      {
        id: 'PROMO-006',
        code: 'EUCENTRAL20',
        discount: 20,
        description: '20% Central Europe promo',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 100,
        usageCount: 34,
        countries: ['Germany', 'Austria', 'Switzerland'], // Multi-country promo
        notes: 'Central Europe promotion'
      },
      {
        id: 'PROMO-007',
        code: 'ITALY20',
        discount: 20,
        description: '20% Italy vineyard special',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'Disease Models',
        usageLimit: 75,
        usageCount: 18,
        countries: ['Italy'], // Italy-specific promo
        notes: 'Italian vineyard campaign'
      },
      {
        id: 'PROMO-008',
        code: 'BENELUX15',
        discount: 15,
        description: '15% Benelux region offer',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 60,
        usageCount: 22,
        countries: ['Belgium', 'Netherlands'], // Benelux promo
        notes: 'Benelux market promotion'
      },
      {
        id: 'PROMO-009',
        code: 'IBERIA25',
        discount: 25,
        description: '25% Iberian Peninsula offer',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 80,
        usageCount: 15,
        countries: ['Spain', 'Portugal'], // Iberia promo
        notes: 'Spain & Portugal joint promotion'
      },
      {
        id: 'PROMO-010',
        code: 'FRANCEVINE20',
        discount: 20,
        description: '20% French vineyard special',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'Disease Models',
        usageLimit: 100,
        usageCount: 31,
        countries: ['France'], // France disease models promo
        notes: 'French wine region campaign'
      },
      {
        id: 'PROMO-011',
        code: 'PORTOWINE15',
        discount: 15,
        description: '15% Portugal wine region',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'all',
        usageLimit: 40,
        usageCount: 9,
        countries: ['Portugal'], // Portugal promo
        notes: 'Portuguese wine region offer'
      },
      {
        id: 'PROMO-012',
        code: 'AUSTRIA10',
        discount: 10,
        description: '10% Austria loyalty discount',
        startDate: startDate,
        endDate: endDate,
        applicableProducts: 'Client API',
        usageLimit: 50,
        usageCount: 14,
        countries: ['Austria'], // Austria promo
        notes: 'Austrian customer loyalty program'
      }
    ];
  },

  // ==================== UTILITIES ====================
  
  resetAllData() {
    localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(this.STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(this.STORAGE_KEYS.PROMOS);
  },

  exportData() {
    return {
      products: this.getProducts(),
      subscriptions: this.getSubscriptions(),
      promos: this.getPromos(),
      exportedAt: new Date().toISOString()
    };
  },

  importData(data) {
    if (data.products) this.saveProducts(data.products);
    if (data.subscriptions) this.saveSubscriptions(data.subscriptions);
    if (data.promos) this.savePromos(data.promos);
  },

  // ==================== AUTH & PERMISSIONS ====================
  
  /**
   * Role definitions:
   * - GlobalAdmin: Full CRUD on all data, all countries
   * - GlobalAnalyst: Read-only on all data, all countries
   * - RegionalManager: Full CRUD but only for assigned countries
   * - RegionalAnalyst: Read-only for assigned countries only
   */
  
  getSession() {
    const session = sessionStorage.getItem('fc_admin_session');
    return session ? JSON.parse(session) : null;
  },
  
  isLoggedIn() {
    return this.getSession() !== null;
  },
  
  logout() {
    sessionStorage.removeItem('fc_admin_session');
    window.location.href = 'signin.html';
  },
  
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'signin.html';
      return false;
    }
    return true;
  },
  
  getCurrentUser() {
    return this.getSession();
  },
  
  getUserRole() {
    const session = this.getSession();
    return session ? session.role : null;
  },
  
  getUserCountries() {
    const session = this.getSession();
    return session ? (session.countries || []) : [];
  },
  
  // Permission checks
  isGlobalRole() {
    const role = this.getUserRole();
    return role === 'GlobalAdmin' || role === 'GlobalAnalyst';
  },
  
  isAdminRole() {
    const role = this.getUserRole();
    return role === 'GlobalAdmin' || role === 'RegionalManager';
  },
  
  isReadOnlyRole() {
    const role = this.getUserRole();
    return role === 'GlobalAnalyst' || role === 'RegionalAnalyst';
  },
  
  canEdit() {
    return this.isAdminRole();
  },
  
  canDelete() {
    return this.isAdminRole();
  },
  
  canCreate() {
    return this.isAdminRole();
  },
  
  canAccessCountry(country) {
    if (this.isGlobalRole()) return true;
    const userCountries = this.getUserCountries();
    return userCountries.length === 0 || userCountries.includes(country);
  },
  
  // Filter data by user's country access
  filterByCountryAccess(items) {
    if (this.isGlobalRole()) return items;
    const userCountries = this.getUserCountries();
    if (userCountries.length === 0) return items;
    
    return items.filter(item => {
      const country = item.billingProfile?.billCountry || item.country || '';
      return !country || userCountries.includes(country);
    });
  },
  
  // Get subscriptions filtered by user access
  getAccessibleSubscriptions() {
    return this.filterByCountryAccess(this.getSubscriptions());
  },
  
  // Get promos filtered by user's region access
  // Promos with empty/null countries array are global (visible to all)
  // Promos with countries array are regional (visible only to users with matching countries)
  getAccessiblePromos() {
    const promos = this.getPromos();
    if (this.isGlobalRole()) return promos;
    
    const userCountries = this.getUserCountries();
    if (userCountries.length === 0) return promos;
    
    return promos.filter(promo => {
      // No countries = global promo, visible to all
      if (!promo.countries || promo.countries.length === 0) return false;
      // Check if any promo country matches user's countries
      return promo.countries.some(c => userCountries.includes(c));
    });
  },
  
  // Check if user can edit products/promos (HQ only)
  canEditGlobalResources() {
    return this.getUserRole() === 'GlobalAdmin';
  },
  
  // Role display helpers
  getRoleDisplayName(role) {
    const names = {
      'GlobalAdmin': 'Global Administrator',
      'GlobalAnalyst': 'Global Analyst',
      'RegionalManager': 'Regional Manager',
      'RegionalAnalyst': 'Regional Analyst'
    };
    return names[role] || role;
  },
  
  getRoleBadgeClass(role) {
    const classes = {
      'GlobalAdmin': 'bg-danger',
      'GlobalAnalyst': 'bg-secondary',
      'RegionalManager': 'bg-success',
      'RegionalAnalyst': 'bg-info'
    };
    return classes[role] || 'bg-secondary';
  }
};
