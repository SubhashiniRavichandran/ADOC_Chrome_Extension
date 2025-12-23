/**
 * Sidebar Components
 * Reusable UI components for the sidebar
 */

class SidebarComponents {
  /**
   * Create lineage visualization component
   */
  static createLineageView(lineageData) {
    const { upstream = [], downstream = [] } = lineageData.lineage || {};

    const html = `
      <div class="adoc-lineage-container">
        <div class="adoc-lineage-section">
          <h4 class="adoc-lineage-title">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 2a3 3 0 11-6 0 3 3 0 016 0zM8 12a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
            Upstream Sources (${upstream.length})
          </h4>
          <div class="adoc-lineage-list">
            ${upstream.length > 0 ? upstream.map(asset => this.createLineageAsset(asset, 'upstream')).join('') : '<p class="adoc-empty-message">No upstream sources</p>'}
          </div>
        </div>

        <div class="adoc-lineage-divider">
          <div class="adoc-lineage-arrow">↓</div>
          <div class="adoc-lineage-current">Current Asset</div>
          <div class="adoc-lineage-arrow">↓</div>
        </div>

        <div class="adoc-lineage-section">
          <h4 class="adoc-lineage-title">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a3 3 0 100 6 3 3 0 000-6zM5 14a3 3 0 116 0 3 3 0 01-6 0z"/>
            </svg>
            Downstream Reports (${downstream.length})
          </h4>
          <div class="adoc-lineage-list">
            ${downstream.length > 0 ? downstream.map(asset => this.createLineageAsset(asset, 'downstream')).join('') : '<p class="adoc-empty-message">No downstream reports</p>'}
          </div>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Create lineage asset item
   */
  static createLineageAsset(asset, direction) {
    const scoreIndicator = this.getScoreIndicator(asset.reliabilityScore || 0);
    const hasIssues = asset.hasAlerts;

    return `
      <div class="adoc-lineage-asset ${hasIssues ? 'has-issues' : ''}">
        <div class="adoc-lineage-asset-header">
          <span class="adoc-lineage-asset-name">${asset.assetName}</span>
          <span class="adoc-lineage-asset-score ${scoreIndicator.className}">
            ${scoreIndicator.emoji} ${asset.reliabilityScore}%
          </span>
        </div>
        <div class="adoc-lineage-asset-type">${asset.assetType}</div>
        ${hasIssues ? '<div class="adoc-lineage-asset-alert">⚠ Has active alerts</div>' : ''}
      </div>
    `;
  }

  /**
   * Create detailed alert list
   */
  static createAlertsList(alerts, onAcknowledge, onViewDetails) {
    if (!alerts || alerts.length === 0) {
      return '<p class="adoc-empty-message">No active alerts</p>';
    }

    // Group alerts by severity
    const grouped = this.groupAlertsBySeverity(alerts);

    let html = '<div class="adoc-alerts-grouped">';

    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
      const severityAlerts = grouped[severity] || [];
      if (severityAlerts.length === 0) return;

      const indicator = this.getSeverityIndicator(severity);

      html += `
        <div class="adoc-alert-group">
          <div class="adoc-alert-group-header ${indicator.className}">
            <span class="adoc-alert-severity-badge">
              ${indicator.emoji} ${indicator.label}
            </span>
            <span class="adoc-alert-count">${severityAlerts.length}</span>
          </div>
          <div class="adoc-alert-group-items">
            ${severityAlerts.map(alert => this.createAlertItem(alert, onAcknowledge, onViewDetails)).join('')}
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /**
   * Create individual alert item
   */
  static createAlertItem(alert, onAcknowledge, onViewDetails) {
    const indicator = this.getSeverityIndicator(alert.severity);
    const timeAgo = this.formatTimestamp(alert.createdAt);

    return `
      <div class="adoc-alert-item" data-alert-id="${alert.id}">
        <div class="adoc-alert-item-header">
          <span class="adoc-alert-title">${alert.title}</span>
          <span class="adoc-alert-time">${timeAgo}</span>
        </div>
        <div class="adoc-alert-description">${alert.description}</div>

        ${alert.affectedAssets && alert.affectedAssets.length > 0 ? `
          <div class="adoc-alert-assets">
            <strong>Affected:</strong>
            ${alert.affectedAssets.map(a => `${a.assetName}${a.columns.length > 0 ? ` (${a.columns.join(', ')})` : ''}`).join('; ')}
          </div>
        ` : ''}

        ${alert.failingRules && alert.failingRules.length > 0 ? `
          <div class="adoc-alert-rules">
            ${alert.failingRules.map(rule => `
              <div class="adoc-alert-rule">
                <span class="adoc-rule-name">${rule.ruleName}</span>
                <span class="adoc-rule-value">
                  Expected: ≤${rule.threshold}% | Actual: ${rule.actualValue}%
                </span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="adoc-alert-actions">
          <button class="adoc-btn-small adoc-btn-secondary" onclick="window.adocViewAlert('${alert.id}')">
            View Details
          </button>
          <button class="adoc-btn-small adoc-btn-secondary" onclick="window.adocAcknowledgeAlert('${alert.id}')">
            Acknowledge
          </button>
          ${alert.link ? `
            <a href="${alert.link}" target="_blank" class="adoc-btn-small adoc-btn-link">
              Open in ADOC
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create column-level badges view
   */
  static createColumnBadges(columnScores) {
    if (!columnScores || columnScores.length === 0) {
      return '<p class="adoc-empty-message">No column data available</p>';
    }

    return `
      <div class="adoc-columns-list">
        ${columnScores.map(col => {
          const indicator = this.getScoreIndicator(col.score);
          return `
            <div class="adoc-column-item">
              <div class="adoc-column-header">
                <span class="adoc-column-name">${col.columnName}</span>
                <span class="adoc-column-score ${indicator.className}">
                  ${indicator.emoji} ${col.score}%
                </span>
              </div>
              ${col.failingRules > 0 ? `
                <div class="adoc-column-issues">
                  ${col.failingRules} rule${col.failingRules > 1 ? 's' : ''} failing
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Create filter controls
   */
  static createFilterControls(options = {}) {
    const { showSeverityFilter = true, showSearchBar = true, showRefreshButton = true } = options;

    return `
      <div class="adoc-filter-controls">
        ${showSearchBar ? `
          <div class="adoc-search-bar">
            <input
              type="text"
              id="adoc-search-input"
              placeholder="Search assets..."
              class="adoc-input"
            />
          </div>
        ` : ''}

        ${showSeverityFilter ? `
          <div class="adoc-severity-filter">
            <label class="adoc-filter-label">Filter by severity:</label>
            <div class="adoc-filter-buttons">
              <button class="adoc-filter-btn active" data-severity="all">All</button>
              <button class="adoc-filter-btn" data-severity="CRITICAL">Critical</button>
              <button class="adoc-filter-btn" data-severity="HIGH">High</button>
              <button class="adoc-filter-btn" data-severity="MEDIUM">Medium</button>
              <button class="adoc-filter-btn" data-severity="LOW">Low</button>
            </div>
          </div>
        ` : ''}

        ${showRefreshButton ? `
          <button id="adoc-refresh-data" class="adoc-btn adoc-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Refresh
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create tabbed navigation
   */
  static createTabbedView(tabs, activeTab = 0) {
    return `
      <div class="adoc-tabs">
        <div class="adoc-tabs-header">
          ${tabs.map((tab, index) => `
            <button
              class="adoc-tab-btn ${index === activeTab ? 'active' : ''}"
              data-tab-index="${index}"
            >
              ${tab.icon ? `<span class="adoc-tab-icon">${tab.icon}</span>` : ''}
              ${tab.label}
              ${tab.badge ? `<span class="adoc-tab-badge">${tab.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>
        <div class="adoc-tabs-content">
          ${tabs.map((tab, index) => `
            <div
              class="adoc-tab-panel ${index === activeTab ? 'active' : ''}"
              data-tab-index="${index}"
            >
              ${tab.content}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Helper: Group alerts by severity
   */
  static groupAlertsBySeverity(alerts) {
    return alerts.reduce((grouped, alert) => {
      const severity = alert.severity || 'MEDIUM';
      if (!grouped[severity]) {
        grouped[severity] = [];
      }
      grouped[severity].push(alert);
      return grouped;
    }, {});
  }

  /**
   * Helper: Get score indicator
   */
  static getScoreIndicator(score) {
    if (score >= 90) {
      return { emoji: '🟢', color: '#22c55e', label: 'High', className: 'score-high' };
    } else if (score >= 70) {
      return { emoji: '🟡', color: '#eab308', label: 'Medium', className: 'score-medium' };
    } else {
      return { emoji: '🔴', color: '#ef4444', label: 'Low', className: 'score-low' };
    }
  }

  /**
   * Helper: Get severity indicator
   */
  static getSeverityIndicator(severity) {
    const severityMap = {
      CRITICAL: { emoji: '🔴', color: '#dc2626', label: 'Critical', className: 'severity-critical' },
      HIGH: { emoji: '🟠', color: '#f97316', label: 'High', className: 'severity-high' },
      MEDIUM: { emoji: '🟡', color: '#eab308', label: 'Medium', className: 'severity-medium' },
      LOW: { emoji: '🔵', color: '#3b82f6', label: 'Low', className: 'severity-low' }
    };
    return severityMap[severity] || severityMap.MEDIUM;
  }

  /**
   * Helper: Format timestamp
   */
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffMins / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  /**
   * Set up tab navigation
   */
  static setupTabNavigation(container) {
    const tabButtons = container.querySelectorAll('.adoc-tab-btn');
    const tabPanels = container.querySelectorAll('.adoc-tab-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabIndex = button.getAttribute('data-tab-index');

        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        const targetPanel = container.querySelector(`.adoc-tab-panel[data-tab-index="${tabIndex}"]`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  /**
   * Set up filter controls
   */
  static setupFilterControls(container, onFilter) {
    const searchInput = container.querySelector('#adoc-search-input');
    const filterButtons = container.querySelectorAll('.adoc-filter-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        onFilter({ search: e.target.value });
      });
    }

    if (filterButtons) {
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          const severity = button.getAttribute('data-severity');
          onFilter({ severity });
        });
      });
    }
  }
}

// Export for use in content scripts
if (typeof window !== 'undefined') {
  window.SidebarComponents = SidebarComponents;
}
