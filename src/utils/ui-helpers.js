/**
 * UI Helper utilities
 * Common functions for UI components
 */

/**
 * Get reliability score indicator (emoji/color)
 * @param {number} score - Reliability score (0-100)
 * @returns {object} - { emoji, color, label }
 */
function getScoreIndicator(score) {
  if (score >= 90) {
    return {
      emoji: '🟢',
      color: '#22c55e',
      label: 'High',
      className: 'score-high'
    };
  } else if (score >= 70) {
    return {
      emoji: '🟡',
      color: '#eab308',
      label: 'Medium',
      className: 'score-medium'
    };
  } else {
    return {
      emoji: '🔴',
      color: '#ef4444',
      label: 'Low',
      className: 'score-low'
    };
  }
}

/**
 * Get alert severity indicator
 * @param {string} severity - Alert severity (CRITICAL, HIGH, MEDIUM, LOW)
 * @returns {object} - { emoji, color, label }
 */
function getSeverityIndicator(severity) {
  const severityMap = {
    CRITICAL: {
      emoji: '🔴',
      color: '#dc2626',
      label: 'Critical',
      className: 'severity-critical'
    },
    HIGH: {
      emoji: '🟠',
      color: '#f97316',
      label: 'High',
      className: 'severity-high'
    },
    MEDIUM: {
      emoji: '🟡',
      color: '#eab308',
      label: 'Medium',
      className: 'severity-medium'
    },
    LOW: {
      emoji: '🔵',
      color: '#3b82f6',
      label: 'Low',
      className: 'severity-low'
    }
  };

  return severityMap[severity] || severityMap.MEDIUM;
}

/**
 * Format timestamp to readable string
 * @param {string|number} timestamp - ISO timestamp or milliseconds
 * @returns {string} - Formatted time string
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffMins / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Create a DOM element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {object} options - { className, attributes, textContent, innerHTML }
 * @returns {HTMLElement} - Created element
 */
function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.innerHTML) {
    element.innerHTML = options.innerHTML;
  }

  if (options.onClick) {
    element.addEventListener('click', options.onClick);
  }

  return element;
}

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} - Throttled function
 */
function throttle(func, limit = 1000) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} severity - Alert severity (optional)
 */
function showNotification(title, message, severity = 'MEDIUM') {
  const indicator = getSeverityIndicator(severity);

  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('src/icons/icon128.png'),
    title: `${indicator.emoji} ${title}`,
    message: message,
    priority: severity === 'CRITICAL' || severity === 'HIGH' ? 2 : 1
  });
}

/**
 * Calculate overall reliability score from multiple assets
 * @param {object[]} assets - Array of assets with reliability scores
 * @returns {number} - Average reliability score
 */
function calculateOverallScore(assets) {
  if (!assets || assets.length === 0) {
    return 0;
  }

  const total = assets.reduce((sum, asset) => {
    return sum + (asset.reliabilityScore || 0);
  }, 0);

  return Math.round(total / assets.length);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getScoreIndicator,
    getSeverityIndicator,
    formatTimestamp,
    truncateText,
    createElement,
    debounce,
    throttle,
    showNotification,
    calculateOverallScore
  };
}
