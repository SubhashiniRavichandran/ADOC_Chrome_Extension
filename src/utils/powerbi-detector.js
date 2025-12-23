/**
 * PowerBI Context Detector
 * Enhanced PowerBI page analysis and context extraction
 */

class PowerBIDetector {
  /**
   * Extract comprehensive PowerBI context
   */
  static extractContext() {
    const urlContext = this.extractFromURL();
    const domContext = this.extractFromDOM();
    const visualContext = this.extractVisualContext();

    return {
      ...urlContext,
      ...domContext,
      ...visualContext,
      biTool: 'powerbi',
      timestamp: Date.now()
    };
  }

  /**
   * Extract context from URL
   */
  static extractFromURL() {
    const url = window.location.href;

    // Report URL pattern: https://app.powerbi.com/groups/{workspaceId}/reports/{reportId}
    const reportPattern = /\/groups\/([^\/]+)\/reports\/([^\/]+)/;
    const reportMatch = url.match(reportPattern);

    if (reportMatch) {
      return {
        type: 'report',
        workspaceId: reportMatch[1],
        reportId: reportMatch[2],
        url: url
      };
    }

    // Dashboard URL pattern
    const dashboardPattern = /\/groups\/([^\/]+)\/dashboards\/([^\/]+)/;
    const dashboardMatch = url.match(dashboardPattern);

    if (dashboardMatch) {
      return {
        type: 'dashboard',
        workspaceId: dashboardMatch[1],
        dashboardId: dashboardMatch[2],
        url: url
      };
    }

    // Dataset URL pattern
    const datasetPattern = /\/groups\/([^\/]+)\/datasets\/([^\/]+)/;
    const datasetMatch = url.match(datasetPattern);

    if (datasetMatch) {
      return {
        type: 'dataset',
        workspaceId: datasetMatch[1],
        datasetId: datasetMatch[2],
        url: url
      };
    }

    return { url };
  }

  /**
   * Extract context from DOM
   */
  static extractFromDOM() {
    const context = {};

    try {
      // Try to find report/dashboard name
      const titleElement = document.querySelector('[data-report-name], [aria-label*="report"], .reportTitle');
      if (titleElement) {
        context.reportName = titleElement.textContent?.trim() || titleElement.getAttribute('aria-label');
      }

      // Try to find page name (for multi-page reports)
      const pageElement = document.querySelector('[data-page-name], .tab.active, [role="tab"][aria-selected="true"]');
      if (pageElement) {
        context.pageName = pageElement.textContent?.trim() || pageElement.getAttribute('data-page-name');
      }

      // Extract dataset information
      const datasetElements = document.querySelectorAll('[data-dataset-id]');
      if (datasetElements.length > 0) {
        context.datasets = Array.from(datasetElements).map(el => ({
          id: el.getAttribute('data-dataset-id'),
          name: el.getAttribute('data-dataset-name') || 'Unknown'
        }));
      }

      // Look for table references in the visual layer
      context.tables = this.extractTableReferences();

    } catch (error) {
      console.error('Error extracting DOM context:', error);
    }

    return context;
  }

  /**
   * Extract visual context (active visuals, filters, etc.)
   */
  static extractVisualContext() {
    const context = {};

    try {
      // Find active filters
      const filterElements = document.querySelectorAll('[data-filter-value], .filterCard');
      if (filterElements.length > 0) {
        context.activeFilters = Array.from(filterElements).map(el => ({
          name: el.getAttribute('data-filter-name') || el.textContent?.trim(),
          value: el.getAttribute('data-filter-value')
        }));
      }

      // Count visuals on page
      const visualElements = document.querySelectorAll('[data-visual-id], .visual');
      if (visualElements.length > 0) {
        context.visualCount = visualElements.length;
      }

      // Detect if in edit mode
      context.editMode = this.isEditMode();

    } catch (error) {
      console.error('Error extracting visual context:', error);
    }

    return context;
  }

  /**
   * Extract table references from PowerBI
   */
  static extractTableReferences() {
    const tables = new Set();

    try {
      // Method 1: Look for data model references
      const modelElements = document.querySelectorAll('[data-table-name]');
      modelElements.forEach(el => {
        const tableName = el.getAttribute('data-table-name');
        if (tableName) tables.add(tableName);
      });

      // Method 2: Parse visual containers for table hints
      const visualContainers = document.querySelectorAll('.visual, [data-visual-id]');
      visualContainers.forEach(container => {
        const dataAttrs = container.getAttributeNames();
        dataAttrs.forEach(attr => {
          if (attr.includes('table') || attr.includes('source')) {
            const value = container.getAttribute(attr);
            if (value && !value.startsWith('visual-')) {
              tables.add(value);
            }
          }
        });
      });

      // Method 3: Look in iframe content (if accessible)
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const iframeTables = iframeDoc.querySelectorAll('[data-table-name]');
            iframeTables.forEach(el => {
              const tableName = el.getAttribute('data-table-name');
              if (tableName) tables.add(tableName);
            });
          }
        } catch (e) {
          // Cross-origin iframe, skip
        }
      });

    } catch (error) {
      console.error('Error extracting table references:', error);
    }

    return Array.from(tables);
  }

  /**
   * Check if PowerBI is in edit mode
   */
  static isEditMode() {
    // Look for edit mode indicators
    const editIndicators = [
      '.editMode',
      '[data-edit-mode="true"]',
      '#editButton[aria-pressed="true"]',
      '.visualizationPane'
    ];

    return editIndicators.some(selector => document.querySelector(selector) !== null);
  }

  /**
   * Monitor for page changes
   */
  static setupChangeMonitoring(callback) {
    let lastUrl = window.location.href;
    let lastContext = null;

    // URL change detection
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        const newContext = this.extractContext();
        if (JSON.stringify(newContext) !== JSON.stringify(lastContext)) {
          lastContext = newContext;
          callback(newContext);
        }
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Page/tab change detection (for multi-page reports)
    const tabObserver = new MutationObserver(() => {
      const newContext = this.extractContext();
      if (newContext.pageName && newContext.pageName !== lastContext?.pageName) {
        lastContext = newContext;
        callback(newContext);
      }
    });

    const tabContainer = document.querySelector('.tabs, [role="tablist"]');
    if (tabContainer) {
      tabObserver.observe(tabContainer, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }

    return () => {
      urlObserver.disconnect();
      tabObserver.disconnect();
    };
  }

  /**
   * Find column elements in PowerBI visuals
   */
  static findColumnElements() {
    const columnElements = [];

    try {
      // Look for field wells, legends, axes that show column names
      const selectors = [
        '[data-field-name]',
        '[data-column-name]',
        '.legendItem',
        '.axisLabel',
        '.fieldWell',
        '[role="columnheader"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const columnName = el.getAttribute('data-field-name') ||
                           el.getAttribute('data-column-name') ||
                           el.textContent?.trim();

          if (columnName) {
            columnElements.push({
              element: el,
              columnName: columnName,
              tableName: el.getAttribute('data-table-name')
            });
          }
        });
      });

    } catch (error) {
      console.error('Error finding column elements:', error);
    }

    return columnElements;
  }

  /**
   * Inject column badges next to field names
   */
  static injectColumnBadges(columnScores) {
    const columnElements = this.findColumnElements();

    columnElements.forEach(({ element, columnName, tableName }) => {
      // Find matching score
      const score = columnScores.find(s =>
        s.columnName === columnName && (!tableName || s.tableName === tableName)
      );

      if (score && !element.querySelector('.adoc-column-badge')) {
        const badge = this.createColumnBadge(score.score);
        element.style.position = 'relative';
        element.appendChild(badge);
      }
    });
  }

  /**
   * Create column badge element
   */
  static createColumnBadge(score) {
    const badge = document.createElement('span');
    badge.className = 'adoc-column-badge';

    let emoji, color;
    if (score >= 90) {
      emoji = '🟢';
      color = '#22c55e';
    } else if (score >= 70) {
      emoji = '🟡';
      color = '#eab308';
    } else {
      emoji = '🔴';
      color = '#ef4444';
    }

    badge.innerHTML = `<span style="color: ${color}; font-size: 12px; margin-left: 4px;" title="Data Quality: ${score}%">${emoji}</span>`;

    return badge;
  }

  /**
   * Wait for PowerBI to fully load
   */
  static waitForLoad(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkLoaded = () => {
        // Check for PowerBI loaded indicators
        const isLoaded = document.querySelector('.visual, [data-visual-id], .reportCanvas') !== null;

        if (isLoaded) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('PowerBI load timeout'));
        } else {
          setTimeout(checkLoaded, 500);
        }
      };

      checkLoaded();
    });
  }
}

// Export for use in content scripts
if (typeof window !== 'undefined') {
  window.PowerBIDetector = PowerBIDetector;
}
