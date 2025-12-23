# PowerBI Testing Guide - ADOC Extension

## 🧪 Complete Testing Procedure

This guide will help you test the ADOC Chrome Extension with PowerBI reports.

---

## Prerequisites

### 1. Install the Extension
```bash
# 1. Open Chrome and navigate to:
chrome://extensions/

# 2. Enable "Developer mode" (toggle in top-right)

# 3. Click "Load unpacked"

# 4. Select this directory:
/Users/pshanmugam/Projects/Personal/adoc

# 5. Verify the extension appears with ADOC icon
```

### 2. Configure ADOC Credentials

**Option A: Via Extension Popup**
1. Click the ADOC extension icon in Chrome toolbar
2. Click "Settings" or "Configure"
3. Enter your credentials:
   - **Server URL**: `https://indiumtech.acceldata.app`
   - **Access Key**: Your ADOC access key
   - **Secret Key**: Your ADOC secret key
4. Click "Test Connection"
5. If successful, click "Save"

**Option B: Via Extension Options**
1. Right-click ADOC extension icon → "Options"
2. Fill in the same credentials
3. Test and save

---

## Testing Scenarios

### Test 1: Basic Extension Loading

**Steps:**
1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Navigate to any PowerBI report URL
4. Look for console message: `"ADOC Extension: PowerBI content script loaded"`

**Expected Result:**
```
✅ Console shows: "ADOC Extension: PowerBI content script loaded"
✅ Console shows: "ADOC Extension: Injecting enhanced sidebar into PowerBI"
```

**If Failed:**
- Check extension is enabled in `chrome://extensions/`
- Verify manifest.json has correct PowerBI URL patterns
- Check for JavaScript errors in console

---

### Test 2: URL Pattern Detection

Test all three PowerBI URL patterns:

#### Pattern 1: Groups (Workspaces)
**URL Format:** `https://app.powerbi.com/groups/{workspace-id}/reports/{report-id}`

**Example:**
```
https://app.powerbi.com/groups/12345678-1234-1234-1234-123456789abc/reports/87654321-4321-4321-4321-cba987654321
```

**Steps:**
1. Navigate to a PowerBI workspace report
2. Open DevTools Console
3. Check for context detection

**Expected Result:**
```javascript
✅ Context detected with:
{
  biTool: 'powerbi',
  contextType: 'workspace',
  workspaceId: '12345678-1234-1234-1234-123456789abc',
  reportId: '87654321-4321-4321-4321-cba987654321'
}
```

#### Pattern 2: My Workspace
**URL Format:** `https://app.powerbi.com/myorg/reports/{report-id}`

**Steps:**
1. Navigate to a report in "My Workspace"
2. Check console for context detection

**Expected Result:**
```javascript
✅ Context detected with:
{
  biTool: 'powerbi',
  contextType: 'myorg',
  workspaceId: 'me',
  reportId: '{report-id}'
}
```

#### Pattern 3: Apps
**URL Format:** `https://app.powerbi.com/apps/{app-id}/reports/{report-id}`

**Steps:**
1. Navigate to a report from an App
2. Check console for context detection

**Expected Result:**
```javascript
✅ Context detected with:
{
  biTool: 'powerbi',
  contextType: 'app',
  appId: '{app-id}',
  reportId: '{report-id}'
}
```

---

### Test 3: Sidebar Injection

**Steps:**
1. Navigate to any PowerBI report
2. Wait 2-3 seconds for page to load
3. Look for sidebar on the right side of the screen

**Expected Result:**
```
✅ Sidebar appears on the right side
✅ Sidebar has ADOC logo and "Data Reliability" title
✅ Sidebar has 4 tabs: Overview, Alerts, Lineage, Columns
✅ Sidebar opens automatically (slides in from right)
✅ Close button (X) is visible
```

**Visual Check:**
- Sidebar width: ~400px
- Background: White
- Header: Purple gradient
- Tabs: Horizontal row below header

**If Failed:**
- Check console for errors
- Verify `enhanced-sidebar.js` is loaded
- Check CSS is applied (inspect element)
- Verify no conflicts with PowerBI's own UI

---

### Test 4: API Connection

**Steps:**
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Navigate to PowerBI report
4. Wait for sidebar to load

**Expected Result:**
```
✅ Network request to: https://indiumtech.acceldata.app/catalog-server/api/bi-tools/powerbi/workspaces/{workspace}/reports/{report}
✅ Request headers include: accessKey, secretkey
✅ Response status: 200 OK
✅ Response contains JSON with report data
```

**Check Request Headers:**
```
accessKey: {your-access-key}
secretkey: {your-secret-key}
Accept: application/json, text/plain, */*
```

**If Failed:**
- Check credentials are saved correctly
- Verify ADOC API is accessible
- Check for CORS errors
- Verify API endpoint exists in ADOC

---

### Test 5: Enhanced Sidebar Tabs

#### Tab 1: Overview
**Steps:**
1. Click "Overview" tab (should be active by default)
2. Verify content displays

**Expected Result:**
```
✅ Overall Reliability Score displayed (e.g., "94%")
✅ Score has color indicator (🟢 Green, 🟡 Yellow, or 🔴 Red)
✅ Alert summary shows if alerts exist
✅ Asset list displays all tables/datasets
✅ Each asset shows: name, score, alert count (if any)
✅ Search box at top of asset list
✅ "View in ADOC Dashboard" button
✅ "Refresh Data" button
✅ Footer shows "Last updated: X minutes ago"
```

**Test Search:**
1. Type in search box
2. Asset list should filter in real-time

#### Tab 2: Alerts
**Steps:**
1. Click "Alerts" tab
2. Verify alert display

**Expected Result:**
```
✅ Alert count shown in header (e.g., "Active Alerts (5)")
✅ Filter buttons: All, Critical, High, Medium, Low
✅ Each alert card shows:
   - Severity emoji (🔴 🟠 🟡 🔵)
   - Severity text (CRITICAL, HIGH, MEDIUM, LOW)
   - Timestamp (e.g., "2 hours ago")
   - Alert title
   - Alert description
   - Affected asset name
   - "View Details" button
   - "Acknowledge" button
```

**Test Filters:**
1. Click "Critical" filter
2. Only critical alerts should show
3. Click "All" to show all again

#### Tab 3: Lineage
**Steps:**
1. Click "Lineage" tab
2. Verify lineage display

**Expected Result:**
```
✅ "Upstream Sources" section with list of source tables
✅ Each source shows: icon, name, type, reliability score
✅ "Current Report" section highlighted in middle
✅ "Downstream Impact" section
✅ "View Full Lineage in ADOC" button
```

#### Tab 4: Columns
**Steps:**
1. Click "Columns" tab
2. Verify column display

**Expected Result:**
```
✅ Column count in header (e.g., "Column Quality (15)")
✅ Search box at top
✅ Each column shows:
   - Column icon (📋)
   - Column name
   - Quality score with emoji (🟢 🟡 🔴)
   - Source table name
   - Status: "✓ All checks passing" or "⚠ X failing rules"
```

**Test Search:**
1. Type column name in search box
2. List should filter in real-time

---

### Test 6: Column Badge Injection

**Steps:**
1. Navigate to PowerBI report
2. Wait for sidebar to load with data
3. Look at PowerBI's Fields pane (right side of PowerBI)
4. Look at visual headers and tables

**Expected Result:**
```
✅ Quality badges (🟢 🟡 🔴) appear next to field names
✅ Badges are small and non-intrusive
✅ Badges appear in:
   - Fields pane
   - Visual headers
   - Table column headers
   - Slicers
```

**Test Hover Tooltip:**
1. Hover mouse over a badge
2. Tooltip should appear showing:
   - Column name
   - Quality score (e.g., "95%")
   - Failing rules count or "All checks passing"
   - Source table name

**If Badges Don't Appear:**
- Wait 5-10 seconds (badges inject after data loads)
- Check console for errors
- Verify column data exists in API response
- PowerBI's complex DOM may not have expected selectors

---

### Test 7: Notifications

**Steps:**
1. Ensure notifications are enabled in extension settings
2. Navigate to a report with critical alerts
3. Wait for notification to appear

**Expected Result:**
```
✅ Browser notification appears (top-right of screen)
✅ Notification shows:
   - Severity emoji (🔴 for critical)
   - Alert title
   - Alert description
✅ Notification has two buttons:
   - "View in ADOC"
   - "Acknowledge"
✅ Sound plays (if enabled in settings)
```

**Test Actions:**
1. Click "View in ADOC" → Opens ADOC platform in new tab
2. Click "Acknowledge" → Alert marked as acknowledged

---

### Test 8: Page Navigation

**Steps:**
1. Open a PowerBI report
2. Wait for sidebar to load
3. Navigate to a different page in the same report
4. Navigate to a completely different report

**Expected Result:**
```
✅ Sidebar stays open when changing pages
✅ Sidebar content updates when changing reports
✅ No duplicate sidebars created
✅ Console shows: "ADOC Extension: PowerBI page changed"
```

---

### Test 9: Error Handling

#### Test 9a: No Credentials
**Steps:**
1. Clear extension credentials (Options → Clear credentials)
2. Navigate to PowerBI report

**Expected Result:**
```
✅ Sidebar shows error message
✅ Error says: "Not authenticated. Please configure credentials."
✅ Button to open settings
```

#### Test 9b: Invalid Credentials
**Steps:**
1. Enter wrong API keys
2. Navigate to PowerBI report

**Expected Result:**
```
✅ Sidebar shows error message
✅ Error says: "Authentication failed. Please check your API credentials."
✅ Console shows 401 error
```

#### Test 9c: Report Not Found in ADOC
**Steps:**
1. Navigate to a PowerBI report that doesn't exist in ADOC
2. Wait for API call

**Expected Result:**
```
✅ Sidebar shows error message
✅ Error says: "Failed to load report data"
✅ "Retry" button available
```

#### Test 9d: Network Error
**Steps:**
1. Disconnect internet or block ADOC domain
2. Navigate to PowerBI report

**Expected Result:**
```
✅ Sidebar shows error message
✅ Error mentions network/connection issue
✅ "Retry" button available
```

---

### Test 10: Performance

**Steps:**
1. Open DevTools → Performance tab
2. Start recording
3. Navigate to PowerBI report
4. Wait for sidebar to fully load
5. Stop recording

**Expected Result:**
```
✅ Extension loads in < 2 seconds
✅ Sidebar injection in < 500ms
✅ API calls complete in < 1 second
✅ No significant performance impact on PowerBI
✅ No memory leaks (check Memory tab)
```

**Check Console:**
```
✅ No errors
✅ No warnings about deprecated APIs
✅ API request/response logs visible
```

---

### Test 11: Refresh Functionality

**Steps:**
1. Open PowerBI report with sidebar loaded
2. Click "Refresh Data" button in Overview tab

**Expected Result:**
```
✅ Loading spinner appears
✅ API call made to ADOC
✅ Sidebar content updates with fresh data
✅ "Last updated" timestamp changes to "Just now"
✅ Cache is cleared
```

---

### Test 12: Settings Persistence

**Steps:**
1. Configure extension settings
2. Close Chrome completely
3. Reopen Chrome
4. Navigate to PowerBI report

**Expected Result:**
```
✅ Credentials still saved
✅ Settings still saved
✅ No need to re-login
✅ Sidebar works immediately
```

---

## Debugging Tips

### Check Console Logs

Open DevTools Console and look for these messages:

**Successful Load:**
```
ADOC Extension: PowerBI content script loaded
ADOC Extension: Injecting enhanced sidebar into PowerBI
ADOC API Request: https://indiumtech.acceldata.app/catalog-server/api/bi-tools/powerbi/...
Response Status: 200 OK
```

**Common Errors:**
```
❌ "Authentication failed" → Check API keys
❌ "Not Acceptable (406)" → Check API endpoint/headers
❌ "Resource not found (404)" → Report doesn't exist in ADOC
❌ "CORS error" → Backend CORS configuration issue
❌ "Failed to fetch" → Network/connectivity issue
```

### Check Network Tab

Filter by "Fetch/XHR" and look for:
- Requests to `indiumtech.acceldata.app`
- Request headers include `accessKey` and `secretkey`
- Response status codes (200 = success)

### Check Elements Tab

Inspect the sidebar:
```html
<div id="adoc-sidebar" class="adoc-sidebar adoc-sidebar-enhanced adoc-sidebar-open">
  <div class="adoc-sidebar-header">...</div>
  <div class="adoc-tabs">...</div>
  <div id="adoc-sidebar-content" class="adoc-sidebar-content">...</div>
</div>
```

### Check Extension Errors

Go to `chrome://extensions/` and click "Errors" button on ADOC extension to see any background script errors.

---

## Mock Testing (Without ADOC Backend)

If you don't have access to ADOC backend, you can test with mock data:

### Create Mock API Response

1. Open `src/background/background.js`
2. Add mock response in `handleGetPowerBIReport`:

```javascript
// Add this at the start of handleGetPowerBIReport function
if (workspaceId && reportId) {
  // Return mock data for testing
  return {
    reportId: reportId,
    reportName: "Test Sales Dashboard",
    underlyingAssets: [
      {
        tableName: "SALES_FACT",
        reliabilityScore: 94,
        openAlerts: 2,
        columnUsage: ["REVENUE", "DATE", "REGION"],
        columnScores: [
          { columnName: "REVENUE", score: 98, failingRules: 0 },
          { columnName: "DATE", score: 95, failingRules: 0 },
          { columnName: "REGION", score: 89, failingRules: 1 }
        ],
        alerts: [
          {
            id: "alert-1",
            title: "Data Quality Issue",
            description: "Null values detected in REGION column",
            severity: "HIGH",
            createdAt: Date.now() - 3600000,
            link: "https://indiumtech.acceldata.app/alerts/alert-1"
          }
        ]
      },
      {
        tableName: "CUSTOMERS",
        reliabilityScore: 98,
        openAlerts: 0,
        columnUsage: ["CUSTOMER_ID", "NAME"],
        columnScores: [
          { columnName: "CUSTOMER_ID", score: 99, failingRules: 0 },
          { columnName: "NAME", score: 97, failingRules: 0 }
        ],
        alerts: []
      }
    ],
    lastRefreshed: Date.now()
  };
}
```

3. Reload extension
4. Test all features with mock data

---

## Checklist Summary

Use this checklist for comprehensive testing:

### Installation & Setup
- [ ] Extension installed successfully
- [ ] Extension icon appears in toolbar
- [ ] Credentials configured
- [ ] Test connection successful

### PowerBI Detection
- [ ] Works with Groups workspace URLs
- [ ] Works with My Workspace URLs (/myorg/)
- [ ] Works with Apps URLs (/apps/)
- [ ] Console shows context detection

### Sidebar
- [ ] Sidebar appears on right side
- [ ] Sidebar opens automatically
- [ ] Close button works
- [ ] All 4 tabs present

### Tab Content
- [ ] Overview tab shows scores and assets
- [ ] Alerts tab shows alerts with filters
- [ ] Lineage tab shows data flow
- [ ] Columns tab shows column quality

### Features
- [ ] Search works in Overview tab
- [ ] Search works in Columns tab
- [ ] Alert filters work
- [ ] Refresh button works
- [ ] "View in ADOC" buttons work

### Column Badges
- [ ] Badges appear in PowerBI fields
- [ ] Hover tooltips work
- [ ] Badges update with data

### Notifications
- [ ] Browser notifications appear
- [ ] Notification buttons work
- [ ] Sound plays (if enabled)

### Error Handling
- [ ] Shows error for missing credentials
- [ ] Shows error for invalid credentials
- [ ] Shows error for network issues
- [ ] Retry button works

### Performance
- [ ] Loads in < 2 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] PowerBI performance not affected

### Persistence
- [ ] Settings persist after browser restart
- [ ] Credentials persist
- [ ] No need to re-login

---

## Troubleshooting Common Issues

### Issue: Sidebar doesn't appear
**Solutions:**
1. Check console for errors
2. Verify URL matches PowerBI pattern
3. Reload extension in chrome://extensions/
4. Hard refresh page (Cmd+Shift+R)

### Issue: "Authentication failed"
**Solutions:**
1. Verify API keys are correct
2. Check keys have no extra spaces
3. Test connection in settings
4. Check ADOC account is active

### Issue: Column badges don't show
**Solutions:**
1. Wait 10 seconds (badges inject after data loads)
2. Check API response has column data
3. Check console for badge injector errors
4. PowerBI DOM may not have expected selectors (known limitation)

### Issue: Notifications don't appear
**Solutions:**
1. Check browser notification permissions
2. Enable notifications in extension settings
3. Check severity threshold setting
4. Verify alerts exist in API response

---

## Next Steps After Testing

1. **Document Issues**: Note any bugs or unexpected behavior
2. **Check Logs**: Save console logs for debugging
3. **Test Edge Cases**: Try unusual scenarios
4. **Performance Test**: Test with large reports
5. **User Feedback**: Get feedback from actual users

---

**Testing Date**: _______________  
**Tester Name**: _______________  
**PowerBI Version**: _______________  
**Chrome Version**: _______________  
**Extension Version**: 1.0.0  

**Overall Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Work
