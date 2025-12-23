/**
 * Background Service Worker
 * Handles API communication, authentication, and data management
 */

// Import required classes (will be bundled or loaded via modules)
importScripts(
  '../utils/encryption.js',
  '../utils/storage.js',
  '../utils/messages.js',
  '../api/adoc-client.js',
  'notification-manager.js'
);

// Initialize storage manager
const storageManager = new StorageManager();

// API client instance (will be initialized with credentials)
let apiClient = null;

// Notification manager instance
let notificationManager = null;

// In-memory cache for API responses
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize API client with stored credentials
 */
async function initializeApiClient() {
  try {
    const credentials = await storageManager.getCredentials();

    if (credentials) {
      apiClient = new AdocApiClient(
        credentials.baseUrl,
        credentials.accessKey,
        credentials.secretKey
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to initialize API client:', error);
    return false;
  }
}

/**
 * Get data from memory cache
 */
function getFromMemoryCache(key) {
  const cached = memoryCache.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // Remove expired entry
  if (cached) {
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set data in memory cache
 */
function setMemoryCache(key, data, ttl = MEMORY_CACHE_TTL) {
  memoryCache.set(key, {
    data: data,
    expiresAt: Date.now() + ttl
  });
}

/**
 * Handle incoming messages from content scripts and popups
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(response => {
      sendResponse({ success: true, data: response });
    })
    .catch(error => {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate async response
  return true;
});

/**
 * Main message handler
 */
async function handleMessage(message, sender) {
  const { type, payload } = message;

  switch (type) {
    case MessageTypes.SAVE_CREDENTIALS:
      return await handleSaveCredentials(payload);

    case MessageTypes.GET_CREDENTIALS:
      return await handleGetCredentials();

    case MessageTypes.CLEAR_CREDENTIALS:
      return await handleClearCredentials();

    case MessageTypes.TEST_CONNECTION:
      return await handleTestConnection();

    case MessageTypes.GET_ASSET_BY_FQN:
      return await handleGetAssetByFQN(payload);

    case MessageTypes.GET_RELIABILITY_SCORE:
      return await handleGetReliabilityScore(payload);

    case MessageTypes.GET_ALERTS:
      return await handleGetAlerts(payload);

    case MessageTypes.GET_LINEAGE:
      return await handleGetLineage(payload);

    case MessageTypes.GET_POWERBI_REPORT:
      return await handleGetPowerBIReport(payload);

    case MessageTypes.SEARCH_ASSETS:
      return await handleSearchAssets(payload);

    case MessageTypes.ACKNOWLEDGE_ALERT:
      return await handleAcknowledgeAlert(payload);

    case MessageTypes.UPDATE_CONTEXT:
      return await handleUpdateContext(payload);

    case MessageTypes.GET_CONTEXT:
      return await handleGetContext();

    case MessageTypes.SAVE_SETTINGS:
      return await handleSaveSettings(payload);

    case MessageTypes.GET_SETTINGS:
      return await handleGetSettings();

    case MessageTypes.CLEAR_CACHE:
      return await handleClearCache();

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

/**
 * Credential management handlers
 */
async function handleSaveCredentials(credentials) {
  await storageManager.saveCredentials(credentials);
  await initializeApiClient();
  return { success: true };
}

async function handleGetCredentials() {
  const credentials = await storageManager.getCredentials();
  // Don't send secret key to content scripts
  if (credentials) {
    return {
      baseUrl: credentials.baseUrl,
      accessKey: credentials.accessKey,
      hasCredentials: true
    };
  }
  return { hasCredentials: false };
}

async function handleClearCredentials() {
  await storageManager.clearCredentials();
  apiClient = null;
  return { success: true };
}

async function handleTestConnection() {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('No credentials configured');
  }

  const isConnected = await apiClient.testConnection();
  return { connected: isConnected };
}

/**
 * API request handlers with caching
 */
async function handleGetAssetByFQN(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { fullyQualifiedName } = payload;
  const cacheKey = `asset_fqn_${fullyQualifiedName}`;

  // Check memory cache first
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Check storage cache
  const storageCached = await storageManager.getCachedData(cacheKey);
  if (storageCached) {
    setMemoryCache(cacheKey, storageCached);
    return storageCached;
  }

  // Fetch from API
  const result = await apiClient.getAssetByFQN(fullyQualifiedName);

  // Cache the result
  setMemoryCache(cacheKey, result);
  await storageManager.cacheData(cacheKey, result, 24 * 60 * 60 * 1000); // 24 hours

  return result;
}

async function handleGetReliabilityScore(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { assetId } = payload;
  const cacheKey = `reliability_${assetId}`;

  // Check memory cache
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const result = await apiClient.getReliabilityScore(assetId);

  // Cache the result
  setMemoryCache(cacheKey, result);

  return result;
}

async function handleGetAlerts(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { assetIds, severity, status } = payload;
  const cacheKey = `alerts_${assetIds.join('_')}_${severity || 'all'}_${status || 'OPEN'}`;

  // Check memory cache (shorter TTL for alerts)
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const result = await apiClient.getAlerts(assetIds, severity, status);

  // Cache with shorter TTL (1 minute for alerts)
  setMemoryCache(cacheKey, result, 60 * 1000);

  return result;
}

async function handleGetLineage(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { assetId, direction, depth } = payload;
  const cacheKey = `lineage_${assetId}_${direction || 'BOTH'}_${depth || 2}`;

  // Check memory cache
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const result = await apiClient.getLineage(assetId, direction, depth);

  // Cache the result
  setMemoryCache(cacheKey, result);

  return result;
}

async function handleGetPowerBIReport(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { workspaceId, reportId } = payload;
  const cacheKey = `powerbi_${workspaceId}_${reportId}`;

  // Check memory cache
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const result = await apiClient.getPowerBIReport(workspaceId, reportId);

  // Cache the result
  setMemoryCache(cacheKey, result);

  return result;
}

async function handleSearchAssets(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { query, assetType, dataSourceType } = payload;

  // Fetch from API (don't cache search results)
  const result = await apiClient.searchAssets(query, assetType, dataSourceType);

  return result;
}

async function handleAcknowledgeAlert(payload) {
  if (!apiClient) {
    await initializeApiClient();
  }

  if (!apiClient) {
    throw new Error('Not authenticated. Please configure credentials.');
  }

  const { alertId } = payload;
  const result = await apiClient.acknowledgeAlert(alertId);

  // Clear alert cache
  memoryCache.forEach((value, key) => {
    if (key.startsWith('alerts_')) {
      memoryCache.delete(key);
    }
  });

  return result;
}

/**
 * Context and settings handlers
 */
async function handleUpdateContext(context) {
  await storageManager.storeContext(context);
  await storageManager.updateLastActivity();
  return { success: true };
}

async function handleGetContext() {
  return await storageManager.getContext();
}

async function handleSaveSettings(settings) {
  await storageManager.saveSettings(settings);
  return { success: true };
}

async function handleGetSettings() {
  return await storageManager.getSettings();
}

async function handleClearCache() {
  memoryCache.clear();
  await storageManager.clearAllCache();
  return { success: true };
}

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    console.log('ADOC Extension installed');

    // Open options page on first install
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('ADOC Extension updated to version', chrome.runtime.getManifest().version);
  }
});

/**
 * Initialize on startup
 */
(async function initialize() {
  console.log('ADOC Extension background service worker started');

  // Try to initialize API client with stored credentials
  await initializeApiClient();

  // Initialize notification manager
  notificationManager = new NotificationManager();
  await notificationManager.initialize();

  // Check for inactivity every 5 minutes
  setInterval(async () => {
    const shouldLogout = await storageManager.shouldLogoutDueToInactivity(30);
    if (shouldLogout) {
      console.log('Auto-logout due to inactivity');
      await storageManager.clearCredentials();
      apiClient = null;
      memoryCache.clear();

      // Stop notification manager
      if (notificationManager) {
        notificationManager.stop();
      }
    }
  }, 5 * 60 * 1000);

  // Handle notification clicks
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationManager) {
      notificationManager.handleNotificationClick(notificationId, buttonIndex);
    }
  });

  chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationManager) {
      notificationManager.openAlertInADOC(notificationId);
    }
  });
})();
