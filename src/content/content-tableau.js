/**
 * Tableau Content Script
 * Detects Tableau context and injects ADOC sidebar
 */

(function() {
  'use strict';

  console.log('ADOC Extension: Tableau content script loaded');

  // State
  let sidebarInjected = false;
  let currentContext = null;

  /**
   * Extract Tableau context from URL
   * URL Pattern: https://{server}.tableau.com/t/{site}/views/{workbook}/{view}
   */
  function extractTableauContext() {
    const urlPattern = /\/t\/([^\/]+)\/views\/([^\/]+)\/([^\/\?]+)/;
    const match = window.location.href.match(urlPattern);

    if (match) {
      return {
        biTool: 'tableau',
        site: match[1],
        workbook: match[2],
        view: match[3],
        url: window.location.href,
        timestamp: Date.now()
      };
    }

    // Alternative pattern for Tableau Server
    const serverPattern = /\/views\/([^\/]+)\/([^\/\?]+)/;
    const serverMatch = window.location.href.match(serverPattern);

    if (serverMatch) {
      return {
        biTool: 'tableau',
        workbook: serverMatch[1],
        view: serverMatch[2],
        url: window.location.href,
        timestamp: Date.now()
      };
    }

    return null;
  }

  /**
   * Inject ADOC sidebar into Tableau page
   */
  function injectSidebar() {
    if (sidebarInjected) {
      return;
    }

    console.log('ADOC Extension: Injecting sidebar into Tableau');

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'adoc-sidebar';
    sidebar.className = 'adoc-sidebar';

    // Create sidebar header
    const header = document.createElement('div');
    header.className = 'adoc-sidebar-header';
    header.innerHTML = `
      <div class="adoc-logo">ADOC Data Reliability</div>
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
    const closeBtn = document.getElementById('adoc-close-btn');
    closeBtn.addEventListener('click', () => {
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
   * Load sidebar content - placeholder for Tableau
   */
  async function loadSidebarContent() {
    const contentDiv = document.getElementById('adoc-sidebar-content');

    if (!contentDiv) {
      return;
    }

    try {
      const context = extractTableauContext();

      if (!context) {
        contentDiv.innerHTML = `
          <div class="adoc-error">
            <p>Unable to detect Tableau view context.</p>
            <p class="adoc-error-detail">Please open a Tableau view to see data reliability information.</p>
          </div>
        `;
        return;
      }

      // Update context in background
      await chrome.runtime.sendMessage({
        type: 'UPDATE_CONTEXT',
        payload: context
      });

      currentContext = context;

      // Show placeholder content for Tableau (Phase 2)
      contentDiv.innerHTML = `
        <div class="adoc-section">
          <h3>Tableau Integration</h3>
          <p>Tableau support is coming in Phase 2.</p>
          <div class="adoc-context-info">
            <p><strong>Current View:</strong></p>
            <p>${context.workbook} / ${context.view}</p>
          </div>
        </div>
        <div class="adoc-section adoc-actions">
          <button id="adoc-open-settings" class="adoc-btn adoc-btn-primary">
            Open Settings
          </button>
        </div>
      `;

      // Set up settings button
      const settingsBtn = document.getElementById('adoc-open-settings');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          chrome.runtime.openOptionsPage();
        });
      }
    } catch (error) {
      console.error('Error loading Tableau sidebar content:', error);

      contentDiv.innerHTML = `
        <div class="adoc-error">
          <p>Error loading data reliability information</p>
          <p class="adoc-error-detail">${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Monitor for page changes
   */
  function monitorPageChanges() {
    let lastUrl = window.location.href;

    setInterval(() => {
      const currentUrl = window.location.href;

      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('ADOC Extension: Tableau page changed');

        const newContext = extractTableauContext();

        if (newContext && JSON.stringify(newContext) !== JSON.stringify(currentContext)) {
          currentContext = newContext;
          loadSidebarContent();
        }
      }
    }, 1000);
  }

  /**
   * Initialize extension
   */
  function initialize() {
    setTimeout(() => {
      const context = extractTableauContext();

      if (context) {
        injectSidebar();
        monitorPageChanges();
      }
    }, 2000);
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_SIDEBAR') {
      const sidebar = document.getElementById('adoc-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('adoc-sidebar-open');
      }
      sendResponse({ success: true });
    }
    return true;
  });

})();
