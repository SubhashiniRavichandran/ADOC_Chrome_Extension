# ADOC Extension - Quick Start Guide

## 🚀 Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `/Users/pshanmugam/Projects/Personal/adoc` directory
5. The ADOC extension icon should appear in your toolbar

## ⚙️ Configuration

1. Click the ADOC extension icon
2. Click "Settings" or go to extension options
3. Enter your ADOC credentials:
   - **Server URL**: `https://indiumtech.acceldata.app` (default)
   - **Access Key**: Your ADOC access key
   - **Secret Key**: Your ADOC secret key
4. Click "Test Connection" to verify
5. Click "Save"

## 📊 Using in PowerBI

### Automatic Activation
The extension automatically activates when you open a PowerBI report in any of these locations:
- **Workspaces**: `https://app.powerbi.com/groups/{workspace}/reports/{report}`
- **My Workspace**: `https://app.powerbi.com/myorg/reports/{report}`
- **Apps**: `https://app.powerbi.com/apps/{app}/reports/{report}`

### Enhanced Sidebar

The sidebar opens automatically on the right side with 4 tabs:

#### 1. 📋 Overview Tab
- **Overall Reliability Score**: Aggregated score for all assets in the report
- **Alert Summary**: Quick count of active alerts
- **Asset List**: All tables/datasets used in the report
  - Each asset shows:
    - Table name
    - Reliability score (🟢 High, 🟡 Medium, 🔴 Low)
    - Alert count
    - Columns used
- **Search Box**: Filter assets by name
- **Actions**:
  - "View in ADOC Dashboard" - Opens full report in ADOC
  - "Refresh Data" - Reloads latest data

#### 2. ⚠️ Alerts Tab
- **Alert Filters**: Filter by severity
  - All
  - 🔴 Critical
  - 🟠 High
  - 🟡 Medium
  - 🔵 Low
- **Alert Cards**: Each alert shows:
  - Severity and timestamp
  - Title and description
  - Affected asset
  - Actions: "View Details" and "Acknowledge"

#### 3. 🔗 Lineage Tab
- **Upstream Sources**: Tables feeding into this report
  - Shows reliability score for each source
  - Identifies problematic sources
- **Current Report**: Highlighted in the middle
- **Downstream Impact**: Reports affected by this data
- **Action**: "View Full Lineage in ADOC"

#### 4. 📋 Columns Tab
- **Column List**: All columns used in the report
  - Column name
  - Quality score
  - Failing rules count
  - Source table
- **Search Box**: Filter columns by name
- **Status Indicators**:
  - ✓ All checks passing (green)
  - ⚠ Failing rules (yellow/red)

### Column Badges

**Automatic Feature**: Quality badges appear next to column names directly in PowerBI!

- **Location**: Badges inject automatically next to field names in:
  - Fields pane
  - Visual headers
  - Slicers
  - Tables

- **Indicators**:
  - 🟢 = High quality (90%+)
  - 🟡 = Medium quality (70-89%)
  - 🔴 = Low quality (<70%)

- **Hover for Details**: Hover over any badge to see:
  - Column name
  - Quality score
  - Failing rules (if any)
  - Source table

## 🔔 Notifications

### Browser Notifications
When enabled in settings, you'll receive browser notifications for:
- New critical alerts
- Data quality issues
- Data freshness warnings

### Notification Actions
Each notification has two buttons:
1. **View in ADOC**: Opens alert details in ADOC platform
2. **Acknowledge**: Marks alert as acknowledged

### Sound Alerts
If enabled, a subtle sound plays when new alerts are detected.

## 🔍 Search & Filter

### Asset Search (Overview Tab)
- Type in the search box to filter assets by name
- Search is case-insensitive
- Results update in real-time

### Column Search (Columns Tab)
- Type in the search box to filter columns by name
- Helps find specific columns in large reports

### Alert Filters (Alerts Tab)
- Click severity buttons to filter alerts
- "All" shows all alerts
- Severity buttons show count in parentheses

## 💡 Tips & Tricks

### 1. Quick Access
- Click the extension icon to see quick stats
- Shows: Asset count, Alert count, Average score

### 2. Refresh Data
- Click "Refresh Data" button to get latest metrics
- Clears cache and fetches fresh data from ADOC

### 3. Navigate to ADOC
- "View in ADOC Dashboard" opens the full platform
- "View Full Lineage" opens lineage explorer
- Alert "View Details" opens specific alert page

### 4. Column Quality at a Glance
- Look for 🔴 red badges in PowerBI fields
- These indicate columns with quality issues
- Hover to see what's wrong

### 5. Monitor Alerts
- Check the Alerts tab regularly
- Critical alerts (🔴) need immediate attention
- Acknowledge alerts you've addressed

## 🐛 Troubleshooting

### Sidebar Not Appearing
1. Check you're on a PowerBI report page (not dashboard)
2. Verify URL matches supported patterns
3. Reload the page
4. Check browser console for errors

### No Data Showing
1. Verify credentials in settings
2. Click "Test Connection" in settings
3. Check ADOC API is accessible
4. Verify report exists in ADOC

### Column Badges Not Showing
1. Wait a few seconds for PowerBI to load
2. Badges inject after data is fetched
3. Some PowerBI elements may not support badges
4. Check browser console for errors

### Notifications Not Working
1. Check notification permissions in browser
2. Verify notifications enabled in extension settings
3. Check severity threshold setting

## 🔧 Advanced Settings

### Notification Preferences
- **Enable/Disable**: Turn browser notifications on/off
- **Severity Threshold**: Only notify for selected severity and above
- **Frequency**: Real-time, Hourly, or Daily
- **Sound**: Enable/disable notification sound

### Display Settings
- **Auto-show Sidebar**: Open sidebar automatically
- **Refresh Interval**: How often to check for updates
- **Color Scheme**: Light/Dark mode (future)

### BI Tool Integration
- **Enable for PowerBI**: Toggle PowerBI integration
- **Enable for Tableau**: Coming soon
- **Enable for Looker**: Coming soon

## 📝 Keyboard Shortcuts

Currently no keyboard shortcuts are implemented, but you can:
- Click extension icon to toggle sidebar
- Use browser's native shortcuts for navigation

## 🆘 Support

For issues or questions:
1. Check browser console for error messages
2. Verify ADOC API connectivity
3. Review this guide
4. Contact ADOC support team

## 🎯 Best Practices

1. **Regular Monitoring**: Check the extension daily for new alerts
2. **Acknowledge Alerts**: Mark alerts as acknowledged after addressing
3. **Use Search**: In large reports, use search to find specific assets/columns
4. **Check Lineage**: Use lineage tab to understand data flow
5. **Column Badges**: Pay attention to red badges in PowerBI - they indicate issues

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-18  
**Status**: All Features Implemented ✅
