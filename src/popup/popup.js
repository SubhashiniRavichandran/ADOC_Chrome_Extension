/**
 * ADOC Extension Popup - Updated with OAuth Flow
 * Handles login flow and data fetching
 */

// Configuration
const ACCELDATA_LOGIN_URL = 'https://indiumtech.acceldata.app/';
const SESSION_CHECK_INTERVAL = 2000; // Check every 2 seconds

// State
let currentView = 'login';
let isLoggedIn = false;
let sessionCheckInterval = null;

// DOM Elements
let viewLogin, viewFetch, viewLoading, viewData;
let loginBtn, fetchBtn, closeBtn;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM elements
  viewLogin = document.getElementById('view-login');
  viewFetch = document.getElementById('view-fetch');
  viewLoading = document.getElementById('view-loading');
  viewData = document.getElementById('view-data');

  loginBtn = document.getElementById('login-btn');
  fetchBtn = document.getElementById('fetch-btn');
  closeBtn = document.getElementById('close-btn');

  // Set up event listeners
  loginBtn.addEventListener('click', handleLogin);
  fetchBtn.addEventListener('click', handleFetch);
  closeBtn.addEventListener('click', () => window.close());

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
      // User has credentials - show fetch view
      isLoggedIn = true;
      showView('fetch');
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

    // Show a message to user (optional)
    console.log('Opened Acceldata login page. Waiting for authentication...');

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
        showView('fetch');

        // Close the login tab (optional)
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
 * Handle fetch button click
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
      showView('fetch');
      return;
    }

    // Get Power BI context from content script
    const contextResponse = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_CONTEXT'
    });

    if (!contextResponse || !contextResponse.workspaceId || !contextResponse.reportId) {
      throw new Error('Unable to detect Power BI report context');
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

    // Display the data
    displayData(dataResponse.data);
    showView('data');

  } catch (error) {
    console.error('Error fetching data:', error);
    showError(error.message || 'Failed to fetch reliability data');
    showView('fetch');
  }
}

/**
 * Display fetched data
 */
function displayData(data) {
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

  // Build data view HTML
  const html = `
    <div class="data-content">
      <!-- Score Display -->
      <div class="score-display">
        <div class="score-label">Overall Reliability Score</div>
        <div class="score-value">${avgScore}%</div>
        <div class="score-subtitle">${reportName}</div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active" data-tab="overview">Overview</button>
        <button class="tab" data-tab="alerts">Alerts (${alerts.length})</button>
      </div>

      <!-- Tab: Overview -->
      <div class="tab-content active" id="tab-overview">
        <div class="asset-list">
          ${underlyingAssets.length > 0 ? underlyingAssets.map(asset => `
            <div class="asset-item">
              <div class="asset-header">
                <div class="asset-name">${asset.tableName || asset.name || 'Unknown Asset'}</div>
                <div class="asset-score ${getScoreClass(asset.reliabilityScore || 0)}">
                  ${asset.reliabilityScore || 0}%
                </div>
              </div>
              <div class="asset-fqn">${asset.fqn || 'No FQN available'}</div>
            </div>
          `).join('') : '<div class="empty-state">No assets found</div>'}
        </div>
      </div>

      <!-- Tab: Alerts -->
      <div class="tab-content" id="tab-alerts">
        <div class="asset-list">
          ${alerts.length > 0 ? alerts.map(alert => `
            <div class="alert-item">
              <div class="alert-header">
                <span class="alert-badge alert-${alert.severity.toLowerCase()}">
                  ${alert.severity}
                </span>
                <span class="alert-title">${alert.title}</span>
              </div>
              <div class="alert-description">${alert.description}</div>
              <div class="alert-time">${formatTime(alert.timestamp)}</div>
            </div>
          `).join('') : '<div class="empty-state">No active alerts</div>'}
        </div>
      </div>
    </div>
  `;

  viewData.innerHTML = html;

  // Set up tab switching
  const tabs = viewData.querySelectorAll('.tab');
  const tabContents = viewData.querySelectorAll('.tab-content');

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
  viewFetch.style.display = 'none';
  viewLoading.style.display = 'none';
  viewData.style.display = 'none';

  // Show requested view
  switch (viewName) {
    case 'login':
      viewLogin.style.display = 'flex';
      break;
    case 'fetch':
      viewFetch.style.display = 'flex';
      break;
    case 'loading':
      viewLoading.style.display = 'flex';
      break;
    case 'data':
      viewData.style.display = 'flex';
      break;
  }

  currentView = viewName;
}

/**
 * Show error message
 */
function showError(message) {
  // You can enhance this to show error in the UI
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
