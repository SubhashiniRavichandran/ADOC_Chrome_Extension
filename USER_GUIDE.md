# ADOC Chrome Extension - Complete User Guide

## Overview
The ADOC (Acceldata Data Quality) Chrome Extension brings data reliability metrics directly into your Power BI dashboards. Monitor data quality, view alerts, and track lineage without leaving your BI tool.

---

## Installation

### Step 1: Load Extension in Chrome
1. Download and extract `ADOC_Extension_Package.zip`
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the extracted folder
6. Extension icon will appear in your Chrome toolbar

---

## Login Flow (Simple & Automatic)

### Step 1: Click Extension Icon
- Click the ADOC extension icon in Chrome toolbar
- You'll see the login screen with a black 'A' logo

### Step 2: Click "Login to Acceldata"
- Click the **"Login to Acceldata"** button
- Button will show "Opening Acceldata..."
- A new tab will open: `https://indiumtech.acceldata.app/`

### Step 3: Complete Login in Acceldata Tab
- Enter your Acceldata credentials in the opened tab
- Complete the login process
- **The extension will automatically detect when you're logged in!**

### Step 4: Configure API Credentials (First Time Only)
- After successful login, if this is your first time:
  - Extension will open the Settings page
  - Enter your Acceldata API credentials:
    - **Base URL**: Your Acceldata instance URL (e.g., `https://indiumtech.acceldata.app`)
    - **Access Key**: Your API access key
    - **Secret Key**: Your API secret key
  - Click **"Save Credentials"**

### Step 5: Automatic Dashboard Load
- Once credentials are saved, the extension automatically:
  - Closes the login tab
  - Returns to the extension popup
  - Shows your dashboard with stats
  - You're ready to use!

---

## Using the Extension with Power BI

### Automatic Sidebar Display

1. **Open any Power BI Dashboard**
   - Navigate to `https://app.powerbi.com/groups/.../reports/...`
   - Extension automatically detects the PowerBI dashboard

2. **Sidebar Appears Automatically**
   - Within 1-2 seconds, a **360px-wide sidebar** slides in from the right
   - Positioned in the top-right corner of your screen
   - Shows "Loading data reliability information..."

3. **View Data Quality Metrics**
   - Overall reliability score with color-coded indicators
   - List of underlying assets with individual scores
   - Active alerts (if any)
   - Data lineage information

### Sidebar Features

#### Overview Tab
- **Overall Reliability Score**: Aggregated score for all assets
- **Asset List**: All tables/datasets with individual scores
  - 🟢 Green (90%+): High quality
  - 🟡 Yellow (70-89%): Medium quality
  - 🔴 Red (<70%): Low quality
- **Search Bar**: Filter assets by name

#### Alerts Tab
- **Active Alerts**: All data quality issues
- **Filter by Severity**:
  - 🔴 Critical
  - 🟠 High
  - 🟡 Medium
  - 🔵 Low
- **Alert Details**: Description, affected asset, timestamp
- **Actions**: View details, acknowledge alerts

#### Lineage Tab
- **Upstream Sources**: Data sources feeding the report
- **Current Report**: Your Power BI report
- **Downstream Impact**: Dependencies (if tracked)

#### Columns Tab
- **Column-level Quality**: Reliability scores for each column
- **Search Columns**: Filter by column name
- **Failing Rules**: View which quality rules are failing

### Toggle Button

- **Pulsing 'A' Button**: Appears in bottom-right corner when sidebar is closed
- **Click to Reopen**: Toggle sidebar visibility anytime
- **Smooth Animations**: Professional slide-in/out effects

---

## Dashboard Features

### Extension Popup Dashboard

Click the extension icon anytime to see:

1. **Total Assets**: Number of tracked data assets
2. **Total Alerts**: Active data quality alerts
3. **Avg Quality**: Average reliability score

### Current Page Info

- Shows whether you're on a Power BI report
- Prompt to fetch data quality metrics
- "Fetch Power BI Data Quality" button

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks extension icon                               │
│    ↓                                                        │
│ 2. Login screen appears                                     │
│    ↓                                                        │
│ 3. Click "Login to Acceldata"                              │
│    ↓                                                        │
│ 4. Tab opens: https://indiumtech.acceldata.app/           │
│    ↓                                                        │
│ 5. User enters credentials and logs in                     │
│    ↓                                                        │
│ 6. Extension detects successful login automatically        │
│    ↓                                                        │
│ 7a. IF credentials exist:                                  │
│     → Close login tab                                      │
│     → Show dashboard                                       │
│     → Display data quality metrics                         │
│    ↓                                                        │
│ 7b. IF no credentials (first time):                       │
│     → Open Settings page                                   │
│     → User enters API credentials                          │
│     → Save credentials                                     │
│     → Return to dashboard                                  │
│    ↓                                                        │
│ 8. User opens Power BI dashboard                          │
│    ↓                                                        │
│ 9. Sidebar automatically appears in corner                 │
│    ↓                                                        │
│10. Data quality metrics displayed                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts & Tips

### Quick Access
- **Click Extension Icon**: View dashboard stats
- **Click 'A' Button**: Toggle sidebar on Power BI pages
- **Close Sidebar**: Click X button in sidebar header

### Best Practices
1. **Keep Credentials Saved**: Configure API credentials once, use forever
2. **Monitor Alerts**: Check sidebar regularly for data quality issues
3. **Use Filters**: Narrow down alerts by severity
4. **Search Assets**: Quickly find specific tables/datasets
5. **Refresh Data**: Click "Refresh Data" button to update metrics

---

## Troubleshooting

### Extension Not Appearing
**Problem**: Sidebar doesn't show on Power BI
**Solution**:
- Ensure you're on a Power BI report page (URL contains `/reports/`)
- Check Chrome console for errors (F12)
- Reload the page

### Login Not Working
**Problem**: "Waiting for login..." never completes
**Solution**:
- Make sure you completed login on Acceldata tab
- Check if tab URL changed from login page
- If timeout occurs, click "Open Extension Settings" link
- Manually enter API credentials

### Sidebar Too Wide
**Problem**: Sidebar blocks content
**Solution**:
- Sidebar is fixed at 360px (optimized width)
- Click X to close sidebar
- Click 'A' button to reopen when needed

### No Data Showing
**Problem**: Sidebar shows "No data available"
**Solution**:
- Verify API credentials in Settings
- Check network connection
- Ensure Power BI report is properly linked to Acceldata

### Login Tab Won't Close
**Problem**: Acceldata tab stays open after login
**Solution**:
- Extension auto-closes tab after 2 seconds
- You can manually close it if needed
- Dashboard will still work

---

## Settings Configuration

### Access Settings
1. Click extension icon
2. Open extension popup
3. Click "Open ADOC Platform" → Settings icon
4. Or right-click extension icon → "Options"

### Required Settings

#### Connection (Required)
- **Base URL**: Your Acceldata instance
- **Access Key**: API access key from Acceldata
- **Secret Key**: API secret key from Acceldata
- **Test Connection**: Verify credentials work

#### Notifications (Optional)
- **Enable Notifications**: Get alerts for data quality issues
- **Severity Threshold**: Minimum severity to notify (Critical/High/Medium/Low)
- **Frequency**: How often to check for new alerts
- **Sound**: Play sound with notifications

#### Display (Optional)
- **Show Sidebar by Default**: Auto-open sidebar on PowerBI pages
- **Color Scheme**: Auto/Light/Dark
- **Refresh Interval**: How often to update data (seconds)

#### BI Tools (Optional)
- **Enable Power BI**: ✅ (Required for this extension)
- **Enable Tableau**: Coming soon
- **Enable Looker**: Coming soon

---

## Supported Platforms

### Currently Supported
- ✅ **Power BI** (100% functional)
  - Power BI Service (app.powerbi.com)
  - Workspaces, My Workspace, Apps
  - All report types

### Coming Soon
- ⏳ **Tableau** (Placeholder)
- ⏳ **Looker** (Placeholder)

---

## API Integration

### Endpoints Used
- `GET /api/assets/{fqn}` - Get asset by fully qualified name
- `GET /api/reliability/{assetId}` - Get reliability score
- `GET /api/alerts` - Get active alerts
- `GET /api/lineage/{assetId}` - Get data lineage
- `GET /api/powerbi/reports/{workspaceId}/{reportId}` - Get Power BI report data

### Authentication
- Uses API access key and secret key
- Credentials encrypted using AES-256
- Stored securely in Chrome storage
- Auto-logout after 30 minutes of inactivity

---

## Privacy & Security

### Data Storage
- API credentials encrypted before storage
- Only stored locally in Chrome
- Never transmitted to third parties
- Cleared on extension uninstall

### Permissions
- **storage**: Save credentials and settings
- **notifications**: Show data quality alerts
- **activeTab**: Access current tab for context
- **host_permissions**:
  - powerbi.com (for sidebar injection)
  - acceldata.io/acceldata.app (for API calls)

---

## FAQ

**Q: Do I need to log in every time?**
A: No! Credentials are saved. Only first-time setup required.

**Q: Will this slow down Power BI?**
A: No. Extension runs in the background with minimal impact.

**Q: Can I use this offline?**
A: No. Extension requires connection to Acceldata for data.

**Q: How often does data refresh?**
A: Automatic refresh based on your configured interval (default: 5 minutes).

**Q: Can I customize the sidebar position?**
A: Currently fixed to top-right. Customization coming soon.

**Q: Does this work with Tableau/Looker?**
A: Not yet. Power BI only. Tableau and Looker support coming soon.

**Q: How do I report bugs?**
A: Open an issue on GitHub: https://github.com/anthropics/claude-code/issues

---

## Version History

### v1.0.0 (Current)
- ✅ Power BI integration
- ✅ Auto-detect dashboard and display sidebar
- ✅ 360px narrow sidebar design
- ✅ Automatic login flow detection
- ✅ Floating toggle button
- ✅ Real-time data quality metrics
- ✅ Alerts, lineage, and column-level quality
- ✅ Persistent credential storage
- ✅ Encrypted API credentials

---

## Support

**Need Help?**
- Check console logs (F12 → Console tab)
- Look for errors or warnings
- Review this guide for solutions

**Report Issues**
- GitHub: https://github.com/anthropics/claude-code/issues
- Include: Chrome version, error messages, screenshots

**Feature Requests**
- Submit via GitHub Issues
- Tag as "enhancement"

---

## Credits

**Developed For**: Acceldata Data Quality Platform
**Extension Version**: 1.0.0
**Last Updated**: 2026-01-08

---

## Quick Start Checklist

- [ ] Install extension from ZIP file
- [ ] Click extension icon
- [ ] Click "Login to Acceldata"
- [ ] Complete login in opened tab
- [ ] Configure API credentials (first time)
- [ ] Open Power BI dashboard
- [ ] Watch sidebar appear automatically
- [ ] View data quality metrics
- [ ] Close/reopen sidebar with 'A' button

**You're all set! Enjoy seamless data quality monitoring! 🎉**
