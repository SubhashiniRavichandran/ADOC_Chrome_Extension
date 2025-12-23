/**
 * Popup JavaScript
 * Handles popup UI interactions and data display
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const loadingState = document.getElementById('loading-state');
  const notConfigured = document.getElementById('not-configured');
  const dashboardState = document.getElementById('dashboard-state');
  const connectionStatus = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');

  // Quick stats elements
  const assetCount = document.getElementById('asset-count');
  const alertCount = document.getElementById('alert-count');
  const avgScore = document.getElementById('avg-score');

  // Context and alerts
  const currentContextSection = document.getElementById('current-context-section');
  const currentContext = document.getElementById('current-context');
  const alertsList = document.getElementById('alerts-list');

  // Buttons
  const settingsBtn = document.getElementById('settings-btn');
  const configureBtn = document.getElementById('configure-btn');
  const openAdocBtn = document.getElementById('open-adoc-btn');
  const refreshBtn = document.getElementById('refresh-btn');

  // Set up button listeners
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  if (configureBtn) {
    configureBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  refreshBtn.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
    await loadDashboard();
  });

  openAdocBtn.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
    if (response.success && response.data.baseUrl) {
      chrome.tabs.create({ url: response.data.baseUrl });
    }
  });

  // Initialize popup
  await initialize();

  /**
   * Initialize popup
   */
  async function initialize() {
    try {
      // Check if credentials are configured
      const credResponse = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });

      if (!credResponse.success || !credResponse.data.hasCredentials) {
        showNotConfigured();
        return;
      }

      // Test connection
      const connResponse = await chrome.runtime.sendMessage({ type: 'TEST_CONNECTION' });

      if (!connResponse.success || !connResponse.data.connected) {
        showConnectionError();
        return;
      }

      // Show connected status
      showConnected();

      // Load dashboard
      await loadDashboard();
    } catch (error) {
      console.error('Error initializing popup:', error);
      showError(error.message);
    }
  }

  /**
   * Load dashboard data
   */
  async function loadDashboard() {
    try {
      loadingState.style.display = 'block';
      dashboardState.style.display = 'none';

      // Get current context
      const contextResponse = await chrome.runtime.sendMessage({ type: 'GET_CONTEXT' });

      if (contextResponse.success && contextResponse.data) {
        displayContext(contextResponse.data);
        await loadContextData(contextResponse.data);
      } else {
        // No active context, show placeholder
        displayNoContext();
      }

      loadingState.style.display = 'none';
      dashboardState.style.display = 'block';
    } catch (error) {
      console.error('Error loading dashboard:', error);
      loadingState.style.display = 'none';
      showError(error.message);
    }
  }

  /**
   * Load data for current context
   */
  async function loadContextData(context) {
    if (context.biTool === 'powerbi' && context.workspaceId && context.reportId) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_POWERBI_REPORT',
          payload: {
            workspaceId: context.workspaceId,
            reportId: context.reportId
          }
        });

        if (response.success && response.data) {
          displayReportData(response.data);
        }
      } catch (error) {
        console.error('Error loading context data:', error);
      }
    }
  }

  /**
   * Display context information
   */
  function displayContext(context) {
    currentContextSection.style.display = 'block';

    let contextHtml = '';

    if (context.biTool === 'powerbi') {
      contextHtml = `
        <div class="context-item">
          <strong>BI Tool:</strong> Power BI
        </div>
        <div class="context-item">
          <strong>Report ID:</strong> ${context.reportId.substring(0, 8)}...
        </div>
      `;
    } else if (context.biTool === 'tableau') {
      contextHtml = `
        <div class="context-item">
          <strong>BI Tool:</strong> Tableau
        </div>
        <div class="context-item">
          <strong>View:</strong> ${context.workbook} / ${context.view}
        </div>
      `;
    } else if (context.biTool === 'looker') {
      contextHtml = `
        <div class="context-item">
          <strong>BI Tool:</strong> Looker
        </div>
        <div class="context-item">
          <strong>Type:</strong> ${context.type}
        </div>
      `;
    }

    currentContext.innerHTML = contextHtml;
  }

  /**
   * Display no context message
   */
  function displayNoContext() {
    currentContextSection.style.display = 'block';
    currentContext.innerHTML = `
      <p class="empty-message">Open a PowerBI, Tableau, or Looker page to view data reliability information.</p>
    `;

    assetCount.textContent = '-';
    alertCount.textContent = '-';
    avgScore.textContent = '-';
    alertsList.innerHTML = '<p class="empty-message">No alerts to display</p>';
  }

  /**
   * Display report data
   */
  function displayReportData(reportData) {
    const { underlyingAssets = [], reportName } = reportData;

    // Update quick stats
    assetCount.textContent = underlyingAssets.length;

    const totalAlerts = underlyingAssets.reduce((sum, a) => sum + (a.openAlerts || 0), 0);
    alertCount.textContent = totalAlerts;

    const avgReliability = underlyingAssets.length > 0
      ? Math.round(underlyingAssets.reduce((sum, a) => sum + (a.reliabilityScore || 0), 0) / underlyingAssets.length)
      : 0;
    avgScore.textContent = `${avgReliability}%`;

    // Display alerts
    if (totalAlerts > 0) {
      alertsList.innerHTML = underlyingAssets
        .filter(a => a.openAlerts > 0)
        .map(asset => `
          <div class="alert-item">
            <div class="alert-header">
              <span class="alert-severity severity-high">⚠</span>
              <span class="alert-title">${asset.tableName}</span>
            </div>
            <div class="alert-description">
              ${asset.openAlerts} open alert${asset.openAlerts > 1 ? 's' : ''}
            </div>
          </div>
        `)
        .join('');
    } else {
      alertsList.innerHTML = '<p class="empty-message">No active alerts</p>';
    }
  }

  /**
   * Show not configured state
   */
  function showNotConfigured() {
    loadingState.style.display = 'none';
    notConfigured.style.display = 'block';
    dashboardState.style.display = 'none';

    connectionStatus.className = 'connection-status status-warning';
    statusText.textContent = 'Not configured';
  }

  /**
   * Show connection error
   */
  function showConnectionError() {
    loadingState.style.display = 'none';
    notConfigured.style.display = 'block';
    dashboardState.style.display = 'none';

    connectionStatus.className = 'connection-status status-error';
    statusText.textContent = 'Connection failed';

    document.querySelector('.empty-state h3').textContent = 'Connection Failed';
    document.querySelector('.empty-state p').textContent = 'Unable to connect to ADOC. Please check your credentials.';
  }

  /**
   * Show connected status
   */
  function showConnected() {
    connectionStatus.className = 'connection-status status-success';
    statusText.textContent = 'Connected';
  }

  /**
   * Show error message
   */
  function showError(message) {
    alertsList.innerHTML = `
      <div class="error-message">
        <p>Error: ${message}</p>
      </div>
    `;
  }
});
