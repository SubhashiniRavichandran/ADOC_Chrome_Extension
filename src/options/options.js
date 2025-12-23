/**
 * Options Page JavaScript
 * Handles settings and configuration
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Tab navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Update active nav button
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show corresponding tab
      tabContents.forEach(tab => {
        tab.classList.remove('active');
      });
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // Load saved settings
  await loadSettings();

  // Set up form handlers
  setupConnectionForm();
  setupNotificationsForm();
  setupDisplayForm();
  setupBIToolsForm();
});

/**
 * Load saved settings from storage
 */
async function loadSettings() {
  try {
    // Load credentials
    const credResponse = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
    if (credResponse.success && credResponse.data.hasCredentials) {
      document.getElementById('base-url').value = credResponse.data.baseUrl || '';
      document.getElementById('access-key').value = credResponse.data.accessKey || '';
      // Don't pre-fill secret key for security
    }

    // Load other settings
    const settingsResponse = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    if (settingsResponse.success && settingsResponse.data) {
      const settings = settingsResponse.data;

      // Notification settings
      if (settings.notifications) {
        document.getElementById('enable-notifications').checked = settings.notifications.enabled;
        document.getElementById('severity-threshold').value = settings.notifications.severityThreshold;
        document.getElementById('notification-frequency').value = settings.notifications.frequency;
        document.getElementById('notification-sound').checked = settings.notifications.sound;
      }

      // Display settings
      if (settings.display) {
        document.getElementById('show-sidebar-default').checked = settings.display.showSidebarByDefault;
        document.getElementById('color-scheme').value = settings.display.colorScheme;
        document.getElementById('refresh-interval').value = settings.display.refreshInterval;
      }

      // BI Tools settings
      if (settings.biTools) {
        document.getElementById('enable-powerbi').checked = settings.biTools.powerbi;
        document.getElementById('enable-tableau').checked = settings.biTools.tableau;
        document.getElementById('enable-looker').checked = settings.biTools.looker;
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Set up connection form
 */
function setupConnectionForm() {
  const form = document.getElementById('connection-form');
  const testBtn = document.getElementById('test-connection-btn');
  const statusDiv = document.getElementById('connection-status');

  testBtn.addEventListener('click', async () => {
    const baseUrl = document.getElementById('base-url').value.trim();
    const accessKey = document.getElementById('access-key').value.trim();
    const secretKey = document.getElementById('secret-key').value.trim();

    if (!baseUrl || !accessKey || !secretKey) {
      showStatus(statusDiv, 'Please fill in all fields', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    try {
      // Save credentials temporarily
      await chrome.runtime.sendMessage({
        type: 'SAVE_CREDENTIALS',
        payload: { baseUrl, accessKey, secretKey }
      });

      // Test connection
      const response = await chrome.runtime.sendMessage({ type: 'TEST_CONNECTION' });

      if (response.success && response.data.connected) {
        showStatus(statusDiv, 'Connection successful!', 'success');
      } else {
        showStatus(statusDiv, 'Connection failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      showStatus(statusDiv, `Error: ${error.message}`, 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const baseUrl = document.getElementById('base-url').value.trim();
    const accessKey = document.getElementById('access-key').value.trim();
    const secretKey = document.getElementById('secret-key').value.trim();

    if (!baseUrl || !accessKey || !secretKey) {
      showStatus(statusDiv, 'Please fill in all fields', 'error');
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_CREDENTIALS',
        payload: { baseUrl, accessKey, secretKey }
      });

      showStatus(statusDiv, 'Credentials saved successfully!', 'success');

      // Clear secret key field after saving
      document.getElementById('secret-key').value = '';
    } catch (error) {
      showStatus(statusDiv, `Error: ${error.message}`, 'error');
    }
  });
}

/**
 * Set up notifications form
 */
function setupNotificationsForm() {
  const form = document.getElementById('notifications-form');
  const statusDiv = document.getElementById('notifications-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const settings = {
      notifications: {
        enabled: document.getElementById('enable-notifications').checked,
        severityThreshold: document.getElementById('severity-threshold').value,
        frequency: document.getElementById('notification-frequency').value,
        sound: document.getElementById('notification-sound').checked
      }
    };

    try {
      // Get existing settings
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      const existingSettings = response.success ? response.data : {};

      // Merge with existing settings
      const updatedSettings = {
        ...existingSettings,
        ...settings
      };

      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        payload: updatedSettings
      });

      showStatus(statusDiv, 'Notification settings saved!', 'success');
    } catch (error) {
      showStatus(statusDiv, `Error: ${error.message}`, 'error');
    }
  });
}

/**
 * Set up display form
 */
function setupDisplayForm() {
  const form = document.getElementById('display-form');
  const statusDiv = document.getElementById('display-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const settings = {
      display: {
        showSidebarByDefault: document.getElementById('show-sidebar-default').checked,
        colorScheme: document.getElementById('color-scheme').value,
        refreshInterval: parseInt(document.getElementById('refresh-interval').value, 10)
      }
    };

    try {
      // Get existing settings
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      const existingSettings = response.success ? response.data : {};

      // Merge with existing settings
      const updatedSettings = {
        ...existingSettings,
        ...settings
      };

      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        payload: updatedSettings
      });

      showStatus(statusDiv, 'Display settings saved!', 'success');
    } catch (error) {
      showStatus(statusDiv, `Error: ${error.message}`, 'error');
    }
  });
}

/**
 * Set up BI Tools form
 */
function setupBIToolsForm() {
  const form = document.getElementById('bi-tools-form');
  const statusDiv = document.getElementById('bi-tools-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const settings = {
      biTools: {
        powerbi: document.getElementById('enable-powerbi').checked,
        tableau: document.getElementById('enable-tableau').checked,
        looker: document.getElementById('enable-looker').checked
      }
    };

    try {
      // Get existing settings
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      const existingSettings = response.success ? response.data : {};

      // Merge with existing settings
      const updatedSettings = {
        ...existingSettings,
        ...settings
      };

      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        payload: updatedSettings
      });

      showStatus(statusDiv, 'BI tool settings saved! Refresh your BI tool pages for changes to take effect.', 'success');
    } catch (error) {
      showStatus(statusDiv, `Error: ${error.message}`, 'error');
    }
  });
}

/**
 * Show status message
 */
function showStatus(element, message, type = 'success') {
  element.textContent = message;
  element.className = `status-message status-${type}`;
  element.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}
