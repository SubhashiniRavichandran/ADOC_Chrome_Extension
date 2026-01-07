/**
 * ADOC Extension Popup - Complete Flow with Dashboard & Cases
 * Handles: Login → Dashboard → Fetch → Display (Case 1A/1B/2)
 */

// Configuration
const ACCELDATA_LOGIN_URL = 'https://indiumtech.acceldata.app/';
const SESSION_CHECK_INTERVAL = 2000; // Check every 2 seconds

// State
let currentView = 'login';
let isLoggedIn = false;
let sessionCheckInterval = null;
let dashboardData = null;

// DOM Elements
let viewLogin, viewDashboard, viewLoading;
let viewCase1A, viewCase1B, viewCase2;
let loginBtn, fetchFromDashboardBtn, openAdocBtn, closeBtn, addAssetsBtn;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM elements
  viewLogin = document.getElementById('view-login');
  viewDashboard = document.getElementById('view-dashboard');
  viewLoading = document.getElementById('view-loading');
  viewCase1A = document.getElementById('view-case-1a');
  viewCase1B = document.getElementById('view-case-1b');
  viewCase2 = document.getElementById('view-case-2');

  loginBtn = document.getElementById('login-btn');
  fetchFromDashboardBtn = document.getElementById('fetch-from-dashboard-btn');
  openAdocBtn = document.getElementById('open-adoc-btn');
  closeBtn = document.getElementById('close-btn');
  addAssetsBtn = document.getElementById('add-assets-btn');

  // Set up event listeners
  loginBtn.addEventListener('click', handleLogin);
  fetchFromDashboardBtn.addEventListener('click', handleFetch);
  openAdocBtn.addEventListener('click', handleOpenAdoc);
  closeBtn.addEventListener('click', () => window.close());
  addAssetsBtn.addEventListener('click', handleOpenAdoc);

  // Initialize
  await initialize();
});

/**
 * Initialize popup - check login status
 */
async function initialize() {
  try {
    // Check if user has credentials stored
    const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });

    if (response.success && response.data.hasCredentials) {
      // User has credentials - show dashboard
      isLoggedIn = true;
      await loadDashboard();
      showView('dashboard');
    } else {
      // No credentials - show login view
      isLoggedIn = false;
      showView('login');
    }
  } catch (error) {
    console.error('Error initializing:', error);
    showView('login');
  }
}

/**
 * Handle login button click
 */
async function handleLogin() {
  try {
    // Open Acceldata login page in new tab
    const tab = await chrome.tabs.create({
      url: ACCELDATA_LOGIN_URL,
      active: true
    });

    // Start monitoring for successful login
    startSessionCheck(tab.id);

    console.log('Opened Acceldata login page. Please configure credentials after logging in.');

  } catch (error) {
    console.error('Error opening login page:', error);
    showError('Failed to open login page');
  }
}

/**
 * Start checking for successful login
 */
function startSessionCheck(tabId) {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }

  sessionCheckInterval = setInterval(async () => {
    try {
      // Check if credentials are now available
      const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });

      if (response.success && response.data.hasCredentials) {
        // Login successful!
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;

        isLoggedIn = true;

        // Load dashboard and show it
        await loadDashboard();
        showView('dashboard');

        // Optionally close the login tab
        try {
          await chrome.tabs.remove(tabId);
        } catch (e) {
          // Tab might already be closed
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }, SESSION_CHECK_INTERVAL);

  // Stop checking after 5 minutes
  setTimeout(() => {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }
  }, 300000);
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  try {
    // Get summary stats from Acceldata (you can implement this endpoint)
    // For now, use placeholder data
    dashboardData = {
      totalAssets: '-',
      totalAlerts: '-',
      avgQuality: '-'
    };

    // Update dashboard stats
    document.getElementById('total-assets').textContent = dashboardData.totalAssets;
    document.getElementById('total-alerts').textContent = dashboardData.totalAlerts;
    document.getElementById('avg-quality').textContent = dashboardData.avgQuality;

    // Check current page context
    await updateCurrentPageInfo();

  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

/**
 * Update current page info in dashboard
 */
async function updateCurrentPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      document.getElementById('current-page-info').textContent =
        'Open a Power BI report to fetch data quality metrics';
      return;
    }

    const isPowerBI = tab.url.includes('powerbi.com');

    if (isPowerBI) {
      document.getElementById('current-page-info').innerHTML =
        '✅ Power BI report detected. Click "Fetch Power BI Data Quality" to view metrics.';
    } else {
      document.getElementById('current-page-info').textContent =
        'Open a Power BI report to fetch data quality metrics';
    }
  } catch (error) {
    console.error('Error updating page info:', error);
  }
}

/**
 * Handle open ADOC platform
 */
async function handleOpenAdoc() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
    if (response.success && response.data.baseUrl) {
      await chrome.tabs.create({ url: response.data.baseUrl });
    } else {
      await chrome.tabs.create({ url: ACCELDATA_LOGIN_URL });
    }
  } catch (error) {
    console.error('Error opening ADOC:', error);
  }
}

/**
 * Handle fetch button click from dashboard
 */
async function handleFetch() {
  try {
    // Show loading state
    showView('loading');

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      throw new Error('No active tab found');
    }

    // Check if it's a Power BI page
    const isPowerBI = tab.url && tab.url.includes('powerbi.com');

    if (!isPowerBI) {
      showError('Please open a Power BI report to fetch reliability data');
      showView('dashboard');
      return;
    }

    // Get Power BI context from content script
    const contextResponse = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_CONTEXT'
    });

    if (!contextResponse || !contextResponse.workspaceId || !contextResponse.reportId) {
      throw new Error('Unable to detect Power BI report context. Please ensure you are viewing a report.');
    }

    // Fetch data from ADOC
    const dataResponse = await chrome.runtime.sendMessage({
      type: 'GET_POWERBI_REPORT',
      payload: {
        workspaceId: contextResponse.workspaceId,
        reportId: contextResponse.reportId
      }
    });

    if (!dataResponse.success) {
      throw new Error(dataResponse.error || 'Failed to fetch data');
    }

    // Determine which case to show based on data
    const caseType = determineCase(dataResponse.data);
    displayData(caseType, dataResponse.data);

  } catch (error) {
    console.error('Error fetching data:', error);
    showError(error.message || 'Failed to fetch reliability data');
    showView('dashboard');
  }
}

/**
 * Determine which case to display (1A, 1B, or 2)
 */
function determineCase(data) {
  const { underlyingAssets = [], alerts = [] } = data;

  // Case 2: No data assets available
  if (!underlyingAssets || underlyingAssets.length === 0) {
    return 'case-2';
  }

  // Case 1B: Data found with alerts
  if (alerts && alerts.length > 0) {
    return 'case-1b';
  }

  // Case 1A: Data found, no alerts
  return 'case-1a';
}

/**
 * Display fetched data based on case type
 */
function displayData(caseType, data) {
  switch (caseType) {
    case 'case-1a':
      displayCase1A(data);
      showView('case-1a');
      break;
    case 'case-1b':
      displayCase1B(data);
      showView('case-1b');
      break;
    case 'case-2':
      displayCase2(data);
      showView('case-2');
      break;
  }
}

/**
 * Display Case 1A: Data found, no alerts
 */
function displayCase1A(data) {
  const {
    reportName = 'Power BI Report',
    underlyingAssets = [],
    overallReliability = 0
  } = data;

  // Calculate overall score
  const avgScore = underlyingAssets.length > 0
    ? Math.round(underlyingAssets.reduce((sum, a) => sum + (a.reliabilityScore || 0), 0) / underlyingAssets.length)
    : overallReliability;

  // Build content HTML
  const html = `
    <!-- Score Display -->
    <div class="score-display">
      <div class="score-label">Overall Reliability Score</div>
      <div class="score-value">${avgScore}%</div>
      <div class="score-subtitle">${reportName}</div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active" data-tab="overview">Overview</button>
      <button class="tab" data-tab="details">Details</button>
    </div>

    <!-- Tab: Overview -->
    <div class="tab-content active" id="tab-overview">
      <div class="asset-list">
        ${underlyingAssets.map(asset => `
          <div class="asset-item">
            <div class="asset-header">
              <div class="asset-name">${asset.tableName || asset.name || 'Unknown Asset'}</div>
              <div class="asset-score ${getScoreClass(asset.reliabilityScore || 0)}">
                ${asset.reliabilityScore || 0}%
              </div>
            </div>
            <div class="asset-fqn">${asset.fqn || 'No FQN available'}</div>
            <span class="asset-status status-healthy">
              <span class="status-dot dot-success"></span>
              No Issues
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Tab: Details -->
    <div class="tab-content" id="tab-details">
      <div class="empty-state">
        <p>All data quality checks are passing. No issues to report.</p>
      </div>
    </div>
  `;

  document.getElementById('case-1a-content').innerHTML = html;
  setupTabSwitching('case-1a-content');
}

/**
 * Display Case 1B: Data found with alerts
 */
function displayCase1B(data) {
  const {
    reportName = 'Power BI Report',
    underlyingAssets = [],
    overallReliability = 0,
    alerts = []
  } = data;

  // Calculate overall score
  const avgScore = underlyingAssets.length > 0
    ? Math.round(underlyingAssets.reduce((sum, a) => sum + (a.reliabilityScore || 0), 0) / underlyingAssets.length)
    : overallReliability;

  // Update alert summary
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;

  let summary = '';
  if (criticalCount > 0) {
    summary = `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} detected`;
  } else if (highCount > 0) {
    summary = `${highCount} high priority issue${highCount > 1 ? 's' : ''} detected`;
  } else {
    summary = `${alerts.length} data quality issue${alerts.length > 1 ? 's' : ''} detected`;
  }

  document.getElementById('alert-summary').textContent = summary;

  // Build content HTML
  const html = `
    <!-- Score Display -->
    <div class="score-display">
      <div class="score-label">Overall Reliability Score</div>
      <div class="score-value">${avgScore}%</div>
      <div class="score-subtitle">${reportName}</div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active" data-tab="alerts">Alerts (${alerts.length})</button>
      <button class="tab" data-tab="assets">Assets (${underlyingAssets.length})</button>
    </div>

    <!-- Tab: Alerts -->
    <div class="tab-content active" id="tab-alerts">
      <div class="asset-list">
        ${alerts.map(alert => `
          <div class="alert-item severity-${alert.severity.toLowerCase()}">
            <div class="alert-header">
              <span class="alert-badge alert-${alert.severity.toLowerCase()}">
                ${alert.severity}
              </span>
              <span class="alert-title">${alert.title || 'Data Quality Issue'}</span>
            </div>
            <div class="alert-description">${alert.description || 'No description available'}</div>
            <div class="alert-meta">
              <span>${alert.assetName || 'Unknown Asset'}</span>
              <span class="alert-time">${formatTime(alert.timestamp)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Tab: Assets -->
    <div class="tab-content" id="tab-assets">
      <div class="asset-list">
        ${underlyingAssets.map(asset => {
          const assetAlerts = alerts.filter(a => a.assetName === asset.tableName || a.assetId === asset.id);
          return `
            <div class="asset-item">
              <div class="asset-header">
                <div class="asset-name">${asset.tableName || asset.name || 'Unknown Asset'}</div>
                <div class="asset-score ${getScoreClass(asset.reliabilityScore || 0)}">
                  ${asset.reliabilityScore || 0}%
                </div>
              </div>
              <div class="asset-fqn">${asset.fqn || 'No FQN available'}</div>
              ${assetAlerts.length > 0 ? `
                <span class="asset-status status-alerts">
                  <span class="status-dot dot-warning"></span>
                  ${assetAlerts.length} Alert${assetAlerts.length > 1 ? 's' : ''}
                </span>
              ` : `
                <span class="asset-status status-healthy">
                  <span class="status-dot dot-success"></span>
                  No Issues
                </span>
              `}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.getElementById('case-1b-content').innerHTML = html;
  setupTabSwitching('case-1b-content');
}

/**
 * Display Case 2: No data available
 */
function displayCase2(data) {
  // Already has static content in HTML, just show the view
  // You can add dynamic content here if needed
}

/**
 * Setup tab switching for a container
 */
function setupTabSwitching(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tabs = container.querySelectorAll('.tab');
  const tabContents = container.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabName}`) {
          content.classList.add('active');
        }
      });
    });
  });
}

/**
 * Show specific view
 */
function showView(viewName) {
  // Hide all views
  viewLogin.style.display = 'none';
  viewDashboard.style.display = 'none';
  viewLoading.style.display = 'none';
  viewCase1A.style.display = 'none';
  viewCase1B.style.display = 'none';
  viewCase2.style.display = 'none';

  // Show requested view
  switch (viewName) {
    case 'login':
      viewLogin.style.display = 'flex';
      break;
    case 'dashboard':
      viewDashboard.style.display = 'flex';
      break;
    case 'loading':
      viewLoading.style.display = 'flex';
      break;
    case 'case-1a':
      viewCase1A.style.display = 'flex';
      break;
    case 'case-1b':
      viewCase1B.style.display = 'flex';
      break;
    case 'case-2':
      viewCase2.style.display = 'flex';
      break;
  }

  currentView = viewName;
}

/**
 * Show error message
 */
function showError(message) {
  alert(message);
}

/**
 * Get CSS class for score
 */
function getScoreClass(score) {
  if (score >= 80) return 'score-excellent';
  if (score >= 60) return 'score-good';
  if (score >= 40) return 'score-warning';
  return 'score-critical';
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000 / 60); // minutes

  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleDateString();
}

// Cleanup on popup close
window.addEventListener('unload', () => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }
});
