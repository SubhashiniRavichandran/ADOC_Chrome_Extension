/**
 * Notification Manager
 * Handles browser notifications for alerts
 */

class NotificationManager {
  constructor() {
    this.notifiedAlerts = new Set();
    this.settings = null;
    this.checkInterval = null;
  }

  /**
   * Initialize notification manager
   */
  async initialize() {
    // Load settings
    await this.loadSettings();

    // Set up periodic alert checking
    if (this.settings?.notifications?.enabled) {
      this.startPeriodicCheck();
    }

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.userSettings) {
        this.loadSettings();
      }
    });
  }

  /**
   * Load notification settings
   */
  async loadSettings() {
    try {
      const response = await chrome.storage.local.get('userSettings');
      this.settings = response.userSettings || {
        notifications: {
          enabled: true,
          severityThreshold: 'MEDIUM',
          frequency: 'REAL_TIME',
          sound: true
        }
      };
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  /**
   * Start periodic alert checking
   */
  startPeriodicCheck() {
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Determine interval based on frequency setting
    const intervals = {
      REAL_TIME: 2 * 60 * 1000,  // 2 minutes
      HOURLY: 60 * 60 * 1000,     // 1 hour
      DAILY: 24 * 60 * 60 * 1000  // 24 hours
    };

    const interval = intervals[this.settings?.notifications?.frequency] || intervals.REAL_TIME;

    this.checkInterval = setInterval(() => {
      this.checkForNewAlerts();
    }, interval);

    // Check immediately
    this.checkForNewAlerts();
  }

  /**
   * Check for new alerts
   */
  async checkForNewAlerts() {
    if (!this.settings?.notifications?.enabled) {
      return;
    }

    try {
      // Get current context
      const contextResponse = await chrome.storage.session.get('currentContext');
      const context = contextResponse.currentContext;

      if (!context) {
        return;
      }

      // Get asset IDs from context
      const assetIds = await this.getAssetIdsFromContext(context);

      if (!assetIds || assetIds.length === 0) {
        return;
      }

      // Fetch alerts
      const alertsResponse = await this.fetchAlerts(assetIds);

      if (alertsResponse && alertsResponse.alerts) {
        this.processAlerts(alertsResponse.alerts);
      }
    } catch (error) {
      console.error('Error checking for alerts:', error);
    }
  }

  /**
   * Get asset IDs from current context
   */
  async getAssetIdsFromContext(context) {
    // For PowerBI, get asset IDs from report data
    if (context.biTool === 'powerbi') {
      // This would normally fetch from cache or API
      // For now, return empty array
      return [];
    }

    return [];
  }

  /**
   * Fetch alerts from ADOC
   */
  async fetchAlerts(assetIds) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_ALERTS',
        payload: {
          assetIds,
          severity: this.settings?.notifications?.severityThreshold,
          status: 'OPEN'
        }
      });

      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return null;
    }
  }

  /**
   * Process alerts and show notifications
   */
  processAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
      return;
    }

    // Filter alerts based on severity threshold
    const filteredAlerts = this.filterAlertsBySeverity(alerts);

    // Show notifications for new alerts
    filteredAlerts.forEach(alert => {
      if (!this.notifiedAlerts.has(alert.id)) {
        this.showNotification(alert);
        this.notifiedAlerts.add(alert.id);
      }
    });

    // Clean up old notified alerts
    this.cleanupNotifiedAlerts(filteredAlerts);
  }

  /**
   * Filter alerts by severity threshold
   */
  filterAlertsBySeverity(alerts) {
    const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const thresholdIndex = severityOrder.indexOf(this.settings?.notifications?.severityThreshold || 'MEDIUM');

    return alerts.filter(alert => {
      const alertIndex = severityOrder.indexOf(alert.severity);
      return alertIndex <= thresholdIndex;
    });
  }

  /**
   * Show browser notification
   */
  showNotification(alert) {
    const severityEmojis = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🔵'
    };

    const emoji = severityEmojis[alert.severity] || '⚠️';
    const title = `${emoji} ${alert.severity} Alert: ${alert.title}`;

    const options = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('src/icons/icon128.png'),
      title: title,
      message: alert.description,
      priority: alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 2 : 1,
      requireInteraction: alert.severity === 'CRITICAL',
      buttons: [
        { title: 'View in ADOC' },
        { title: 'Acknowledge' }
      ]
    };

    chrome.notifications.create(alert.id, options, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Notification error:', chrome.runtime.lastError);
      }
    });

    // Play sound if enabled
    if (this.settings?.notifications?.sound) {
      this.playNotificationSound();
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    // Chrome doesn't allow audio in service workers easily
    // Instead, send message to active tab to play sound
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'PLAY_NOTIFICATION_SOUND'
        }).catch(() => {
          // Ignore errors if content script not loaded
        });
      }
    });
  }

  /**
   * Clean up old notified alerts
   */
  cleanupNotifiedAlerts(currentAlerts) {
    const currentIds = new Set(currentAlerts.map(a => a.id));

    // Remove notified alerts that are no longer active
    this.notifiedAlerts.forEach(id => {
      if (!currentIds.has(id)) {
        this.notifiedAlerts.delete(id);
      }
    });

    // Limit size of notified set
    if (this.notifiedAlerts.size > 100) {
      const arr = Array.from(this.notifiedAlerts);
      this.notifiedAlerts = new Set(arr.slice(-50));
    }
  }

  /**
   * Handle notification button clicks
   */
  handleNotificationClick(notificationId, buttonIndex) {
    if (buttonIndex === 0) {
      // View in ADOC
      this.openAlertInADOC(notificationId);
    } else if (buttonIndex === 1) {
      // Acknowledge
      this.acknowledgeAlert(notificationId);
    }

    // Clear notification
    chrome.notifications.clear(notificationId);
  }

  /**
   * Open alert in ADOC
   */
  async openAlertInADOC(alertId) {
    try {
      const response = await chrome.storage.local.get('adocCredentials');
      const baseUrl = response.adocCredentials?.baseUrl || 'https://adoc.acceldata.io';

      chrome.tabs.create({
        url: `${baseUrl}/alerts/${alertId}`
      });
    } catch (error) {
      console.error('Error opening alert in ADOC:', error);
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId) {
    try {
      await chrome.runtime.sendMessage({
        type: 'ACKNOWLEDGE_ALERT',
        payload: { alertId }
      });

      this.notifiedAlerts.delete(alertId);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }

  /**
   * Stop periodic checking
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
