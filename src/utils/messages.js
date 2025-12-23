/**
 * Message passing utilities for communication between
 * content scripts, background worker, and popups
 */

const MessageTypes = {
  // Credential management
  SAVE_CREDENTIALS: 'SAVE_CREDENTIALS',
  GET_CREDENTIALS: 'GET_CREDENTIALS',
  CLEAR_CREDENTIALS: 'CLEAR_CREDENTIALS',
  TEST_CONNECTION: 'TEST_CONNECTION',

  // Asset data requests
  GET_ASSET_BY_FQN: 'GET_ASSET_BY_FQN',
  GET_RELIABILITY_SCORE: 'GET_RELIABILITY_SCORE',
  GET_ALERTS: 'GET_ALERTS',
  GET_LINEAGE: 'GET_LINEAGE',
  GET_POWERBI_REPORT: 'GET_POWERBI_REPORT',
  SEARCH_ASSETS: 'SEARCH_ASSETS',

  // Context management
  UPDATE_CONTEXT: 'UPDATE_CONTEXT',
  GET_CONTEXT: 'GET_CONTEXT',

  // Settings
  GET_SETTINGS: 'GET_SETTINGS',
  SAVE_SETTINGS: 'SAVE_SETTINGS',

  // UI updates
  UPDATE_SIDEBAR: 'UPDATE_SIDEBAR',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',

  // Alert actions
  ACKNOWLEDGE_ALERT: 'ACKNOWLEDGE_ALERT',

  // Cache management
  CLEAR_CACHE: 'CLEAR_CACHE'
};

/**
 * Send a message to the background worker
 * @param {string} type - Message type from MessageTypes
 * @param {object} payload - Message payload
 * @returns {Promise<any>} - Response from background worker
 */
async function sendMessage(type, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: type,
        payload: payload,
        timestamp: Date.now()
      },
      response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Send a message to a specific tab
 * @param {number} tabId - Tab ID
 * @param {string} type - Message type
 * @param {object} payload - Message payload
 */
async function sendMessageToTab(tabId, type, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: type,
        payload: payload,
        timestamp: Date.now()
      },
      response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Set up message listener
 * @param {function} handler - Message handler function
 */
function setupMessageListener(handler) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle async responses
    handler(message, sender)
      .then(response => {
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MessageTypes,
    sendMessage,
    sendMessageToTab,
    setupMessageListener
  };
}
