# ADOC Extension - Development Guide

## Prerequisites

- Google Chrome 120+ or Chromium-based browser
- Text editor or IDE (VS Code recommended)
- Access to ADOC instance with API credentials
- Basic understanding of:
  - JavaScript (ES6+)
  - Chrome Extension APIs (Manifest V3)
  - HTML/CSS
  - REST APIs

## Getting Started

### 1. Clone/Download the Project

```bash
git clone <repository-url>
cd adoc-extension
```

### 2. Project Structure

```
adoc-extension/
├── manifest.json              # Extension configuration
├── README.md                  # User documentation
├── DEVELOPMENT.md            # This file
├── CHANGELOG.md              # Version history
├── src/
│   ├── api/
│   │   └── adoc-client.js    # ADOC API client
│   ├── background/
│   │   └── background.js     # Service worker
│   ├── content/
│   │   ├── content-powerbi.js
│   │   ├── content-tableau.js
│   │   ├── content-looker.js
│   │   └── styles.css
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── storage.js
│   │   ├── messages.js
│   │   └── ui-helpers.js
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
```

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the project directory
5. Extension should appear with ADOC icon

### 4. Configure Test Credentials

1. Click the extension icon
2. Go to Settings
3. Enter test ADOC credentials:
   - Server URL: Your ADOC test instance
   - API Access Key: Your test access key
   - API Secret Key: Your test secret key
4. Click "Test Connection" to verify

## Development Workflow

### Making Changes

1. **Edit Files**: Make changes to source files in `src/`
2. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Click reload icon on the ADOC extension card
   - OR use the keyboard shortcut: `Ctrl+R` (Windows/Linux) / `Cmd+R` (Mac) while on the extensions page
3. **Test Changes**: Refresh the BI tool page to see changes

### Hot Reload Tips

- **Content Scripts**: Require page refresh after extension reload
- **Background Script**: Automatically restarts on extension reload
- **Popup/Options**: Close and reopen to see changes
- **CSS Changes**: Require page refresh

### Debugging

#### Background Script (Service Worker)

1. Go to `chrome://extensions/`
2. Find ADOC extension
3. Click "service worker" link under "Inspect views"
4. DevTools opens for background script
5. Check Console, Network, and Application tabs

#### Content Scripts

1. Open BI tool page (e.g., PowerBI report)
2. Press F12 to open DevTools
3. Check Console for content script logs
4. Logs prefixed with "ADOC Extension:"

#### Popup

1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup
4. Note: Popup closes when you click outside it

#### Options Page

1. Right-click on options page
2. Select "Inspect"
3. Standard DevTools for web pages

### Console Logging

The extension includes extensive logging:

```javascript
console.log('ADOC Extension: PowerBI content script loaded');
console.error('ADOC API request failed:', error);
console.warn('Rate limit reached. Waiting...');
```

Filter console by "ADOC" to see extension-specific logs.

## Code Architecture

### Message Passing

Communication between components uses Chrome's message passing API:

```javascript
// From content script or popup
const response = await chrome.runtime.sendMessage({
  type: 'GET_POWERBI_REPORT',
  payload: { workspaceId, reportId }
});

// Handled in background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(response => sendResponse({ success: true, data: response }))
    .catch(error => sendResponse({ success: false, error: error.message }));
  return true; // Async response
});
```

### Message Types

Defined in `src/utils/messages.js`:

- `SAVE_CREDENTIALS`, `GET_CREDENTIALS`, `CLEAR_CREDENTIALS`
- `GET_ASSET_BY_FQN`, `GET_RELIABILITY_SCORE`, `GET_ALERTS`
- `GET_LINEAGE`, `GET_POWERBI_REPORT`, `SEARCH_ASSETS`
- `UPDATE_CONTEXT`, `GET_CONTEXT`
- `SAVE_SETTINGS`, `GET_SETTINGS`
- `CLEAR_CACHE`

### Storage Management

Two storage areas:

1. **Local Storage** (`chrome.storage.local`):
   - Persistent across sessions
   - Used for: credentials, settings, long-term cache
   - Encrypted: Yes (for credentials)

2. **Session Storage** (`chrome.storage.session`):
   - Cleared when browser closes
   - Used for: current context, temporary cache
   - Encrypted: No

### Caching Strategy

Multi-layer caching for performance:

1. **Memory Cache** (Background script):
   - TTL: 5 minutes (default)
   - Fastest access
   - Cleared on extension reload

2. **Session Storage**:
   - TTL: Session duration
   - Survives page navigation
   - Cleared on browser close

3. **Local Storage**:
   - TTL: 24 hours
   - Survives browser restart
   - Manual invalidation

### API Client Design

The `AdocApiClient` class (src/api/adoc-client.js):

```javascript
const client = new AdocApiClient(baseUrl, accessKey, secretKey);

// Search assets
const assets = await client.searchAssets('TABLE_NAME', 'TABLE', 'SNOWFLAKE');

// Get reliability score
const score = await client.getReliabilityScore(assetId);

// Get alerts
const alerts = await client.getAlerts([assetId1, assetId2], 'HIGH');

// Get lineage
const lineage = await client.getLineage(assetId, 'BOTH', 2);
```

Features:
- Rate limit handling
- Automatic retry with exponential backoff
- Error handling and logging
- Header management

## Adding New Features

### Adding a New API Endpoint

1. **Update API Client** (`src/api/adoc-client.js`):

```javascript
async getNewFeature(param) {
  return this.makeRequest(`/api/v1/new-feature/${param}`);
}
```

2. **Add Message Type** (`src/utils/messages.js`):

```javascript
const MessageTypes = {
  // ... existing types
  GET_NEW_FEATURE: 'GET_NEW_FEATURE'
};
```

3. **Handle in Background** (`src/background/background.js`):

```javascript
async function handleMessage(message, sender) {
  // ... existing cases
  case MessageTypes.GET_NEW_FEATURE:
    return await handleGetNewFeature(payload);
}

async function handleGetNewFeature(payload) {
  if (!apiClient) await initializeApiClient();
  return await apiClient.getNewFeature(payload.param);
}
```

4. **Call from Content Script**:

```javascript
const response = await chrome.runtime.sendMessage({
  type: 'GET_NEW_FEATURE',
  payload: { param: 'value' }
});
```

### Adding a New BI Tool (e.g., Qlik)

1. **Update Manifest** (`manifest.json`):

```json
{
  "content_scripts": [
    {
      "matches": ["*://*.qlik.com/*"],
      "js": ["src/content/content-qlik.js"],
      "css": ["src/content/styles.css"],
      "run_at": "document_end"
    }
  ],
  "host_permissions": ["*://*.qlik.com/*"]
}
```

2. **Create Content Script** (`src/content/content-qlik.js`):

```javascript
// Similar to content-powerbi.js
function extractQlikContext() {
  // Parse Qlik URL and DOM
  return { biTool: 'qlik', ... };
}

function injectSidebar() {
  // Inject sidebar
}
```

3. **Update Settings** (`src/options/options.html`):

Add checkbox for Qlik in BI Tools tab.

## Testing

### Unit Testing

Currently manual testing. Future: Add Jest for unit tests.

### Integration Testing

1. **Test Credentials**:
   - Valid credentials → Connection successful
   - Invalid credentials → Error message
   - Empty fields → Validation error

2. **Test API Calls**:
   - Search assets → Returns results
   - Get reliability score → Returns score
   - Get alerts → Returns alerts
   - Rate limiting → Handles gracefully

3. **Test UI**:
   - Sidebar injection → Appears on page
   - Data display → Shows correct data
   - Actions → Buttons work correctly

### Manual Test Checklist

- [ ] Install extension from unpacked directory
- [ ] Configure credentials in settings
- [ ] Test connection successful
- [ ] Navigate to PowerBI report
- [ ] Sidebar appears automatically
- [ ] Data loads without errors
- [ ] Overall score displays correctly
- [ ] Assets list shows all tables
- [ ] Alerts display (if any)
- [ ] "View in ADOC" button opens correct URL
- [ ] "Refresh Data" button reloads data
- [ ] Close sidebar and reopen from popup
- [ ] Popup shows current context
- [ ] Settings persist after reload
- [ ] Notifications work (if enabled)

## Common Development Tasks

### Updating Icons

1. Create PNG icons in sizes: 16x16, 48x48, 128x128
2. Place in `src/icons/` directory
3. Update `manifest.json` icon paths
4. Reload extension

### Changing Sidebar Style

1. Edit `src/content/styles.css`
2. Use `.adoc-*` class prefix to avoid conflicts
3. Test on actual BI tool pages
4. Reload extension and refresh page

### Adding New Setting

1. **Update Options HTML** (`src/options/options.html`):

```html
<div class="form-group">
  <label for="new-setting">New Setting</label>
  <input type="text" id="new-setting" name="newSetting" />
</div>
```

2. **Update Options JS** (`src/options/options.js`):

```javascript
// In loadSettings()
document.getElementById('new-setting').value = settings.newSetting || '';

// In form submit handler
const settings = {
  newSetting: document.getElementById('new-setting').value
};
```

3. **Use in Content Script**:

```javascript
const settings = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
const newSetting = settings.data.newSetting;
```

## Build and Release

### Pre-Release Checklist

- [ ] Update version in `manifest.json`
- [ ] Update `CHANGELOG.md`
- [ ] Remove all console.log (keep console.error)
- [ ] Test on multiple PowerBI reports
- [ ] Test with different ADOC instances
- [ ] Verify all credentials are removed
- [ ] Run security audit (check for hardcoded secrets)
- [ ] Test installation from scratch
- [ ] Verify all documentation is up to date

### Creating Release Package

1. Create ZIP file:

```bash
zip -r adoc-extension-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "*.md"
```

2. Verify ZIP contents
3. Test installation from ZIP
4. Upload to Chrome Web Store

### Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload ZIP file
4. Fill in:
   - Detailed description
   - Screenshots (1280x800 or 640x400)
   - Small promotional tile (440x280)
   - Icons
   - Privacy policy
   - Category: Productivity
5. Set visibility: Public / Unlisted / Private
6. Submit for review

## Troubleshooting Development Issues

### Extension Not Loading

- Check `manifest.json` for syntax errors
- Verify all file paths in manifest are correct
- Check browser console for errors
- Ensure Chrome version supports Manifest V3

### Content Script Not Injecting

- Verify URL matches pattern in manifest
- Check content script for syntax errors
- Look for CSP violations in console
- Try reloading extension and page

### Background Script Errors

- Check service worker console (`chrome://extensions/`)
- Verify imports are correct (service workers use `importScripts`)
- Check for async/await issues
- Verify message handling returns true for async

### Storage Issues

- Check Chrome storage quota
- Verify encryption/decryption works
- Check for storage permission in manifest
- Look for serialization errors (can't store functions)

## Best Practices

### Code Style

- Use ES6+ features (const, let, arrow functions)
- Use async/await for asynchronous code
- Prefix all CSS classes with `adoc-`
- Add JSDoc comments for functions
- Use meaningful variable names

### Security

- Never log sensitive data (API keys, tokens)
- Always encrypt credentials before storage
- Use HTTPS for all API calls
- Validate and sanitize user input
- Follow principle of least privilege

### Performance

- Cache API responses appropriately
- Debounce user input events
- Lazy load heavy components
- Minimize DOM manipulation
- Use event delegation

### Error Handling

- Always wrap API calls in try-catch
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient failures
- Never expose internal errors to users

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [ADOC API Documentation](https://docs.acceldata.io)

## Getting Help

- **JIRA**: Project EXT (for bug reports and features)
- **Email**: [support@acceldata.io](mailto:support@acceldata.io)
- **Internal**: Contact Nitin Motgi or Ashok G

## Contributing

1. Create feature branch from main
2. Make changes with descriptive commits
3. Test thoroughly (see checklist above)
4. Update documentation if needed
5. Submit pull request with description
6. Address review feedback
7. Merge after approval
