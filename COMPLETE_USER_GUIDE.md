# ADOC Chrome Extension - Complete User Guide
## Version 2.0 - With Dashboard & Case Scenarios

---

## 🎉 What's New in This Version

### Major Features
1. **Black 'A' Logo** - Professional branding with bordered design
2. **Dashboard View** - Intermediate view after login with stats
3. **Three Case Scenarios** - Intelligent display based on data availability
4. **Enhanced Flow** - Login → Dashboard → Fetch → Display
5. **Banner System** - Visual feedback for success/warning/error states

---

## 📊 Complete User Journey

### 1. First Time Setup

```
┌─────────────────────────────┐
│  A                      ✕   │  ← Black 'A' logo
├─────────────────────────────┤
│                             │
│           🗄️                │
│                             │
│   Check data quality        │
│   instantly and make        │
│   decisions you can trust   │
│                             │
│   [ Login to Acceldata ]    │
│                             │
└─────────────────────────────┘
```

**Steps:**
1. Click extension icon in Chrome toolbar
2. See "Login to Acceldata" button
3. Click button → Opens https://indiumtech.acceldata.app/
4. Login on Acceldata platform
5. Configure extension (see Configuration section below)

---

### 2. Configuration (One-Time)

After logging into Acceldata:

1. **Right-click extension icon** → Select "Options"
2. Enter your **API credentials**:
   - **ADOC URL**: `https://indiumtech.acceldata.app`
   - **Access Key**: Your access key
   - **Secret Key**: Your secret key
3. Click **"Test Connection"** to verify
4. Click **"Save Configuration"**

> **Get API Keys**: Acceldata Platform → Settings → API Keys

---

### 3. Dashboard View (After Login)

Once configured, you'll see the Dashboard:

```
┌─────────────────────────────┐
│  A                      ✕   │
├─────────────────────────────┤
│     ADOC Dashboard          │
│  Monitor your data quality  │
│                             │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ 📊  │ │ ⚠️  │ │ ✅  │    │
│ │  -  │ │  -  │ │  -  │    │
│ │Total│ │Alert│ │ Avg │    │
│ └─────┘ └─────┘ └─────┘    │
│                             │
│ [🔄 Fetch Power BI Data    │
│      Quality]               │
│                             │
│ [ Open ADOC Platform ]      │
│                             │
│ ✅ Power BI report detected│
│    Click "Fetch..." to view │
└─────────────────────────────┘
```

**Dashboard Features:**
- **Stat Cards**: Total Assets, Active Alerts, Avg Quality
- **Fetch Button**: Fetches Power BI data quality metrics
- **ADOC Button**: Opens Acceldata platform
- **Context Detection**: Shows if Power BI is open

---

### 4. Fetching Data

**Prerequisites:**
- Open a Power BI report in Chrome
- URL should be: `https://app.powerbi.com/groups/.../reports/...`

**Steps:**
1. Open Power BI report
2. Click extension icon
3. Dashboard shows "✅ Power BI report detected"
4. Click **"Fetch Power BI Data Quality"**
5. Loading state appears

```
┌─────────────────────────────┐
│  A                      ✕   │
├─────────────────────────────┤
│           🗄️                │
│                             │
│  Fetching data quality      │
│  metrics from Acceldata...  │
│                             │
│     [ ⟳ Fetching... ]       │
│                             │
└─────────────────────────────┘
```

---

## 🎯 Three Case Scenarios

Based on the data fetched, the extension displays one of three cases:

---

### **Case 1A: Data Found, No Alerts** ✅

**When:** All data assets are monitored and have no quality issues

```
┌─────────────────────────────┐
│  A                      ✕   │
├─────────────────────────────┤
│ ✅ All data quality checks  │
│    passed!                  │
├─────────────────────────────┤
│  Overall Reliability Score  │
│          92%                │
│   Q4 2025 Sales Report      │
├─────────────────────────────┤
│ [Overview] [Details]        │
│                             │
│ sales_data           95% 🟢 │
│ snowflake://prod/sales      │
│ ● No Issues                 │
│                             │
│ customer_data        89% 🟢 │
│ snowflake://prod/customer   │
│ ● No Issues                 │
└─────────────────────────────┘
```

**Features:**
- Green success banner
- Large reliability score display
- Two tabs: Overview and Details
- Asset list with:
  - Asset name
  - Reliability score (color-coded)
  - FQN (Fully Qualified Name)
  - Status badge "No Issues"

**Color Coding:**
- 🟢 **80-100%**: Excellent (Green)
- 🟡 **60-79%**: Good (Yellow-Green)
- 🟠 **40-59%**: Warning (Orange)
- 🔴 **0-39%**: Critical (Red)

---

### **Case 1B: Data Found, With Alerts** ⚠️

**When:** Data assets are monitored but have quality issues

```
┌─────────────────────────────┐
│  A                      ✕   │
├─────────────────────────────┤
│ ⚠️ 2 critical issues        │
│    detected                 │
├─────────────────────────────┤
│  Overall Reliability Score  │
│          67%                │
│   Q4 2025 Sales Report      │
├─────────────────────────────┤
│ [Alerts (3)] [Assets (2)]   │
│                             │
│ ┌─ Critical ─────────────┐  │
│ │ Data Freshness Issue   │  │
│ │ Table sales_data has   │  │
│ │ not been updated...    │  │
│ │ sales_data    2h ago   │  │
│ └────────────────────────┘  │
│                             │
│ ┌─ High ──────────────────┐ │
│ │ Schema Change Detected │  │
│ │ Column removed from... │  │
│ │ customer_data  4h ago  │  │
│ └────────────────────────┘  │
└─────────────────────────────┘
```

**Features:**
- Yellow warning banner with alert count
- Reliability score display
- Two tabs: Alerts and Assets
- **Alerts Tab** shows:
  - Severity badge (Critical/High/Medium/Low)
  - Alert title and description
  - Affected asset name
  - Timestamp (relative time)
- **Assets Tab** shows:
  - Assets with alert counts
  - Status badges showing alert numbers

**Alert Severity Colors:**
- 🔴 **Critical**: Red
- 🟠 **High**: Orange
- 🔵 **Medium**: Blue
- ⚪ **Low**: Gray

---

### **Case 2: No Data Available** ❌

**When:** Power BI data sources are not monitored in Acceldata

```
┌─────────────────────────────┐
│  A                      ✕   │
├─────────────────────────────┤
│ ❌ No data assets found     │
│    in Acceldata             │
├─────────────────────────────┤
│                             │
│           📊                │
│                             │
│   No Assets Available       │
│                             │
│  The data sources used in   │
│  this Power BI report are   │
│  not being monitored in     │
│  Acceldata platform.        │
│                             │
│ [ + Add Assets to ADOC ]    │
│                             │
└─────────────────────────────┘
```

**Features:**
- Red error banner
- Empty state illustration
- Clear explanation message
- "Add Assets to ADOC" button (opens platform)

**Action:** Click button to open Acceldata and add monitoring for these assets

---

## 🚀 Quick Start Guide

### For New Users

1. **Install Extension**
   ```
   chrome://extensions/ → Load unpacked → Select extension folder
   ```

2. **Login**
   ```
   Click extension → Login to Acceldata → Enter credentials on platform
   ```

3. **Configure**
   ```
   Right-click extension → Options → Enter API keys → Save
   ```

4. **Use**
   ```
   Open Power BI report → Click extension → Fetch Data Quality
   ```

### For Daily Users

1. Open Power BI report
2. Click extension icon (see Dashboard)
3. Click "Fetch Power BI Data Quality"
4. View metrics (Case 1A/1B/2)

---

## 💡 Features by View

### Login View
- Clean, minimalist design
- Database icon
- "Login to Acceldata" button
- Opens platform in new tab

### Dashboard View
- Three stat cards (Assets, Alerts, Quality)
- Fetch button (primary action)
- Open ADOC button (secondary)
- Context detection (Power BI status)
- Responsive layout

### Case 1A (Success)
- Green banner
- Score card with gradient
- Two-tab interface
- Asset list with badges
- Color-coded scores

### Case 1B (Warnings)
- Yellow banner
- Score card with gradient
- Two-tab interface (Alerts/Assets)
- Severity-based alert grouping
- Detailed alert information
- Asset-alert correlation

### Case 2 (Empty)
- Red banner
- Empty state illustration
- Clear messaging
- Action button to add assets

---

## 🎨 Design Elements

### Logo
- **Style**: Black 'A' with border
- **Size**: 36px × 36px
- **Background**: White
- **Border**: 2px solid black

### Colors
- **Primary Blue**: #0ea5e9 (buttons)
- **Success Green**: #22c55e (scores 80-100%)
- **Warning Orange**: #eab308 (scores 40-59%)
- **Critical Red**: #ef4444 (scores 0-39%)

### Banners
- **Success**: Green background (#f0fdf4)
- **Warning**: Yellow background (#fffbeb)
- **Error**: Red background (#fef2f2)

### Typography
- **Font**: System font stack
- **Sizes**: 11px-48px
- **Weights**: 400, 500, 600, 700

---

## 🔍 Troubleshooting

### "Login to Acceldata" button not working
**Solution**: Check popup blocker settings in Chrome

### Dashboard shows "-" for all stats
**Solution**: This is expected. Stats update after fetching Power BI data

### "No active tab found" error
**Solution**: Ensure you're on a Power BI report page when clicking fetch

### "Unable to detect Power BI report context"
**Solutions**:
1. Verify URL contains `powerbi.com` and `/reports/`
2. Wait for report to fully load before fetching
3. Refresh the Power BI page and try again

### Case 2 appears but I know data is monitored
**Solutions**:
1. Verify asset names match in Acceldata
2. Check API credentials have correct permissions
3. Ensure data sources are properly linked in ADOC

---

## 📋 Supported Scenarios

### Power BI URL Patterns
✅ `https://app.powerbi.com/groups/{workspace}/reports/{report}`
✅ `https://app.powerbi.com/myorg/reports/{report}`
✅ `https://app.powerbi.com/apps/{app}/reports/{report}`

### Data Sources
✅ Snowflake
✅ SQL Server
✅ Azure SQL
✅ PostgreSQL
✅ BigQuery
✅ Redshift
✅ Any source monitored in ADOC

---

## 🔐 Security Features

- **AES-256 Encryption**: For stored credentials
- **HTTPS Only**: All API calls use secure connections
- **No Cloud Sync**: Credentials stay on your machine
- **Auto-Logout**: 30 minutes of inactivity
- **Web Crypto API**: Industry-standard encryption

---

## 📊 Data Display Features

### Score Calculation
- Overall score = Average of all asset scores
- Assets weighted equally
- Rounded to nearest integer

### Alert Prioritization
1. **Critical** (🔴) - Immediate attention required
2. **High** (🟠) - Address soon
3. **Medium** (🔵) - Monitor closely
4. **Low** (⚪) - For awareness

### Timestamp Format
- **< 1 min**: "Just now"
- **< 1 hour**: "Xm ago" (e.g., "15m ago")
- **< 24 hours**: "Xh ago" (e.g., "3h ago")
- **> 24 hours**: Date (e.g., "12/25/2025")

---

## 🎯 Best Practices

### For Users
1. **Configure Once**: Set up API keys in Options page
2. **Check Before Decisions**: Fetch metrics before using reports
3. **Monitor Alerts**: Pay attention to Critical/High severity
4. **Add Monitoring**: Use Case 2 to identify unmonitored sources

### For Admins
1. **Onboard Data Sources**: Ensure all BI sources are in ADOC
2. **Set Quality Rules**: Define what "good quality" means
3. **Configure Alerts**: Set up notifications for issues
4. **Train Users**: Share this guide with report consumers

---

## 📦 Package Information

**File**: `ADOC_Extension_Package.zip`
**Size**: 93 KB
**Version**: 2.0.0
**Updated**: January 7, 2026

### Contents
- ✅ Popup (Login, Dashboard, 3 Cases)
- ✅ Options page (Configuration)
- ✅ Background worker (API calls)
- ✅ Content scripts (Power BI integration)
- ✅ Sidebar (Enhanced view)
- ✅ Icons (16px, 48px, 128px)
- ✅ Utilities (Encryption, storage)

---

## 🔗 Download

**GitHub URL**:
```
https://github.com/SubhashiniRavichandran/ADOC_Chrome_Extension/raw/claude/powerbi-acceldata-extension-Qremz/ADOC_Extension_Package.zip
```

**Installation**:
1. Download ZIP file
2. Extract to a folder
3. Open `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select extracted folder

---

## 📞 Support

### Common Issues
- See "Troubleshooting" section above
- Check browser console (F12) for errors
- Verify API credentials in Options

### Getting Help
1. Check this guide first
2. Review browser console for errors
3. Test API connection in Options page
4. Contact Acceldata support if API issues persist

---

## 🎉 You're Ready!

Your ADOC Chrome Extension is now fully configured with:
- ✅ Modern dashboard interface
- ✅ Three intelligent case scenarios
- ✅ Complete data quality visibility
- ✅ Professional design matching wireframes

**Start using it**: Open a Power BI report and click "Fetch Power BI Data Quality"!

---

**Last Updated**: January 7, 2026
**Version**: 2.0.0
**Branch**: claude/powerbi-acceldata-extension-Qremz
