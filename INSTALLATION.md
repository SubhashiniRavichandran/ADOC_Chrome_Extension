# Installation Guide

## Quick Start

### Option 1: Install from Chrome Web Store (Recommended)
*Coming soon - Extension pending publication*

### Option 2: Manual Installation (Development/Testing)

#### Step 1: Download or Clone the Repository

**Download ZIP:**
1. Download the project as a ZIP file
2. Extract to a folder on your computer

**Or Clone with Git:**
```bash
git clone <repository-url>
cd adoc-extension
```

#### Step 2: Prepare Icon Files

Before loading the extension, you need to add icon files (the extension won't load without them):

1. Create or obtain three PNG icon files:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. Place them in the `src/icons/` directory

**Quick Placeholder Icons:**
You can create simple colored squares as temporary icons using any image editor or online tool like [placeholder.com](https://placeholder.com/).

#### Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle switch in top-right corner)
4. Click "Load unpacked" button
5. Browse to and select the project directory (where `manifest.json` is located)
6. The extension should now appear in your extensions list

#### Step 4: Verify Installation

✅ The ADOC extension icon should appear in your Chrome toolbar
✅ Clicking the icon should open the popup
✅ No errors should appear in the extensions page

## Initial Configuration

### Step 1: Generate ADOC API Keys

1. Log in to your ADOC instance
2. Navigate to **Admin Central → API Keys**
3. Click "Generate New Key"
4. Copy both:
   - Access Key (public identifier)
   - Secret Key (private authentication token)
5. Store these securely (you'll need them in the next step)

### Step 2: Configure Extension Credentials

1. Click the ADOC extension icon in Chrome toolbar
2. Click "Configure Now" (or click the settings gear icon)
3. Enter your ADOC configuration:
   - **Server URL**: Your ADOC instance URL
     - Example: `https://adoc.acceldata.io`
     - Or your custom domain: `https://your-company.acceldata.io`
   - **API Access Key**: Paste the access key from Step 1
   - **API Secret Key**: Paste the secret key from Step 1

4. Click "Test Connection" to verify credentials
   - ✅ Success: "Connection successful!"
   - ❌ Failed: Check your credentials and server URL

5. Click "Save Credentials"

### Step 3: Configure Settings (Optional)

Navigate to **Settings** to customize:

**Notifications:**
- Enable/disable browser notifications
- Set alert severity threshold
- Choose notification frequency

**Display:**
- Auto-show sidebar on page load
- Color scheme preference
- Data refresh interval

**BI Tools:**
- Enable/disable for specific BI tools
- Currently supports PowerBI (others coming soon)

## Verifying the Installation

### Test with PowerBI

1. Navigate to a PowerBI report:
   ```
   https://app.powerbi.com/groups/{workspace-id}/reports/{report-id}
   ```

2. Wait 2-3 seconds for the page to fully load

3. The ADOC sidebar should appear on the right side of the page

4. You should see:
   - Overall report reliability score
   - List of underlying assets
   - Any active alerts
   - Quick action buttons

### Troubleshooting Installation

#### Extension Not Appearing in Toolbar

**Cause**: Extension failed to load

**Solutions**:
- Check `chrome://extensions/` for error messages
- Verify all icon files are present in `src/icons/`
- Check `manifest.json` for syntax errors
- Ensure Chrome version is 120 or higher

#### "Connection Failed" Error

**Cause**: Unable to connect to ADOC API

**Solutions**:
- Verify server URL is correct and accessible
- Check API credentials are valid
- Ensure your network allows access to ADOC
- Try accessing the server URL directly in a browser
- Check if API keys have expired

#### Sidebar Not Appearing on PowerBI

**Cause**: Content script not injecting

**Solutions**:
- Refresh the PowerBI page
- Check you're on a valid report URL (not dashboard or workspace)
- Reload the extension: `chrome://extensions/` → click reload icon
- Check browser console (F12) for errors
- Verify PowerBI is enabled in extension settings

#### "Not Configured" Message

**Cause**: No credentials saved

**Solution**:
- Click "Configure Now" and enter credentials
- Follow Initial Configuration steps above

## Updating the Extension

### For Manual Installation

1. Download/pull the latest version
2. Go to `chrome://extensions/`
3. Click the reload icon on the ADOC extension card
4. Refresh any open BI tool pages

### For Chrome Web Store Installation

Extensions update automatically, but you can force an update:

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Update" button at the top
4. The extension will check for and install updates

## Uninstalling

### Complete Removal

1. Go to `chrome://extensions/`
2. Find "ADOC Data Reliability for BI Tools"
3. Click "Remove"
4. Confirm removal

**Note**: This will delete all stored data including:
- Saved credentials (encrypted)
- User settings
- Cached data

### Keeping Settings for Reinstall

Unfortunately, Chrome doesn't support preserving extension data after uninstall. You'll need to reconfigure after reinstalling.

**Workaround**:
- Note down your settings before uninstalling
- Keep API credentials in a secure password manager

## System Requirements

### Minimum Requirements
- Google Chrome 120 or higher
- Active internet connection
- ADOC instance with API access

### Recommended
- Google Chrome (latest version)
- Fast internet connection
- ADOC account with appropriate permissions

### Supported Platforms
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Fedora, etc.)

### Supported BI Tools
- ✅ PowerBI (Phase 1 - Full support)
- 🚧 Tableau (Phase 2 - Coming soon)
- 🚧 Looker (Phase 3 - Coming soon)

## Permissions Explained

The extension requests the following permissions:

| Permission | Purpose | Required? |
|------------|---------|-----------|
| `storage` | Save credentials and settings | Yes |
| `notifications` | Display data quality alerts | Optional* |
| `activeTab` | Detect current BI tool page | Yes |
| PowerBI domains | Inject sidebar into PowerBI | Yes** |
| Tableau domains | Inject sidebar into Tableau | Yes** |
| Looker domains | Inject sidebar into Looker | Yes** |
| ADOC domains | Fetch reliability data from ADOC | Yes |

\* Can be disabled in settings
\** Only if BI tool is enabled in settings

## Data Privacy

The extension:
- ✅ Stores credentials encrypted locally
- ✅ Only sends requests to your configured ADOC instance
- ✅ Does not collect telemetry or usage data
- ✅ Does not share data with third parties
- ✅ Operates entirely on your device and ADOC instance

See our [Privacy Policy](https://acceldata.io/privacy) for more details.

## Getting Help

### Documentation
- [README.md](README.md) - User guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

### Support Channels
- **Email**: support@acceldata.io
- **JIRA**: Project EXT
- **Documentation**: https://docs.acceldata.io

### Common Issues
See [Troubleshooting](#troubleshooting-installation) section above.

## Next Steps

After installation:

1. ✅ Configure ADOC credentials
2. ✅ Test connection
3. ✅ Navigate to a PowerBI report
4. ✅ Verify sidebar appears with data
5. ⚙️ Customize settings to your preference
6. 🔔 Enable notifications if desired

**You're all set!** The extension will now provide data reliability information whenever you use PowerBI.
