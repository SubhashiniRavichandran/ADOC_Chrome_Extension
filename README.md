# ADOC Data Reliability Chrome Extension

A Chrome extension that brings ADOC's data observability capabilities directly into your Business Intelligence tools (PowerBI, Tableau, Looker), enabling real-time data quality insights without leaving your workflow.

## Overview

The ADOC Chrome Extension embeds data reliability scores, alerts, and lineage information directly into BI tool interfaces through a customizable sidebar panel. Users can view data quality metrics, receive alerts, and validate insights without context-switching between applications.

## Features

### Core Capabilities

- **Contextual Detection**: Automatically identifies the active BI tool and report
- **Right-Side Panel**: Non-intrusive, collapsible sidebar with key metrics
- **Data Reliability Scores**: View freshness, completeness, accuracy, and drift alerts
- **Alert Notifications**: Real-time data quality alerts for current dashboard/report
- **Lineage Visualization**: Simplified data lineage for assets in current view
- **Secure Authentication**: OAuth 2.0 with encrypted credential storage

### Supported BI Tools

1. **PowerBI** (Phase 1 - Fully Implemented)
2. **Tableau** (Phase 2 - Coming Soon)
3. **Looker** (Phase 3 - Coming Soon)

## Installation

### From Chrome Web Store (Recommended)
*Coming soon - Extension pending publication*

### Manual Installation (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the project directory
6. The extension icon should appear in your browser toolbar

## Configuration

### First-Time Setup

1. Click the ADOC extension icon in your browser toolbar
2. Click "Configure Now" or go to Settings (gear icon)
3. Enter your ADOC credentials:
   - **Server URL**: Your ADOC instance URL (e.g., `https://adoc.acceldata.io`)
   - **API Access Key**: Your ADOC API access key
   - **API Secret Key**: Your ADOC API secret key
4. Click "Test Connection" to verify credentials
5. Click "Save Credentials"

### Generating API Keys

API keys can be generated from ADOC Admin Central:

1. Log in to your ADOC instance
2. Navigate to Admin Central → API Keys
3. Click "Generate New Key"
4. Copy the Access Key and Secret Key
5. Use these credentials in the extension settings

## Usage

### PowerBI Integration

1. Navigate to any PowerBI report (e.g., `https://app.powerbi.com/groups/*/reports/*`)
2. The extension will automatically inject a sidebar on the right side of the page
3. The sidebar displays:
   - Overall report reliability score
   - Active alerts for underlying data assets
   - Individual asset scores and column usage
   - Quick actions to view details in ADOC or refresh data

### Viewing Data Reliability Information

- **Overall Score**: Aggregated reliability score across all assets used in the report
- **Asset Scores**: Individual reliability scores for each table/asset
  - 🟢 Green (90-100%): High reliability
  - 🟡 Yellow (70-89%): Medium reliability
  - 🔴 Red (0-69%): Low reliability
- **Alerts**: Active data quality alerts with severity levels
  - 🔴 Critical: Immediate attention required
  - 🟠 High: Important issues
  - 🟡 Medium: Notable issues
  - 🔵 Low: Minor issues

### Quick Actions

- **View in ADOC Dashboard**: Opens the asset in the ADOC platform for detailed analysis
- **Refresh Data**: Clears cache and fetches latest reliability information
- **Close Sidebar**: Collapses the sidebar (can be reopened via extension icon)

## Settings

### Notification Preferences

- Enable/disable browser notifications
- Set alert severity threshold (Critical, High, Medium, Low)
- Configure notification frequency (Real-time, Hourly, Daily)
- Toggle notification sound

### Display Settings

- Show sidebar by default on page load
- Color scheme (Light, Dark, Auto)
- Data refresh interval (1, 5, 15, 30 minutes)

### BI Tool Integration

- Enable/disable extension for specific BI tools
- PowerBI (currently supported)
- Tableau (Phase 2)
- Looker (Phase 3)

## Architecture

### Components

```
adoc-extension/
├── manifest.json                 # Extension manifest (V3)
├── src/
│   ├── api/
│   │   └── adoc-client.js       # ADOC API client
│   ├── background/
│   │   └── background.js        # Service worker
│   ├── content/
│   │   ├── content-powerbi.js   # PowerBI integration
│   │   ├── content-tableau.js   # Tableau integration
│   │   ├── content-looker.js    # Looker integration
│   │   └── styles.css           # Sidebar styles
│   ├── popup/
│   │   ├── popup.html           # Extension popup
│   │   ├── popup.js             # Popup logic
│   │   └── popup.css            # Popup styles
│   ├── options/
│   │   ├── options.html         # Settings page
│   │   ├── options.js           # Settings logic
│   │   └── options.css          # Settings styles
│   ├── utils/
│   │   ├── encryption.js        # Credential encryption
│   │   ├── storage.js           # Storage management
│   │   ├── messages.js          # Message passing
│   │   └── ui-helpers.js        # UI utilities
│   └── icons/                   # Extension icons
```

### Technology Stack

- **Manifest Version**: V3 (Modern Chrome Extension API)
- **Authentication**: API Key-based with Web Crypto API encryption
- **Storage**: Chrome Storage API (local and session)
- **Caching**: Multi-layer (memory + storage) with configurable TTL
- **Security**: HTTPS-only, encrypted credentials, strict CSP

## Development

### Prerequisites

- Google Chrome (version 120+)
- ADOC instance with API access
- Basic knowledge of JavaScript, HTML, CSS

### Project Structure

See the Architecture section above for file organization.

### Key Files

- **manifest.json**: Extension configuration and permissions
- **background.js**: Service worker handling API calls and state management
- **content-*.js**: Content scripts for BI tool integration
- **adoc-client.js**: ADOC API client implementation

### Testing

#### Manual Testing

1. Load the extension in developer mode
2. Navigate to a PowerBI report
3. Verify sidebar injection and data display
4. Test various scenarios:
   - First-time configuration
   - Credential validation
   - Alert display
   - Data refresh
   - Settings persistence

#### Console Logging

The extension logs important events to the browser console:
- Open DevTools (F12)
- Check Console tab for extension messages
- Prefix: "ADOC Extension:"

### Building for Production

1. Ensure all credentials are removed from code
2. Update version in `manifest.json`
3. Test thoroughly in Chrome
4. Create a ZIP file of the project directory
5. Submit to Chrome Web Store

## Security

### Credential Storage

- API credentials are encrypted using Web Crypto API before storage
- Secret keys are never logged to console
- Credentials are stored in `chrome.storage.local` (not synced)
- Auto-logout after 30 minutes of inactivity

### Content Security Policy

```json
{
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

### Permissions

The extension requests minimal permissions:
- **storage**: Store configuration and cache data
- **notifications**: Display browser notifications
- **activeTab**: Access current tab information
- **host_permissions**: Access BI tool domains and ADOC APIs

## Troubleshooting

### Extension Not Appearing

- Ensure you're on a supported BI tool page (PowerBI, Tableau, Looker)
- Check that the extension is enabled in `chrome://extensions/`
- Refresh the page after enabling the extension

### Connection Failed

- Verify ADOC server URL is correct and accessible
- Check API credentials are valid and not expired
- Ensure your network allows access to ADOC APIs
- Test connection from extension settings

### Sidebar Not Showing Data

- Confirm you're on a valid PowerBI report page
- Check extension popup for connection status
- Try clicking "Refresh Data" in the sidebar
- Clear extension cache from settings

### Authentication Errors

- Re-enter your API credentials in settings
- Generate new API keys from ADOC Admin Central
- Ensure API keys have proper permissions

## Performance

### Optimization Features

- **Lazy Loading**: UI loads only when needed
- **Multi-layer Caching**: Memory + storage cache with configurable TTL
- **Request Throttling**: Rate limit protection and exponential backoff
- **Debounced Search**: 300ms debounce on search/filter operations

### Performance Targets

- Extension load time: <2 seconds
- API response time: <500ms
- Cache hit rate: >80%
- Error rate: <1%

## Browser Compatibility

- **Supported**: Chrome 120+ (Manifest V3)
- **Not Supported**: Firefox, Safari, Edge Legacy

## Support

### Resources

- **Documentation**: [docs.acceldata.io](https://docs.acceldata.io)
- **Support**: [support@acceldata.io](mailto:support@acceldata.io)
- **Issues**: Report bugs via JIRA (project: EXT)

### Common Issues

See the Troubleshooting section above.

## Roadmap

### Phase 1: PowerBI (Current)
- ✅ Chrome Extension Development
- ✅ ADOC API Integration
- ✅ Sidebar Features
- ✅ Authentication & Security
- 🚧 Testing & Chrome Web Store Deployment

### Phase 2: Tableau
- Tableau-specific context detection
- Asset mapping for Tableau
- UI adjustments

### Phase 3: Looker
- Looker-specific integration
- Full feature parity with PowerBI

## License

Copyright © 2025 Acceldata Inc. All rights reserved.

## Contributors

- Nitin Motgi - [nitin.motgi@acceldata.io](mailto:nitin.motgi@acceldata.io)
- Ashok G - [ashok.gunasekaran@acceldata.io](mailto:ashok.gunasekaran@acceldata.io)

## Version History

### v1.0.0 (Current)
- Initial release
- PowerBI integration
- Core features: sidebar, alerts, reliability scores
- Secure credential management
- Settings and configuration
