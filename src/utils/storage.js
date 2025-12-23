/**
 * Storage utilities for Chrome extension
 * Handles secure credential storage and data persistence
 */

class StorageManager {
  constructor() {
    this.encryptionPassword = null;
  }

  /**
   * Initialize storage manager and get/create encryption password
   */
  async initialize() {
    if (this.encryptionPassword) {
      return;
    }

    // Get or create encryption password
    const result = await chrome.storage.local.get('encryptionPassword');

    if (result.encryptionPassword) {
      this.encryptionPassword = result.encryptionPassword;
    } else {
      // Generate new password for encryption
      const encryptionManager = new EncryptionManager();
      this.encryptionPassword = encryptionManager.generatePassword();
      await chrome.storage.local.set({ encryptionPassword: this.encryptionPassword });
    }
  }

  /**
   * Save ADOC credentials securely
   * @param {object} credentials - { baseUrl, accessKey, secretKey }
   */
  async saveCredentials(credentials) {
    await this.initialize();

    const encryptionManager = new EncryptionManager();

    // Encrypt secret key
    const encryptedSecretKey = await encryptionManager.encrypt(
      credentials.secretKey,
      this.encryptionPassword
    );

    // Normalize baseUrl - remove trailing slash
    const normalizedBaseUrl = credentials.baseUrl.replace(/\/+$/, '');

    await chrome.storage.local.set({
      adocCredentials: {
        baseUrl: normalizedBaseUrl,
        accessKey: credentials.accessKey,
        encryptedSecretKey: encryptedSecretKey,
        updatedAt: Date.now()
      }
    });
  }

  /**
   * Get ADOC credentials
   * @returns {Promise<object|null>} - Decrypted credentials or null
   */
  async getCredentials() {
    await this.initialize();

    const result = await chrome.storage.local.get('adocCredentials');

    if (!result.adocCredentials) {
      return null;
    }

    const encryptionManager = new EncryptionManager();

    // Decrypt secret key
    const secretKey = await encryptionManager.decrypt(
      result.adocCredentials.encryptedSecretKey,
      this.encryptionPassword
    );

    return {
      baseUrl: result.adocCredentials.baseUrl,
      accessKey: result.adocCredentials.accessKey,
      secretKey: secretKey
    };
  }

  /**
   * Clear saved credentials
   */
  async clearCredentials() {
    await chrome.storage.local.remove('adocCredentials');
  }

  /**
   * Save user settings
   * @param {object} settings - User settings object
   */
  async saveSettings(settings) {
    await chrome.storage.local.set({
      userSettings: {
        ...settings,
        updatedAt: Date.now()
      }
    });
  }

  /**
   * Get user settings
   * @returns {Promise<object>} - User settings with defaults
   */
  async getSettings() {
    const result = await chrome.storage.local.get('userSettings');

    // Return default settings if none exist
    return result.userSettings || {
      notifications: {
        enabled: true,
        severityThreshold: 'MEDIUM',
        frequency: 'REAL_TIME',
        sound: true
      },
      display: {
        showSidebarByDefault: true,
        colorScheme: 'light',
        refreshInterval: 5
      },
      biTools: {
        powerbi: true,
        tableau: true,
        looker: true
      }
    };
  }

  /**
   * Cache asset data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (default 5 minutes)
   */
  async cacheData(key, data, ttl = 5 * 60 * 1000) {
    const expiresAt = Date.now() + ttl;

    await chrome.storage.session.set({
      [`cache_${key}`]: {
        data: data,
        expiresAt: expiresAt
      }
    });
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached data or null if expired/not found
   */
  async getCachedData(key) {
    const result = await chrome.storage.session.get(`cache_${key}`);
    const cacheEntry = result[`cache_${key}`];

    if (!cacheEntry) {
      return null;
    }

    // Check if expired
    if (Date.now() > cacheEntry.expiresAt) {
      await this.clearCache(key);
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key to clear
   */
  async clearCache(key) {
    await chrome.storage.session.remove(`cache_${key}`);
  }

  /**
   * Clear all cache
   */
  async clearAllCache() {
    const allData = await chrome.storage.session.get(null);
    const cacheKeys = Object.keys(allData).filter(key => key.startsWith('cache_'));

    if (cacheKeys.length > 0) {
      await chrome.storage.session.remove(cacheKeys);
    }
  }

  /**
   * Store current context (for active BI tool page)
   * @param {object} context - Context data
   */
  async storeContext(context) {
    await chrome.storage.session.set({
      currentContext: {
        ...context,
        updatedAt: Date.now()
      }
    });
  }

  /**
   * Get current context
   * @returns {Promise<object|null>} - Context data or null
   */
  async getContext() {
    const result = await chrome.storage.session.get('currentContext');
    return result.currentContext || null;
  }

  /**
   * Track last activity time (for auto-logout)
   */
  async updateLastActivity() {
    await chrome.storage.session.set({
      lastActivity: Date.now()
    });
  }

  /**
   * Check if session should be logged out due to inactivity
   * @param {number} timeoutMinutes - Inactivity timeout in minutes (default 30)
   * @returns {Promise<boolean>} - True if should logout
   */
  async shouldLogoutDueToInactivity(timeoutMinutes = 30) {
    const result = await chrome.storage.session.get('lastActivity');

    if (!result.lastActivity) {
      return false;
    }

    const inactiveTime = Date.now() - result.lastActivity;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    return inactiveTime > timeoutMs;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
