/**
 * Google Analytics Integration - FC Core Platform
 * Tracks user interactions across the core platform (excluding UAM and Subscription Portal)
 */

// Initialize Google Analytics 4
window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'G-YJ0NXREMME', {
  'page_path': window.location.pathname,
  'anonymize_ip': true,
  'allow_google_signals': false
});

/**
 * Track page views
 * Called automatically on page load, but can be called manually for SPAs
 */
function trackPageView(pageName, pagePath) {
  gtag('event', 'page_view', {
    'page_title': pageName || document.title,
    'page_path': pagePath || window.location.pathname
  });
}

/**
 * Track user authentication events
 */
function trackAuthEvent(eventType, details = {}) {
  const eventMap = {
    'sign_in_attempt': 'Sign In Attempt',
    'sign_in_success': 'Sign In Success',
    'sign_in_failure': 'Sign In Failure',
    'sign_out': 'Sign Out',
    'registration_start': 'Registration Started',
    'registration_complete': 'Registration Completed',
    'password_reset_request': 'Password Reset Request'
  };

  gtag('event', eventMap[eventType] || eventType, {
    'category': 'authentication',
    'label': details.email || details.username || 'unknown',
    ...details
  });
}

/**
 * Track form submissions
 */
function trackFormSubmission(formName, formData = {}) {
  gtag('event', 'form_submit', {
    'form_name': formName,
    'category': 'engagement',
    ...formData
  });
}

/**
 * Track button/link clicks
 */
function trackClick(elementName, details = {}) {
  gtag('event', 'click', {
    'element_name': elementName,
    'category': 'engagement',
    ...details
  });
}

/**
 * Track subscription/user management actions
 */
function trackSubscriptionAction(actionType, details = {}) {
  const actionMap = {
    'view_subscriptions': 'View Subscriptions',
    'view_subscription_detail': 'View Subscription Detail',
    'view_users': 'View Users',
    'view_user_detail': 'View User Detail',
    'create_subscription': 'Create Subscription',
    'update_subscription': 'Update Subscription',
    'delete_subscription': 'Delete Subscription',
    'manage_user_access': 'Manage User Access',
    'grant_portal_access': 'Grant Portal Access',
    'revoke_portal_access': 'Revoke Portal Access'
  };

  gtag('event', actionMap[actionType] || actionType, {
    'category': 'subscription_management',
    ...details
  });
}

/**
 * Track errors and issues
 */
function trackError(errorType, errorDetails = {}) {
  gtag('event', 'exception', {
    'description': `${errorType}: ${errorDetails.message || 'Unknown error'}`,
    'fatal': errorDetails.fatal || false,
    'category': 'error',
    ...errorDetails
  });
}

/**
 * Track user characteristics and cohorts
 */
function setUserProperties(userId, properties = {}) {
  gtag('config', 'G-YJ0NXREMME', {
    'user_id': userId
  });

  gtag('event', 'user_properties', {
    'user_type': properties.userType || 'unknown',
    'organization_type': properties.organizationType,
    'country': properties.country,
    'language': properties.language,
    ...properties
  });
}

/**
 * Track search events
 */
function trackSearch(searchQuery, searchCategory = 'general') {
  gtag('event', 'search', {
    'search_term': searchQuery,
    'search_category': searchCategory
  });
}

/**
 * Track timing metrics
 */
function trackTiming(timingName, timingMs, category = 'general') {
  gtag('event', 'timing_complete', {
    'name': timingName,
    'value': timingMs,
    'category': category
  });
}

/**
 * Auto-track form submissions
 * Call this on pages with forms
 */
function setupFormTracking() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const formName = this.id || this.name || 'unknown_form';
      
      // Collect form field names and types (not values for privacy)
      const fieldInfo = Array.from(this.querySelectorAll('input, select, textarea')).map(field => ({
        name: field.name || field.id,
        type: field.type
      }));

      trackFormSubmission(formName, {
        'field_count': fieldInfo.length,
        'has_required_fields': Array.from(this.querySelectorAll('[required]')).length > 0
      });
    });
  });
}

/**
 * Auto-track button clicks
 * Call this on pages with action buttons
 */
function setupClickTracking() {
  document.querySelectorAll('button, a[href*="#"], a[class*="btn"]').forEach(element => {
    element.addEventListener('click', function(e) {
      const elementText = this.textContent?.trim() || 'unknown';
      const elementId = this.id || 'no_id';
      const elementClass = this.className || 'no_class';

      trackClick(elementText, {
        'element_id': elementId,
        'element_type': this.tagName.toLowerCase(),
        'has_submenu': this.querySelector('ul, .dropdown-menu') ? 'yes' : 'no'
      });
    });
  });
}

/**
 * Track page performance metrics (if using Navigation Timing API)
 */
function trackPagePerformance() {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    // Calculate key metrics
    const domReady = timing.domContentLoadedEventEnd - navigationStart;
    const pageLoad = timing.loadEventEnd - navigationStart;
    const dnsTime = timing.dnsLookupEnd - timing.dnsLookupStart;
    const tcpTime = timing.connectEnd - timing.connectStart;

    gtag('event', 'page_performance', {
      'dom_ready_time': domReady,
      'page_load_time': pageLoad,
      'dns_time': dnsTime,
      'tcp_time': tcpTime
    });

    trackTiming('page_load', pageLoad, 'performance');
  }
}

/**
 * Initialize analytics on page load
 * Call this in your main layout/shell component
 */
function initAnalytics() {
  // Track initial page view
  trackPageView();

  // Setup auto-tracking
  setupFormTracking();
  setupClickTracking();

  // Track performance
  window.addEventListener('load', trackPagePerformance);

  // Track page visibility (when users leave/return to tab)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      gtag('event', 'page_hide', {
        'category': 'engagement',
        'timestamp': new Date().toISOString()
      });
    } else {
      gtag('event', 'page_show', {
        'category': 'engagement',
        'timestamp': new Date().toISOString()
      });
    }
  });

  // Track user session
  gtag('event', 'session_start', {
    'category': 'engagement',
    'timestamp': new Date().toISOString()
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
  initAnalytics();
}
