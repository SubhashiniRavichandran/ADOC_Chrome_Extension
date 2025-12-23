# Quick Test - PowerBI Extension

## 🚀 5-Minute Quick Test

### Step 1: Load Extension (1 min)
```bash
1. Open: chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: /Users/pshanmugam/Projects/Personal/adoc
5. ✅ Verify ADOC icon appears
```

### Step 2: Configure (1 min)
```bash
1. Click ADOC extension icon
2. Click "Settings"
3. Enter:
   - Server URL: https://indiumtech.acceldata.app
   - Access Key: [your-key]
   - Secret Key: [your-key]
4. Click "Test Connection"
5. Click "Save"
```

### Step 3: Test PowerBI (3 min)
```bash
1. Open any PowerBI report URL
2. Press F12 (DevTools)
3. Check Console for:
   ✅ "ADOC Extension: PowerBI content script loaded"
   ✅ "ADOC Extension: Injecting enhanced sidebar"
4. Look for sidebar on right side
5. Verify 4 tabs: Overview | Alerts | Lineage | Columns
```

---

## ✅ Quick Checklist

### Visual Checks
- [ ] Sidebar appears on right (purple header)
- [ ] 4 tabs visible
- [ ] Overall score displayed
- [ ] Asset list shows tables
- [ ] Close button (X) works

### Console Checks (F12)
- [ ] No red errors
- [ ] "content script loaded" message
- [ ] "Injecting enhanced sidebar" message
- [ ] API request to indiumtech.acceldata.app

### Network Checks (F12 → Network)
- [ ] Request to /catalog-server/api/bi-tools/powerbi/...
- [ ] Status: 200 OK
- [ ] Headers include: accessKey, secretkey

---

## 🐛 Quick Debug

### Sidebar Not Showing?
```bash
1. Check console for errors
2. Verify URL is: https://app.powerbi.com/groups/.../reports/...
3. Reload extension: chrome://extensions/ → Reload
4. Hard refresh page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Authentication Error?
```bash
1. Re-enter credentials in settings
2. Click "Test Connection"
3. Check for typos in API keys
4. Verify ADOC account is active
```

### No Data Showing?
```bash
1. Check Network tab for 404/401 errors
2. Verify report exists in ADOC
3. Click "Refresh Data" button
4. Check console for API response
```

---

## 📊 Test URLs

### PowerBI URL Patterns to Test:

**Groups (Workspace):**
```
https://app.powerbi.com/groups/{workspace-id}/reports/{report-id}
```

**My Workspace:**
```
https://app.powerbi.com/myorg/reports/{report-id}
```

**Apps:**
```
https://app.powerbi.com/apps/{app-id}/reports/{report-id}
```

---

## 🎯 Expected Results

### Sidebar Should Show:
```
┌─────────────────────────────────┐
│ ADOC Data Reliability      [X]  │
├─────────────────────────────────┤
│ Overview | Alerts | Lineage | Columns
├─────────────────────────────────┤
│                                 │
│ Overall Reliability Score       │
│        🟢 94%                   │
│                                 │
│ ⚠ 2 Active Alerts              │
│                                 │
│ 📊 Asset Scores (3)            │
│ ├─ SALES_FACT: 92% 🟡         │
│ ├─ CUSTOMERS: 98% 🟢           │
│ └─ PRODUCTS: 89% 🟡            │
│                                 │
│ [View in ADOC] [Refresh]       │
└─────────────────────────────────┘
```

### Console Should Show:
```javascript
ADOC Extension: PowerBI content script loaded
ADOC Extension: Injecting enhanced sidebar into PowerBI
ADOC API Request: https://indiumtech.acceldata.app/catalog-server/api/bi-tools/powerbi/...
Response Status: 200 OK
```

---

## 🔍 Detailed Testing

For comprehensive testing, see: **POWERBI_TESTING_GUIDE.md**

---

**Quick Test Status**: ⬜ Pass  ⬜ Fail  
**Date**: _______________  
**Tester**: _______________
