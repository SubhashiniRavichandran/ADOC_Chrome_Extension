/**
 * Column Badge Injector
 * Injects quality badges next to column names in PowerBI interface
 */

class ColumnBadgeInjector {
    constructor() {
        this.badges = new Map();
        this.observer = null;
        this.columnData = null;
    }

    /**
     * Initialize badge injection
     */
    initialize(columnData) {
        this.columnData = columnData;
        this.injectBadges();
        this.startObserver();
    }

    /**
     * Inject badges into PowerBI interface
     */
    injectBadges() {
        if (!this.columnData || this.columnData.length === 0) {
            return;
        }

        // Find all potential column name elements in PowerBI
        // PowerBI uses various selectors for column names
        const selectors = [
            '[class*="field"]',
            '[class*="column"]',
            '[class*="measure"]',
            '[role="treeitem"]',
            '[class*="pivotTableCellWrap"]',
            '.visual-header',
            '[class*="slicer"]'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                this.tryInjectBadge(el);
            });
        });
    }

    /**
     * Try to inject badge for an element
     */
    tryInjectBadge(element) {
        // Skip if already has badge
        if (element.querySelector('.adoc-column-badge')) {
            return;
        }

        const text = element.textContent.trim();
        if (!text) return;

        // Find matching column data
        const columnInfo = this.columnData.find(col =>
            col.columnName.toLowerCase() === text.toLowerCase() ||
            text.toLowerCase().includes(col.columnName.toLowerCase())
        );

        if (columnInfo) {
            this.createBadge(element, columnInfo);
        }
    }

    /**
     * Create and inject badge
     */
    createBadge(element, columnInfo) {
        const badge = document.createElement('span');
        badge.className = 'adoc-column-badge';

        const score = columnInfo.score || 0;
        const scoreIndicator = this.getScoreIndicator(score);

        badge.innerHTML = `
      <span class="adoc-badge-icon ${scoreIndicator.className}" title="Data Quality: ${score}%">
        ${scoreIndicator.emoji}
      </span>
    `;

        // Add tooltip
        badge.setAttribute('data-adoc-tooltip', `
      Column: ${columnInfo.columnName}
      Quality Score: ${score}%
      ${columnInfo.failingRules > 0 ? `⚠ ${columnInfo.failingRules} failing rules` : '✓ All checks passing'}
    `);

        // Add hover effect
        badge.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, columnInfo);
        });

        badge.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        // Inject badge
        if (element.firstChild) {
            element.insertBefore(badge, element.firstChild);
        } else {
            element.appendChild(badge);
        }

        this.badges.set(element, badge);
    }

    /**
     * Show tooltip on hover
     */
    showTooltip(event, columnInfo) {
        // Remove existing tooltip
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'adoc-column-tooltip';
        tooltip.innerHTML = `
      <div class="adoc-tooltip-header">
        <strong>${columnInfo.columnName}</strong>
      </div>
      <div class="adoc-tooltip-score">
        Quality Score: <span class="${this.getScoreIndicator(columnInfo.score).className}">
          ${columnInfo.score}%
        </span>
      </div>
      ${columnInfo.failingRules > 0 ? `
        <div class="adoc-tooltip-issues">
          ⚠ ${columnInfo.failingRules} failing rule${columnInfo.failingRules > 1 ? 's' : ''}
        </div>
      ` : `
        <div class="adoc-tooltip-ok">✓ All checks passing</div>
      `}
      <div class="adoc-tooltip-asset">
        Table: ${columnInfo.assetName}
      </div>
    `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.zIndex = '10000';

        this.currentTooltip = tooltip;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    /**
     * Start mutation observer to handle dynamic content
     */
    startObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver((mutations) => {
            // Debounce to avoid excessive processing
            clearTimeout(this.observerTimeout);
            this.observerTimeout = setTimeout(() => {
                this.injectBadges();
            }, 500);
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Update column data and re-inject badges
     */
    updateData(columnData) {
        this.columnData = columnData;
        this.clearBadges();
        this.injectBadges();
    }

    /**
     * Clear all badges
     */
    clearBadges() {
        this.badges.forEach((badge, element) => {
            badge.remove();
        });
        this.badges.clear();
    }

    /**
     * Stop badge injection
     */
    stop() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.clearBadges();
        this.hideTooltip();
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
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColumnBadgeInjector;
}
