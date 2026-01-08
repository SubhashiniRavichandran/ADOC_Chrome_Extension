/**
 * PowerBI Content Script
 * Detects PowerBI context and injects ADOC sidebar
 */

(function () {
  'use strict';

  console.log('ADOC Extension: PowerBI content script loaded');

  // State
  let sidebarInjected = false;
  let currentContext = null;
  let enhancedSidebar = null;
  let columnBadgeInjector = null;
  let toggleButton = null;

  /**
   * Extract PowerBI context from URL
   * Supports multiple URL patterns:
   * - Groups: https://app.powerbi.com/groups/{workspaceId}/reports/{reportId}
   * - My Workspace: https://app.powerbi.com/myorg/reports/{reportId}
   * - Apps: https://app.powerbi.com/apps/{appId}/reports/{reportId}
   */
  function extractPowerBIContext() {
    const url = window.location.href;

    // Pattern 1: Groups (Workspaces)
    const groupsPattern = /\/groups\/([^\/]+)\/reports\/([^\/]+)/;
    let match = url.match(groupsPattern);

    if (match) {
      return {
        biTool: 'powerbi',
        contextType: 'workspace',
        workspaceId: match[1],
        reportId: match[2],
        url: url,
        timestamp: Date.now()
      };
    }

    // Pattern 2: My Workspace
    const myOrgPattern = /\/myorg\/reports\/([^\/]+)/;
    match = url.match(myOrgPattern);

    if (match) {
      return {
        biTool: 'powerbi',
        contextType: 'myorg',
        workspaceId: 'me',
        reportId: match[1],
        url: url,
        timestamp: Date.now()
      };
    }

    // Pattern 3: Apps
    const appsPattern = /\/apps\/([^\/]+)\/reports\/([^\/]+)/;
    match = url.match(appsPattern);

    if (match) {
      return {
        biTool: 'powerbi',
        contextType: 'app',
        appId: match[1],
        workspaceId: match[1], // Use appId as workspaceId for consistency
        reportId: match[2],
        url: url,
        timestamp: Date.now()
      };
    }

    return null;
  }

  /**
   * Extract semantic model information from PowerBI DOM
   * This is a simplified version - actual implementation would need
   * to inspect PowerBI's internal structure
   */
  function extractSemanticModelInfo() {
    // PowerBI loads data asynchronously, so we'll need to wait for it
    // This is a placeholder for the actual implementation
    try {
      // Look for dataset/semantic model information in the DOM
      // Note: Actual implementation would require deeper PowerBI DOM analysis
      const datasetElements = document.querySelectorAll('[data-dataset-id]');
      const datasets = Array.from(datasetElements).map(el => ({
        id: el.getAttribute('data-dataset-id'),
        name: el.getAttribute('data-dataset-name') || 'Unknown'
      }));

      return datasets.length > 0 ? datasets : null;
    } catch (error) {
      console.error('Error extracting semantic model info:', error);
      return null;
    }
  }

  /**
   * Create floating toggle button
   */
  function createToggleButton() {
    if (toggleButton) {
      return;
    }

    toggleButton = document.createElement('button');
    toggleButton.className = 'adoc-toggle-btn';
    toggleButton.innerHTML = 'A';
    toggleButton.title = 'Toggle ADOC Data Reliability Sidebar';

    toggleButton.addEventListener('click', () => {
      const sidebar = document.getElementById('adoc-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('adoc-sidebar-open');

        // Hide toggle button when sidebar is open
        if (sidebar.classList.contains('adoc-sidebar-open')) {
          toggleButton.classList.add('hidden');
        } else {
          toggleButton.classList.remove('hidden');
        }
      }
    });

    document.body.appendChild(toggleButton);

    // Initially hide since sidebar opens automatically
    toggleButton.classList.add('hidden');
  }

  /**
   * Inject ADOC sidebar into PowerBI page
   */
  function injectSidebar() {
    if (sidebarInjected) {
      return;
    }

    console.log('ADOC Extension: Injecting enhanced sidebar into PowerBI');

    // Create enhanced sidebar instance
    enhancedSidebar = new EnhancedSidebar();
    enhancedSidebar.create();

    // Create toggle button
    createToggleButton();

    // Update toggle button visibility when sidebar is closed
    const sidebar = document.getElementById('adoc-sidebar');
    const closeBtn = document.getElementById('adoc-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        setTimeout(() => {
          if (toggleButton && !sidebar.classList.contains('adoc-sidebar-open')) {
            toggleButton.classList.remove('hidden');
          }
        }, 350);
      });
    }

    sidebarInjected = true;

    // Load sidebar content
    loadSidebarContent();
  }

  /**
   * Load sidebar content with data from ADOC
   */
  async function loadSidebarContent() {
    if (!enhancedSidebar) {
      return;
    }

    try {
      // Get current context
      const context = extractPowerBIContext();

      if (!context) {
        const contentDiv = document.getElementById('adoc-sidebar-content');
        if (contentDiv) {
          contentDiv.innerHTML = `
            <div class="adoc-error">
              <p>Unable to detect PowerBI report context.</p>
              <p class="adoc-error-detail">Please open a PowerBI report to view data reliability information.</p>
            </div>
          `;
        }
        return;
      }

      // Update context in background
      await chrome.runtime.sendMessage({
        type: 'UPDATE_CONTEXT',
        payload: context
      });

      currentContext = context;

      // Fetch PowerBI report data from ADOC
      const response = await chrome.runtime.sendMessage({
        type: 'GET_POWERBI_REPORT',
        payload: {
          workspaceId: context.workspaceId,
          reportId: context.reportId
        }
      });

      if (response.success && response.data) {
        renderSidebarContent(response.data);
      } else {
        throw new Error(response.error || 'Failed to load report data');
      }
    } catch (error) {
      console.error('Error loading sidebar content:', error);

      const contentDiv = document.getElementById('adoc-sidebar-content');
      if (contentDiv) {
        contentDiv.innerHTML = `
          <div class="adoc-error">
            <p>Failed to load data reliability information</p>
            <p class="adoc-error-detail">${error.message}</p>
            <button id="adoc-retry-btn" class="adoc-btn adoc-btn-primary">Retry</button>
          </div>
        `;

        // Set up retry button
        const retryBtn = document.getElementById('adoc-retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', loadSidebarContent);
        }
      }
    }
  }

  /**
   * Render sidebar content with PowerBI report data
   */
  function renderSidebarContent(reportData) {
    if (!enhancedSidebar) {
      return;
    }

    // Add reportId to data
    reportData.reportId = currentContext?.reportId;

    // Update enhanced sidebar with data
    enhancedSidebar.updateData(reportData);

    // Initialize column badge injector if we have column data
    const allColumns = [];
    if (reportData.underlyingAssets) {
      reportData.underlyingAssets.forEach(asset => {
        if (asset.columnScores && asset.columnScores.length > 0) {
          asset.columnScores.forEach(col => {
            allColumns.push({ ...col, assetName: asset.tableName });
          });
        } else if (asset.columnUsage && asset.columnUsage.length > 0) {
          asset.columnUsage.forEach(colName => {
            allColumns.push({
              columnName: colName,
              assetName: asset.tableName,
              score: asset.reliabilityScore || 0,
              failingRules: 0
            });
          });
        }
      });
    }

    // Inject column badges if we have column data
    if (allColumns.length > 0) {
      if (!columnBadgeInjector) {
        columnBadgeInjector = new ColumnBadgeInjector();
      }
      columnBadgeInjector.initialize(allColumns);
    }
  }



  /**
   * Helper function to get score indicator
   */
  function getScoreIndicator(score) {
    if (score >= 90) {
      return { emoji: '🟢', color: '#22c55e', label: 'High', className: 'score-high' };
    } else if (score >= 70) {
      return { emoji: '🟡', color: '#eab308', label: 'Medium', className: 'score-medium' };
    } else {
      return { emoji: '🔴', color: '#ef4444', label: 'Low', className: 'score-low' };
    }
  }

  /**
   * Helper function to format timestamp
   */
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffMins / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  /**
   * Monitor for page changes (SPA navigation)
   */
  function monitorPageChanges() {
    let lastUrl = window.location.href;

    // Use MutationObserver to detect URL changes
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;

      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('ADOC Extension: PowerBI page changed');

        // Re-extract context and reload sidebar
        const newContext = extractPowerBIContext();

        if (newContext && JSON.stringify(newContext) !== JSON.stringify(currentContext)) {
          currentContext = newContext;
          loadSidebarContent();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Initialize extension when page is ready
   */
  function initialize() {
    console.log('ADOC Extension: Initializing PowerBI integration');

    // Try to extract context immediately
    const context = extractPowerBIContext();

    if (context) {
      console.log('ADOC Extension: PowerBI context detected immediately', context);
      injectSidebar();
      monitorPageChanges();
    } else {
      // If no context yet, wait and retry
      console.log('ADOC Extension: Waiting for PowerBI to load...');
      setTimeout(() => {
        const retryContext = extractPowerBIContext();

        if (retryContext) {
          console.log('ADOC Extension: PowerBI context detected on retry', retryContext);
          injectSidebar();
          monitorPageChanges();
        } else {
          console.log('ADOC Extension: No PowerBI report context found');
        }
      }, 1500);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_SIDEBAR') {
      const sidebar = document.getElementById('adoc-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('adoc-sidebar-open');
      }
      sendResponse({ success: true });
    } else if (message.type === 'PLAY_NOTIFICATION_SOUND') {
      playNotificationSound();
      sendResponse({ success: true });
    }

    return true;
  });

  /**
   * Play notification sound using Web Audio API
   */
  function playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

})();
