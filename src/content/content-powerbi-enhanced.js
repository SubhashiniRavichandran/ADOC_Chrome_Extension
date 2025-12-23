/**
 * Enhanced PowerBI Content Script
 * Full-featured integration with lineage, alerts, and column badges
 */

(function() {
  'use strict';

  console.log('ADOC Extension: Enhanced PowerBI content script loaded');

  // Load required scripts
  const scriptLoader = document.createElement('script');
  scriptLoader.src = chrome.runtime.getURL('src/utils/powerbi-detector.js');
  document.head.appendChild(scriptLoader);

  const componentsLoader = document.createElement('script');
  componentsLoader.src = chrome.runtime.getURL('src/sidebar/sidebar-components.js');
  document.head.appendChild(componentsLoader);

  // State
  let sidebarInjected = false;
  let currentContext = null;
  let currentData = null;
  let activeTab = 'overview';

  // Global functions for alert actions
  window.adocViewAlert = viewAlertDetails;
  window.adocAcknowledgeAlert = acknowledgeAlert;

  /**
   * Wait for scripts to load
   */
  function waitForScripts() {
    return new Promise((resolve) => {
      const checkScripts = () => {
        if (window.PowerBIDetector && window.SidebarComponents) {
          resolve();
        } else {
          setTimeout(checkScripts, 100);
        }
      };
      checkScripts();
    });
  }

  /**
   * Initialize extension
   */
  async function initialize() {
    try {
      // Wait for PowerBI to load
      await window.PowerBIDetector.waitForLoad();

      // Wait for our scripts to load
      await waitForScripts();

      // Extract context
      const context = window.PowerBIDetector.extractContext();

      if (context && (context.reportId || context.dashboardId)) {
        currentContext = context;
        injectSidebar();
        setupChangeMonitoring();
      }
    } catch (error) {
      console.error('ADOC Extension: Initialization error:', error);
    }
  }

  /**
   * Inject ADOC sidebar
   */
  function injectSidebar() {
    if (sidebarInjected) {
      return;
    }

    console.log('ADOC Extension: Injecting enhanced sidebar into PowerBI');

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'adoc-sidebar';
    sidebar.className = 'adoc-sidebar';

    // Create sidebar header
    const header = document.createElement('div');
    header.className = 'adoc-sidebar-header';
    header.innerHTML = `
      <div class="adoc-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        ADOC Data Reliability
      </div>
      <button id="adoc-close-btn" class="adoc-close-btn" title="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
        </svg>
      </button>
    `;

    // Create sidebar content
    const content = document.createElement('div');
    content.id = 'adoc-sidebar-content';
    content.className = 'adoc-sidebar-content';
    content.innerHTML = `
      <div class="adoc-loading">
        <div class="adoc-spinner"></div>
        <p>Loading data reliability information...</p>
      </div>
    `;

    sidebar.appendChild(header);
    sidebar.appendChild(content);
    document.body.appendChild(sidebar);

    // Set up close button
    document.getElementById('adoc-close-btn').addEventListener('click', () => {
      sidebar.classList.remove('adoc-sidebar-open');
    });

    // Open sidebar by default
    setTimeout(() => {
      sidebar.classList.add('adoc-sidebar-open');
    }, 500);

    sidebarInjected = true;

    // Load sidebar content
    loadSidebarContent();
  }

  /**
   * Load sidebar content with full data
   */
  async function loadSidebarContent() {
    const contentDiv = document.getElementById('adoc-sidebar-content');
    if (!contentDiv) return;

    try {
      // Update context in background
      await chrome.runtime.sendMessage({
        type: 'UPDATE_CONTEXT',
        payload: currentContext
      });

      // Fetch PowerBI report data from ADOC
      const response = await chrome.runtime.sendMessage({
        type: 'GET_POWERBI_REPORT',
        payload: {
          workspaceId: currentContext.workspaceId,
          reportId: currentContext.reportId
        }
      });

      if (response.success && response.data) {
        currentData = response.data;
        await enrichDataWithDetails();
        renderEnhancedSidebar();
      } else {
        throw new Error(response.error || 'Failed to load report data');
      }
    } catch (error) {
      console.error('Error loading sidebar content:', error);
      showError(error.message);
    }
  }

  /**
   * Enrich data with additional details (alerts, lineage, column scores)
   */
  async function enrichDataWithDetails() {
    if (!currentData.underlyingAssets) return;

    const assetIds = currentData.underlyingAssets.map(a => a.adocAssetId).filter(Boolean);

    // Fetch alerts for all assets
    try {
      const alertsResponse = await chrome.runtime.sendMessage({
        type: 'GET_ALERTS',
        payload: { assetIds, severity: null, status: 'OPEN' }
      });

      if (alertsResponse.success) {
        currentData.alerts = alertsResponse.data.alerts || [];
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      currentData.alerts = [];
    }

    // Fetch detailed scores for first asset (as example)
    if (assetIds.length > 0) {
      try {
        const scoreResponse = await chrome.runtime.sendMessage({
          type: 'GET_RELIABILITY_SCORE',
          payload: { assetId: assetIds[0] }
        });

        if (scoreResponse.success) {
          currentData.detailedScore = scoreResponse.data;
        }
      } catch (error) {
        console.error('Error fetching detailed scores:', error);
      }
    }

    // Fetch lineage for first asset
    if (assetIds.length > 0) {
      try {
        const lineageResponse = await chrome.runtime.sendMessage({
          type: 'GET_LINEAGE',
          payload: { assetId: assetIds[0], direction: 'BOTH', depth: 2 }
        });

        if (lineageResponse.success) {
          currentData.lineage = lineageResponse.data;
        }
      } catch (error) {
        console.error('Error fetching lineage:', error);
      }
    }
  }

  /**
   * Render enhanced sidebar with tabs
   */
  function renderEnhancedSidebar() {
    const contentDiv = document.getElementById('adoc-sidebar-content');
    if (!contentDiv) return;

    const { underlyingAssets = [], reportName = 'Report', alerts = [] } = currentData;

    // Calculate overall score
    const overallScore = underlyingAssets.length > 0
      ? Math.round(underlyingAssets.reduce((sum, a) => sum + (a.reliabilityScore || 0), 0) / underlyingAssets.length)
      : 0;

    const scoreIndicator = window.SidebarComponents.getScoreIndicator(overallScore);

    // Create tab content
    const overviewContent = createOverviewTab();
    const alertsContent = createAlertsTab();
    const lineageContent = createLineageTab();
    const columnsContent = createColumnsTab();

    // Create tabbed interface
    const tabs = [
      { label: 'Overview', icon: '📊', content: overviewContent, badge: null },
      { label: 'Alerts', icon: '⚠️', content: alertsContent, badge: alerts.length > 0 ? alerts.length : null },
      { label: 'Lineage', icon: '🔗', content: lineageContent, badge: null },
      { label: 'Columns', icon: '📋', content: columnsContent, badge: null }
    ];

    const tabbedView = window.SidebarComponents.createTabbedView(tabs, 0);

    contentDiv.innerHTML = tabbedView;

    // Set up tab navigation
    window.SidebarComponents.setupTabNavigation(contentDiv);

    // Set up action buttons
    setupEnhancedActions();

    // Inject column badges into PowerBI visuals
    if (currentData.detailedScore?.columnScores) {
      window.PowerBIDetector.injectColumnBadges(currentData.detailedScore.columnScores);
    }
  }

  /**
   * Create overview tab content
   */
  function createOverviewTab() {
    const { underlyingAssets = [], reportName = 'Report', lastRefreshed } = currentData;

    const overallScore = underlyingAssets.length > 0
      ? Math.round(underlyingAssets.reduce((sum, a) => sum + (a.reliabilityScore || 0), 0) / underlyingAssets.length)
      : 0;

    const scoreIndicator = window.SidebarComponents.getScoreIndicator(overallScore);
    const totalAlerts = currentData.alerts?.length || 0;

    return `
      <div class="adoc-tab-content-inner">
        <div class="adoc-section">
          <h3>Report Overview</h3>
          <div class="adoc-report-name">${reportName}</div>
          ${currentContext.pageName ? `<div class="adoc-page-name">Page: ${currentContext.pageName}</div>` : ''}
          <div class="adoc-score-card">
            <div class="adoc-score-label">Overall Reliability Score</div>
            <div class="adoc-score-value ${scoreIndicator.className}">
              ${scoreIndicator.emoji} ${overallScore}%
            </div>
          </div>
        </div>

        ${totalAlerts > 0 ? `
          <div class="adoc-section adoc-alerts-section">
            <h3>⚠ ${totalAlerts} Active Alert${totalAlerts > 1 ? 's' : ''}</h3>
            <div class="adoc-alert-summary">
              Data quality issues detected. See Alerts tab for details.
            </div>
          </div>
        ` : ''}

        <div class="adoc-section">
          <h3>📊 Underlying Assets (${underlyingAssets.length})</h3>
          <div class="adoc-assets-list">
            ${underlyingAssets.map(asset => {
              const assetScore = window.SidebarComponents.getScoreIndicator(asset.reliabilityScore || 0);
              return `
                <div class="adoc-asset-item">
                  <div class="adoc-asset-header">
                    <span class="adoc-asset-name">${asset.tableName}</span>
                    <span class="adoc-asset-score ${assetScore.className}">
                      ${assetScore.emoji} ${asset.reliabilityScore}%
                    </span>
                  </div>
                  ${asset.openAlerts > 0 ? `
                    <div class="adoc-asset-alerts">
                      ⚠ ${asset.openAlerts} alert${asset.openAlerts > 1 ? 's' : ''}
                    </div>
                  ` : ''}
                  ${asset.columnUsage && asset.columnUsage.length > 0 ? `
                    <div class="adoc-asset-columns">
                      Columns: ${asset.columnUsage.join(', ')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        ${lastRefreshed ? `
          <div class="adoc-footer">
            Last updated: ${window.SidebarComponents.formatTimestamp(lastRefreshed)}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create alerts tab content
   */
  function createAlertsTab() {
    const alerts = currentData.alerts || [];

    return `
      <div class="adoc-tab-content-inner">
        <div class="adoc-section">
          <h3>Active Alerts (${alerts.length})</h3>
          ${window.SidebarComponents.createFilterControls({ showSearchBar: false, showRefreshButton: false })}
          ${window.SidebarComponents.createAlertsList(alerts, acknowledgeAlert, viewAlertDetails)}
        </div>
      </div>
    `;
  }

  /**
   * Create lineage tab content
   */
  function createLineageTab() {
    const lineageData = currentData.lineage;

    if (!lineageData) {
      return `
        <div class="adoc-tab-content-inner">
          <div class="adoc-section">
            <p class="adoc-empty-message">Lineage data not available</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="adoc-tab-content-inner">
        <div class="adoc-section">
          <h3>Data Lineage</h3>
          ${window.SidebarComponents.createLineageView(lineageData)}
        </div>
      </div>
    `;
  }

  /**
   * Create columns tab content
   */
  function createColumnsTab() {
    const columnScores = currentData.detailedScore?.columnScores || [];

    return `
      <div class="adoc-tab-content-inner">
        <div class="adoc-section">
          <h3>Column Quality Scores (${columnScores.length})</h3>
          ${window.SidebarComponents.createColumnBadges(columnScores)}
        </div>
      </div>
    `;
  }

  /**
   * Set up enhanced action buttons
   */
  function setupEnhancedActions() {
    const openInAdocButtons = document.querySelectorAll('.adoc-btn-link, #adoc-open-in-adoc');
    openInAdocButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const href = btn.getAttribute('href');
        if (href) {
          window.open(href, '_blank');
        } else {
          const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
          if (response.success && response.data.baseUrl) {
            window.open(`${response.data.baseUrl}/reports/${currentContext.reportId}`, '_blank');
          }
        }
      });
    });

    const refreshButtons = document.querySelectorAll('#adoc-refresh-data, #adoc-refresh-btn');
    refreshButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
        loadSidebarContent();
      });
    });
  }

  /**
   * View alert details
   */
  function viewAlertDetails(alertId) {
    const alert = currentData.alerts?.find(a => a.id === alertId);
    if (alert && alert.link) {
      window.open(alert.link, '_blank');
    }
  }

  /**
   * Acknowledge alert
   */
  async function acknowledgeAlert(alertId) {
    try {
      await chrome.runtime.sendMessage({
        type: 'ACKNOWLEDGE_ALERT',
        payload: { alertId }
      });

      // Reload sidebar to reflect changes
      await loadSidebarContent();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    const contentDiv = document.getElementById('adoc-sidebar-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = `
      <div class="adoc-error">
        <p>Failed to load data reliability information</p>
        <p class="adoc-error-detail">${message}</p>
        <button id="adoc-retry-btn" class="adoc-btn adoc-btn-primary">Retry</button>
      </div>
    `;

    document.getElementById('adoc-retry-btn')?.addEventListener('click', loadSidebarContent);
  }

  /**
   * Set up change monitoring
   */
  function setupChangeMonitoring() {
    window.PowerBIDetector.setupChangeMonitoring((newContext) => {
      console.log('ADOC Extension: PowerBI context changed', newContext);

      if (JSON.stringify(newContext) !== JSON.stringify(currentContext)) {
        currentContext = newContext;
        loadSidebarContent();
      }
    });
  }

  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_SIDEBAR') {
      const sidebar = document.getElementById('adoc-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('adoc-sidebar-open');
      }
      sendResponse({ success: true });
    } else if (message.type === 'PLAY_NOTIFICATION_SOUND') {
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn7atbFAphpN/uvmoeB');
      audio.volume = 0.3;
      audio.play().catch(() => {});
      sendResponse({ success: true });
    }
    return true;
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // Wait a bit for PowerBI to initialize
    setTimeout(initialize, 2000);
  }

})();
