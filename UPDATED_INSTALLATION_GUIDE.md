# ADOC Chrome Extension - Updated Installation Guide

## 🎉 What's New

The extension has been updated with a streamlined OAuth-style login flow matching your new design:

1. **Simple Login Screen** - "Login to Acceldata" button
2. **OAuth Flow** - Opens Acceldata platform for authentication
3. **Fetch Data Screen** - "Fetch Reliability Data" button after login
4. **Loading State** - "Fetching..." with spinner
5. **Data Display** - Overview and Alerts tabs with scores

---

## 📦 Installation Methods

### Method 1: Load from ZIP (Recommended)

1. **Extract the ZIP file**:
   ```bash
   # Download: ADOC_Extension_Package.zip
   # Extract to a folder (e.g., ADOC_Extension)
   unzip ADOC_Extension_Package.zip -d ADOC_Extension
   ```

2. **Open Chrome Extensions page**:
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**:
   - Toggle the switch in the top right corner

4. **Load the extension**:
   - Click "Load unpacked"
   - Select the `ADOC_Extension` folder
   - Extension icon should appear in toolbar

---

### Method 2: Load from Repository

1. **Clone or download the repository**:
   ```bash
   cd /home/user/ADOC_Chrome_Extension
   ```

2. **Open Chrome Extensions page**:
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** (top right toggle)

4. **Click "Load unpacked"**

5. **Select the directory**:
   ```
   /home/user/ADOC_Chrome_Extension
   ```

---

## 🚀 How to Use

### Step 1: Open the Extension

- Click the extension icon in Chrome toolbar
- OR press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

You'll see the **Login Screen**:
```
┌─────────────────────┐
│  a              ✕   │
├─────────────────────┤
│                     │
│        🗄️          │
│                     │
│  Check data quality │
│  instantly and make │
│  decisions you can  │
│      trust          │
│                     │
│  [Login to          │
│   Acceldata]        │
│                     │
└─────────────────────┘
```

### Step 2: Login to Acceldata

1. Click **"Login to Acceldata"** button
2. A new tab opens: `https://indiumtech.acceldata.app/`
3. **Enter your Acceldata credentials**:
   - Username/Email
   - Password
4. Click Login on the Acceldata platform

### Step 3: Configure Credentials (One-Time)

After logging in to Acceldata, you need to configure the extension with API credentials:

1. In the extension, click the **Settings** icon (top right)
2. OR right-click extension icon → **Options**
3. Enter your **API credentials**:
   - **ADOC URL**: `https://indiumtech.acceldata.app`
   - **Access Key**: Your access key from Acceldata
   - **Secret Key**: Your secret key from Acceldata
4. Click **"Save Configuration"**

> **Note**: Get your API keys from Acceldata Settings → API Keys

### Step 4: Fetch Reliability Data

1. **Open a Power BI report** in Chrome:
   ```
   https://app.powerbi.com/groups/workspace-id/reports/report-id
   ```

2. **Click the extension icon** - You'll see:
   ```
   ┌─────────────────────┐
   │  a              ✕   │
   ├─────────────────────┤
   │                     │
   │        🗄️          │
   │                     │
   │  Click below to     │
   │  check data         │
   │  reliability and    │
   │  make informed      │
   │  decisions          │
   │                     │
   │  [🔄 Fetch          │
   │   Reliability Data] │
   │                     │
   └─────────────────────┘
   ```

3. Click **"Fetch Reliability Data"**

4. **Loading state appears**:
   ```
   ┌─────────────────────┐
   │  a              ✕   │
   ├─────────────────────┤
   │                     │
   │        🗄️          │
   │                     │
   │  Click below to     │
   │  check data         │
   │  reliability...     │
   │                     │
   │  [⟳ Fetching...]   │
   │                     │
   └─────────────────────┘
   ```

5. **Data displays**:
   ```
   ┌─────────────────────┐
   │  a              ✕   │
   ├─────────────────────┤
   │ ┌─────────────────┐ │
   │ │Overall Reliability│ │
   │ │      87%        │ │
   │ │  Q4 Sales Report│ │
   │ └─────────────────┘ │
   │                     │
   │ [Overview] [Alerts] │
   │                     │
   │ 📊 sales_data  92% │
   │ 📊 customer    78% │
   │ 📊 products    65% │
   │                     │
   └─────────────────────┘
   ```

---

## 🔑 Getting API Credentials

### From Acceldata Platform

1. **Login** to https://indiumtech.acceldata.app/
2. Navigate to **Settings** → **API Keys**
3. Click **"Generate New API Key"**
4. Copy:
   - **Access Key**
   - **Secret Key**
5. Paste into extension settings

---

## 🎨 Extension Features

### Popup Views

#### 1. Login View
- Database icon
- Welcome message
- "Login to Acceldata" button
- Opens Acceldata platform in new tab

#### 2. Fetch View
- Database icon
- Instructions message
- "Fetch Reliability Data" button
- Refresh icon on button

#### 3. Loading View
- Database icon
- Same layout
- "Fetching..." button with spinner
- Disabled state

#### 4. Data View
- **Overall Score Card**:
  - Large percentage display
  - Report name
  - Gradient background

- **Tabs**:
  - Overview (default)
  - Alerts (with count badge)

- **Overview Tab**:
  - List of data assets
  - Each showing:
    - Asset name
    - Reliability score (color-coded)
    - FQN (Fully Qualified Name)

- **Alerts Tab**:
  - Grouped by severity
  - Color-coded badges:
    - 🔴 Critical (red)
    - 🟠 High (orange)
    - 🔵 Medium (blue)
    - ⚪ Low (gray)
  - Alert description
  - Timestamp

### Color Coding

- **Excellent (80-100%)**: Green 🟢
- **Good (60-79%)**: Yellow-Green 🟡
- **Warning (40-59%)**: Orange 🟠
- **Critical (0-39%)**: Red 🔴

---

## 🐛 Troubleshooting

### Extension Not Loading

**Issue**: Extension shows error when loading

**Solution**:
1. Make sure all files are extracted
2. Check that `manifest.json` exists in root
3. Verify all icon files exist in `src/icons/`
4. Try removing and re-loading the extension

### "Login to Acceldata" Button Not Working

**Issue**: Clicking button does nothing

**Solution**:
1. Check browser console for errors (F12)
2. Verify popup blocker isn't blocking new tabs
3. Try manually opening: https://indiumtech.acceldata.app/

### "Please configure your credentials" Error

**Issue**: After login, still shows error

**Solution**:
1. Open extension **Options** (right-click icon → Options)
2. Enter your API credentials
3. Click "Test Connection" to verify
4. Click "Save Configuration"

### "Fetch Reliability Data" Button Not Responding

**Issue**: Button click doesn't do anything

**Solution**:
1. **Verify you're on a Power BI page**:
   - URL should contain `powerbi.com`
   - Must be viewing an actual report
2. Check credentials are configured
3. Open browser console (F12) for error details
4. Try refreshing the Power BI page

### "Unable to detect Power BI report context"

**Issue**: Extension can't find report info

**Solution**:
1. Make sure you're on a report page, not:
   - Workspace list page
   - Settings page
   - Dataset page
2. URL should look like:
   ```
   https://app.powerbi.com/groups/{workspace-id}/reports/{report-id}
   ```
3. Wait for report to fully load before clicking fetch
4. Try refreshing the page

### No Data Displayed

**Issue**: Fetch completes but no data shown

**Solution**:
1. Check if report has data assets linked in Acceldata
2. Verify API credentials have correct permissions
3. Check browser console for API errors
4. Test API connection in extension Options page

---

## 📋 Requirements

- **Browser**: Google Chrome (latest version)
- **Power BI**: Access to Power BI reports
- **Acceldata**: Valid account and API credentials

---

## 🔒 Security Notes

1. **API Keys**: Stored locally using AES-256 encryption
2. **No Cloud Sync**: Credentials never leave your machine
3. **HTTPS Only**: All API calls use secure HTTPS
4. **Auto-Logout**: Session expires after 30 minutes of inactivity

---

## 📊 Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Power BI | ✅ Fully Supported | All report types |
| Tableau | 🚧 Coming Soon | Phase 2 |
| Looker | 🚧 Coming Soon | Phase 3 |

---

## 🆘 Support

### Quick Checks

1. ✅ Extension loaded in `chrome://extensions/`
2. ✅ Developer mode enabled
3. ✅ API credentials configured
4. ✅ Viewing a Power BI report
5. ✅ Internet connection active

### Getting Help

1. **Check browser console**: Press F12, look for errors
2. **Review extension logs**: Click extension icon, check console
3. **Test API connection**: Extension Options → Test Connection

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Not configured" | No API credentials | Go to Options, enter credentials |
| "Connection failed" | Can't reach ADOC API | Check credentials and network |
| "No active tab found" | Chrome can't detect tab | Reload browser |
| "Please open a Power BI report" | Not on Power BI | Navigate to a report |

---

## 🎯 Next Steps

1. ✅ Install extension
2. ✅ Login to Acceldata
3. ✅ Configure API credentials
4. ✅ Open Power BI report
5. ✅ Click "Fetch Reliability Data"
6. ✅ View data quality scores!

---

## 📝 Version Info

- **Version**: 1.0.0 (Updated Design)
- **Last Updated**: December 23, 2025
- **Manifest**: V3 (Chrome Extension Manifest Version 3)

---

**Ready to use?** Load the extension and start checking data quality! 🚀
