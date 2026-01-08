# ADOC Extension - Login Flow Documentation

## New Automatic Login Flow

This document explains the improved login flow that automatically detects successful Acceldata login and transitions to the dashboard.

---

## Flow Overview

```
USER ACTION                     EXTENSION BEHAVIOR                    UI STATE
═══════════════════════════════════════════════════════════════════════════════

1. Click Extension Icon
                         →      Shows login screen                →  [Login View]
                                Black 'A' logo displayed
                                "Login to Acceldata" button

2. Click "Login to Acceldata"
                         →      Opens Acceldata in new tab       →  [Button: "Opening Acceldata..."]
                                URL: https://indiumtech.acceldata.app/
                                Starts monitoring tab

3. User Logs In
   (In Acceldata Tab)
                         →      Monitors URL changes              →  [Button: "Waiting for login..."]
                                Checks every 2 seconds                  Message: "Please complete
                                Detects login success                   login in the opened tab"

4a. Login Detected +
    Credentials Exist
                         →      Closes login tab                  →  [Loading Dashboard]
                                Loads dashboard data
                                Transitions to dashboard view         [Dashboard View]

4b. Login Detected +
    NO Credentials
                         →      Opens Settings page               →  [Button: "Waiting for login..."]
                                Prompts for API credentials           Message: "Login successful!
                                Keeps monitoring                      Please configure API credentials"

5. User Enters API Credentials
   (In Settings Page)
                         →      Saves credentials                 →  [Loading Dashboard]
                                Closes login tab
                                Loads dashboard                       [Dashboard View]

6. Dashboard Ready
                         →      Shows stats and metrics           →  [Fully Functional]
                                User can fetch PowerBI data           • Total Assets: -
                                                                      • Total Alerts: -
                                                                      • Avg Quality: -
```

---

## Code Implementation

### Key Functions

#### 1. `handleLogin()` - Initiates Login
```javascript
async function handleLogin() {
  // Set waiting flag
  await chrome.storage.local.set({ waitingForLogin: true });

  // Open Acceldata login page
  const tab = await chrome.tabs.create({
    url: 'https://indiumtech.acceldata.app/',
    active: true
  });

  // Start monitoring
  startSessionCheck(tab.id);
}
```

#### 2. `startSessionCheck()` - Monitors Login Tab
```javascript
function startSessionCheck(tabId) {
  sessionCheckInterval = setInterval(async () => {
    // Check if credentials already exist
    const credResponse = await chrome.runtime.sendMessage({
      type: 'GET_CREDENTIALS'
    });

    if (credResponse.success && credResponse.data.hasCredentials) {
      await handleSuccessfulLogin();
      return;
    }

    // Check if URL changed (login successful)
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && !tab.url.includes('login') && tab.url.includes('acceldata')) {
      const hasStoredCreds = await checkOrPromptForCredentials();
      if (hasStoredCreds) {
        await handleSuccessfulLogin();
      }
    }
  }, 2000); // Check every 2 seconds
}
```

#### 3. `checkOrPromptForCredentials()` - Credential Check
```javascript
async function checkOrPromptForCredentials() {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_CREDENTIALS'
  });

  if (response.success && response.data.hasCredentials) {
    return true; // Credentials exist
  }

  // No credentials - open Settings page
  chrome.runtime.openOptionsPage();
  return false;
}
```

#### 4. `handleSuccessfulLogin()` - Complete Login
```javascript
async function handleSuccessfulLogin() {
  // Stop monitoring
  clearInterval(sessionCheckInterval);

  // Clear waiting flag
  await chrome.storage.local.set({ waitingForLogin: false });

  // Close login tab
  await chrome.tabs.remove(loginTabId);

  // Load dashboard
  await loadDashboard();
  showView('dashboard');
}
```

---

## Detection Logic

### Login Success Indicators

1. **URL Change Detection**
   - Monitors tab URL every 2 seconds
   - Initial URL: `https://indiumtech.acceldata.app/` (or login page)
   - After login: URL changes to dashboard/home page
   - Logic: `!url.includes('login') && url.includes('acceldata')`

2. **Credential Storage Check**
   - Primary check: Are API credentials stored?
   - Queries background script: `GET_CREDENTIALS`
   - If credentials exist → proceed to dashboard
   - If no credentials → prompt user to configure

3. **Storage Change Listener**
   - Listens for chrome.storage changes
   - Detects when credentials are saved in Options page
   - Automatically triggers dashboard load
   - No user action required

---

## User Experience

### Scenario 1: First-Time User

```
Step 1: User clicks "Login to Acceldata"
        Extension: Opens https://indiumtech.acceldata.app/
        Button: "Opening Acceldata..."

Step 2: User enters Acceldata credentials
        Extension: Monitors URL
        Button: "Waiting for login..."
        Message: "Please complete login in the opened tab"

Step 3: Login successful, URL changes
        Extension: Detects URL change
        Extension: Checks for API credentials → None found
        Extension: Opens Settings page
        Message: "Login successful! Please configure API credentials"

Step 4: User enters API credentials in Settings
        User: Base URL, Access Key, Secret Key
        User: Clicks "Save Credentials"

Step 5: Credentials saved
        Extension: Detects credential storage change
        Extension: Closes login tab
        Extension: Loads dashboard
        View: Dashboard with stats

Step 6: User opens Power BI
        Extension: Auto-detects PowerBI page
        Extension: Injects sidebar (360px, right corner)
        Sidebar: Shows data quality metrics
```

### Scenario 2: Returning User (Has Credentials)

```
Step 1: User clicks "Login to Acceldata"
        Extension: Opens https://indiumtech.acceldata.app/
        Extension: Checks for existing credentials → Found!
        Button: "Opening Acceldata..."

Step 2: User enters Acceldata credentials
        Extension: Monitors URL
        Button: "Waiting for login..."

Step 3: Login successful, URL changes
        Extension: Detects URL change
        Extension: Checks for API credentials → Found!
        Extension: Closes login tab immediately

Step 4: Dashboard loads automatically
        View: Dashboard with stats
        User can fetch PowerBI data

Step 5: User opens Power BI
        Extension: Sidebar appears automatically
        Sidebar: Shows data quality metrics
```

### Scenario 3: User Manually Configures Credentials

```
Step 1: User opens extension
        View: Login screen

Step 2: User right-clicks extension icon
        User: Selects "Options"
        Settings page opens

Step 3: User enters credentials directly
        User: Base URL, Access Key, Secret Key
        User: Clicks "Save Credentials"

Step 4: Extension detects credentials
        Extension: Closes any open login tabs
        Extension: Shows dashboard
        View: Dashboard ready

Step 5: No Acceldata login required
        User can immediately use extension
        Sidebar works on PowerBI pages
```

---

## Timeout Handling

### 5-Minute Timeout

If user doesn't complete login within 5 minutes:

```javascript
setTimeout(async () => {
  if (sessionCheckInterval) {
    // Stop monitoring
    clearInterval(sessionCheckInterval);

    // Reset UI
    resetLoginButton();

    // Show timeout message
    subtitle.innerHTML = `
      <strong>Login timeout</strong><br>
      <br>
      Please try again or manually configure credentials:<br>
      <a href="#" id="open-options-link">Open Extension Settings</a>
    `;
  }
}, 300000); // 5 minutes
```

User can:
1. Click "Login to Acceldata" again
2. Click "Open Extension Settings" to manually configure
3. Close popup and try later

---

## State Management

### Storage Flags

#### `waitingForLogin` (Boolean)
- **Purpose**: Track if login flow is active
- **Set to true**: When "Login to Acceldata" clicked
- **Set to false**: When login succeeds or times out
- **Used for**: Resume monitoring if popup reopened

### Session Variables

#### `loginTabId` (Number)
- **Purpose**: Track the login tab
- **Value**: Chrome tab ID
- **Used for**: Close tab after successful login

#### `sessionCheckInterval` (Interval ID)
- **Purpose**: Monitoring interval reference
- **Value**: setInterval return value
- **Used for**: Stop monitoring when done

#### `isLoggedIn` (Boolean)
- **Purpose**: Track global login state
- **Value**: true/false
- **Used for**: Determine which view to show

---

## Error Handling

### Tab Closed by User

```javascript
try {
  const tab = await chrome.tabs.get(tabId);
} catch (tabError) {
  console.log('Login tab was closed by user');
  // Continue monitoring in case credentials added manually
}
```

### Network Errors

```javascript
try {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CREDENTIALS' });
} catch (error) {
  console.error('Error checking credentials:', error);
  // Continue monitoring, don't fail
}
```

### Credential Save Failures

```javascript
try {
  await chrome.runtime.sendMessage({
    type: 'SAVE_CREDENTIALS',
    payload: credentials
  });
} catch (error) {
  showError(`Error saving credentials: ${error.message}`);
  // Show error to user, keep login flow active
}
```

---

## Console Logging

For debugging, the extension logs key events:

```
🔄 Monitoring Acceldata tab for successful login...
   (Every 2 seconds) Checking login status...
   (Every 20 seconds) Still waiting for login... (20 seconds elapsed)

✅ Login detected! URL changed to: https://indiumtech.acceldata.app/dashboard
   No credentials found, opening Options page...

🔔 Credentials detected via storage change!
✅ Credentials detected! Loading dashboard...
   Login tab already closed
   Dashboard ready
```

---

## Testing Checklist

- [ ] First-time login flow (no credentials)
- [ ] Returning user login flow (has credentials)
- [ ] Manual credential configuration (skip Acceldata login)
- [ ] Timeout scenario (5 minutes)
- [ ] Tab closed by user during login
- [ ] Popup closed and reopened during login
- [ ] Network errors during credential check
- [ ] Multiple rapid login attempts
- [ ] Storage listener triggers correctly
- [ ] Dashboard loads with correct data

---

## Future Improvements

### Planned Enhancements

1. **OAuth Integration**
   - Use Acceldata OAuth instead of manual credentials
   - Single sign-on experience
   - Automatic token refresh

2. **Session Persistence**
   - Remember Acceldata session cookies
   - Skip login if session valid
   - Auto-refresh expired sessions

3. **Visual Feedback**
   - Progress bar during login
   - Step-by-step indicators
   - Success animation

4. **Error Recovery**
   - Retry failed API calls
   - Graceful fallback for network issues
   - Clear error messages with solutions

---

## Technical Notes

### Why Not Use Cookies?

Chrome extensions have limited access to third-party cookies for security. Instead, we:
- Monitor URL changes as login indicator
- Use explicit API credentials for authentication
- Store encrypted credentials locally

### Why 2-Second Intervals?

Balance between:
- **Responsiveness**: User doesn't wait too long
- **Performance**: Don't overwhelm browser/network
- **Battery**: Minimize background activity

### Why 5-Minute Timeout?

Based on typical user behavior:
- Most users log in within 1-2 minutes
- 5 minutes allows for:
  - Password reset flows
  - Multi-factor authentication
  - Reading documentation
  - Network delays

---

## Conclusion

The new login flow provides:

✅ **Automatic Detection**: No manual steps after login
✅ **Flexible Options**: Multiple ways to configure
✅ **Error Resilient**: Handles edge cases gracefully
✅ **User-Friendly**: Clear messages and guidance
✅ **Secure**: Encrypted credential storage

This creates a seamless experience where users simply log in to Acceldata and the extension handles the rest!
