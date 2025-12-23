/**
 * Enhanced Sidebar with Tabbed Interface
 * Provides Overview, Alerts, Lineage, and Columns tabs
 */

class EnhancedSidebar {
    constructor() {
        this.currentTab = 'overview';
        this.reportData = null;
        this.sidebarElement = null;
    }

    /**
     * Create and inject the enhanced sidebar
     */
    create() {
        const sidebar = document.createElement('div');
        sidebar.id = 'adoc-sidebar';
        sidebar.className = 'adoc-sidebar adoc-sidebar-enhanced';

        sidebar.innerHTML = `
      <div class="adoc-sidebar-header">
        <div class="adoc-logo">ADOC Data Reliability</div>
        <button id="adoc-close-btn" class="adoc-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
          </svg>
        </button>
      </div>

      <div class="adoc-tabs">
        <button class="adoc-tab active" data-tab="overview">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75z"/>
          </svg>
          Overview
        </button>
        <button class="adoc-tab" data-tab="alerts">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.5a.5.5 0 0 1 1 0V11h3.781C14.292 11 16 9.366 16 7.318c0-1.763-1.266-3.223-2.942-3.593-.143-.863-.698-1.723-1.464-2.383A5.53 5.53 0 0 0 8 1z"/>
          </svg>
          Alerts
        </button>
        <button class="adoc-tab" data-tab="lineage">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
          </svg>
          Lineage
        </button>
        <button class="adoc-tab" data-tab="columns">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25H4.5v-13H1.75zm3.5 13H14.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H5.25v13z"/>
          </svg>
          Columns
        </button>
      </div>

      <div id="adoc-sidebar-content" class="adoc-sidebar-content">
        <div class="adoc-loading">
          <div class="adoc-spinner"></div>
          <p>Loading data reliability information...</p>
        </div>
      </div>
    `;

        document.body.appendChild(sidebar);
        this.sidebarElement = sidebar;

        // Set up event listeners
        this.setupEventListeners();

        // Open sidebar by default
        setTimeout(() => {
            sidebar.classList.add('adoc-sidebar-open');
        }, 500);

        return sidebar;
    }

    /**
     * Set up event listeners for tabs and buttons
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('adoc-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.sidebarElement.classList.remove('adoc-sidebar-open');
            });
        }

        // Tab switching
        const tabs = document.querySelectorAll('.adoc-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    /**
     * Switch to a different tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update active tab
        document.querySelectorAll('.adoc-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Render content for the selected tab
        this.renderTabContent(tabName);
    }

    /**
     * Render content for the current tab
     */
    renderTabContent(tabName) {
        const contentDiv = document.getElementById('adoc-sidebar-content');
        if (!contentDiv || !this.reportData) return;

        switch (tabName) {
            case 'overview':
                contentDiv.innerHTML = this.renderOverviewTab();
                break;
            case 'alerts':
                contentDiv.innerHTML = this.renderAlertsTab();
                break;
            case 'lineage':
                contentDiv.innerHTML = this.renderLineageTab();
                break;
            case 'columns':
                contentDiv.innerHTML = this.renderColumnsTab();
                break;
        }

        // Re-attach event listeners for dynamic content
        this.attachDynamicListeners();
    }

    /**
     * Render Overview Tab
     */
    renderOverviewTab() {
        const { underlyingAssets = [], reportName = 'Report', lastRefreshed } = this.reportData;

        const overallScore = underlyingAssets.length > 0
            ? Math.round(underlyingAssets.reduce((sum, a) => sum + (a.reliabilityScore || 0), 0) / underlyingAssets.length)
            : 0;

        const scoreIndicator = this.getScoreIndicator(overallScore);
        const totalAlerts = underlyingAssets.reduce((sum, a) => sum + (a.openAlerts || 0), 0);

        return `
      <div class="adoc-section">
        <h3>Report Overview</h3>
        <div class="adoc-report-name">${reportName}</div>
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
            Data quality issues detected in underlying assets
          </div>
          <button class="adoc-btn adoc-btn-secondary" onclick="document.querySelector('[data-tab=\\"alerts\\"]').click()">
            View All Alerts
          </button>
        </div>
      ` : ''}

      <div class="adoc-section">
        <h3>📊 Asset Scores (${underlyingAssets.length})</h3>
        <div class="adoc-search-box">
          <input type="text" id="asset-search" placeholder="Search assets..." />
        </div>
        <div class="adoc-assets-list">
          ${underlyingAssets.map(asset => {
            const assetScore = this.getScoreIndicator(asset.reliabilityScore || 0);
            return `
              <div class="adoc-asset-item" data-asset-name="${asset.tableName}">
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

      <div class="adoc-section adoc-actions">
        <button id="adoc-open-in-adoc" class="adoc-btn adoc-btn-primary">
          View in ADOC Dashboard
        </button>
        <button id="adoc-refresh-btn" class="adoc-btn adoc-btn-secondary">
          Refresh Data
        </button>
      </div>

      ${lastRefreshed ? `
        <div class="adoc-footer">
          Last updated: ${this.formatTimestamp(lastRefreshed)}
        </div>
      ` : ''}
    `;
    }

    /**
     * Render Alerts Tab
     */
    renderAlertsTab() {
        const { underlyingAssets = [] } = this.reportData;
        const allAlerts = [];

        // Collect all alerts from assets
        underlyingAssets.forEach(asset => {
            if (asset.alerts && asset.alerts.length > 0) {
                asset.alerts.forEach(alert => {
                    allAlerts.push({ ...alert, assetName: asset.tableName });
                });
            }
        });

        if (allAlerts.length === 0) {
            return `
        <div class="adoc-empty-state">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          <h3>No Active Alerts</h3>
          <p>All data quality checks are passing</p>
        </div>
      `;
        }

        // Group alerts by severity
        const groupedAlerts = {
            CRITICAL: allAlerts.filter(a => a.severity === 'CRITICAL'),
            HIGH: allAlerts.filter(a => a.severity === 'HIGH'),
            MEDIUM: allAlerts.filter(a => a.severity === 'MEDIUM'),
            LOW: allAlerts.filter(a => a.severity === 'LOW')
        };

        return `
      <div class="adoc-section">
        <h3>Active Alerts (${allAlerts.length})</h3>
        <div class="adoc-alert-filters">
          <button class="adoc-filter-btn active" data-severity="all">All</button>
          ${groupedAlerts.CRITICAL.length > 0 ? `<button class="adoc-filter-btn" data-severity="CRITICAL">🔴 Critical (${groupedAlerts.CRITICAL.length})</button>` : ''}
          ${groupedAlerts.HIGH.length > 0 ? `<button class="adoc-filter-btn" data-severity="HIGH">🟠 High (${groupedAlerts.HIGH.length})</button>` : ''}
          ${groupedAlerts.MEDIUM.length > 0 ? `<button class="adoc-filter-btn" data-severity="MEDIUM">🟡 Medium (${groupedAlerts.MEDIUM.length})</button>` : ''}
          ${groupedAlerts.LOW.length > 0 ? `<button class="adoc-filter-btn" data-severity="LOW">🔵 Low (${groupedAlerts.LOW.length})</button>` : ''}
        </div>
      </div>

      <div class="adoc-alerts-list">
        ${allAlerts.map(alert => {
            const severityEmoji = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵' }[alert.severity] || '⚠️';
            return `
            <div class="adoc-alert-card" data-severity="${alert.severity}">
              <div class="adoc-alert-header">
                <span class="adoc-alert-severity">${severityEmoji} ${alert.severity}</span>
                <span class="adoc-alert-time">${this.formatTimestamp(alert.createdAt || Date.now())}</span>
              </div>
              <div class="adoc-alert-title">${alert.title || 'Data Quality Alert'}</div>
              <div class="adoc-alert-description">${alert.description || 'Quality threshold breached'}</div>
              <div class="adoc-alert-asset">Asset: ${alert.assetName}</div>
              <div class="adoc-alert-actions">
                <button class="adoc-btn adoc-btn-small" onclick="window.open('${alert.link || '#'}', '_blank')">
                  View Details
                </button>
                <button class="adoc-btn adoc-btn-small adoc-btn-secondary" data-alert-id="${alert.id}">
                  Acknowledge
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    }

    /**
     * Render Lineage Tab
     */
    renderLineageTab() {
        const { underlyingAssets = [] } = this.reportData;

        return `
      <div class="adoc-section">
        <h3>Data Lineage</h3>
        <p class="adoc-info-text">Showing data flow for assets in this report</p>
      </div>

      <div class="adoc-lineage-container">
        <div class="adoc-lineage-section">
          <h4>⬆️ Upstream Sources</h4>
          <div class="adoc-lineage-list">
            ${underlyingAssets.map(asset => `
              <div class="adoc-lineage-item">
                <div class="adoc-lineage-icon">📊</div>
                <div class="adoc-lineage-info">
                  <div class="adoc-lineage-name">${asset.tableName}</div>
                  <div class="adoc-lineage-type">Source Table</div>
                </div>
                <div class="adoc-lineage-score ${this.getScoreIndicator(asset.reliabilityScore || 0).className}">
                  ${asset.reliabilityScore}%
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="adoc-lineage-current">
          <div class="adoc-lineage-item adoc-lineage-current-item">
            <div class="adoc-lineage-icon">📈</div>
            <div class="adoc-lineage-info">
              <div class="adoc-lineage-name">${this.reportData.reportName || 'Current Report'}</div>
              <div class="adoc-lineage-type">PowerBI Report</div>
            </div>
          </div>
        </div>

        <div class="adoc-lineage-section">
          <h4>⬇️ Downstream Impact</h4>
          <div class="adoc-lineage-list">
            <div class="adoc-empty-state-small">
              <p>No downstream dependencies tracked</p>
            </div>
          </div>
        </div>
      </div>

      <div class="adoc-section">
        <button class="adoc-btn adoc-btn-secondary" id="adoc-view-full-lineage">
          View Full Lineage in ADOC
        </button>
      </div>
    `;
    }

    /**
     * Render Columns Tab
     */
    renderColumnsTab() {
        const { underlyingAssets = [] } = this.reportData;
        const allColumns = [];

        // Collect all columns from assets
        underlyingAssets.forEach(asset => {
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

        if (allColumns.length === 0) {
            return `
        <div class="adoc-empty-state">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75z"/>
          </svg>
          <h3>No Column Data</h3>
          <p>Column-level quality metrics not available</p>
        </div>
      `;
        }

        return `
      <div class="adoc-section">
        <h3>Column Quality (${allColumns.length})</h3>
        <div class="adoc-search-box">
          <input type="text" id="column-search" placeholder="Search columns..." />
        </div>
      </div>

      <div class="adoc-columns-list">
        ${allColumns.map(col => {
            const scoreIndicator = this.getScoreIndicator(col.score || 0);
            return `
            <div class="adoc-column-item" data-column-name="${col.columnName}">
              <div class="adoc-column-header">
                <div class="adoc-column-name">
                  <span class="adoc-column-icon">📋</span>
                  ${col.columnName}
                </div>
                <div class="adoc-column-score ${scoreIndicator.className}">
                  ${scoreIndicator.emoji} ${col.score}%
                </div>
              </div>
              <div class="adoc-column-asset">Table: ${col.assetName}</div>
              ${col.failingRules > 0 ? `
                <div class="adoc-column-issues">
                  ⚠ ${col.failingRules} failing rule${col.failingRules > 1 ? 's' : ''}
                </div>
              ` : `
                <div class="adoc-column-ok">✓ All checks passing</div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;
    }

    /**
     * Attach event listeners to dynamically created elements
     */
    attachDynamicListeners() {
        // Search functionality
        const assetSearch = document.getElementById('asset-search');
        if (assetSearch) {
            assetSearch.addEventListener('input', (e) => {
                this.filterAssets(e.target.value);
            });
        }

        const columnSearch = document.getElementById('column-search');
        if (columnSearch) {
            columnSearch.addEventListener('input', (e) => {
                this.filterColumns(e.target.value);
            });
        }

        // Alert filters
        const filterBtns = document.querySelectorAll('.adoc-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterAlerts(btn.getAttribute('data-severity'));
            });
        });

        // Action buttons
        const openInAdocBtn = document.getElementById('adoc-open-in-adoc');
        if (openInAdocBtn) {
            openInAdocBtn.addEventListener('click', () => this.openInADOC());
        }

        const refreshBtn = document.getElementById('adoc-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        const viewFullLineageBtn = document.getElementById('adoc-view-full-lineage');
        if (viewFullLineageBtn) {
            viewFullLineageBtn.addEventListener('click', () => this.openLineageInADOC());
        }
    }

    /**
     * Filter assets by search term
     */
    filterAssets(searchTerm) {
        const items = document.querySelectorAll('.adoc-asset-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const assetName = item.getAttribute('data-asset-name').toLowerCase();
            item.style.display = assetName.includes(term) ? 'block' : 'none';
        });
    }

    /**
     * Filter columns by search term
     */
    filterColumns(searchTerm) {
        const items = document.querySelectorAll('.adoc-column-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const columnName = item.getAttribute('data-column-name').toLowerCase();
            item.style.display = columnName.includes(term) ? 'block' : 'none';
        });
    }

    /**
     * Filter alerts by severity
     */
    filterAlerts(severity) {
        const alerts = document.querySelectorAll('.adoc-alert-card');

        alerts.forEach(alert => {
            if (severity === 'all') {
                alert.style.display = 'block';
            } else {
                alert.style.display = alert.getAttribute('data-severity') === severity ? 'block' : 'none';
            }
        });
    }

    /**
     * Open current report in ADOC
     */
    async openInADOC() {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
            if (response.success && response.data.baseUrl) {
                const url = `${response.data.baseUrl}/reports/${this.reportData.reportId || ''}`;
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Error opening ADOC:', error);
        }
    }

    /**
     * Open lineage view in ADOC
     */
    async openLineageInADOC() {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
            if (response.success && response.data.baseUrl) {
                const url = `${response.data.baseUrl}/lineage`;
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Error opening lineage:', error);
        }
    }

    /**
     * Refresh data
     */
    async refreshData() {
        try {
            await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
            // Trigger reload from parent
            if (window.loadSidebarContent) {
                window.loadSidebarContent();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    /**
     * Update sidebar with new data
     */
    updateData(reportData) {
        this.reportData = reportData;
        this.renderTabContent(this.currentTab);
    }

    /**
     * Get score indicator
     */
    getScoreIndicator(score) {
        if (score >= 90) {
            return { emoji: '🟢', color: '#22c55e', label: 'High', className: 'score-high' };
        } else if (score >= 70) {
            return { emoji: '🟡', color: '#eab308', label: 'Medium', className: 'score-medium' };
        } else {
            return { emoji: '🔴', color: '#ef4444', label: 'Low', className: 'score-low' };
        }
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
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
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSidebar;
}
