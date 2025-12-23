# ✅ Correct ADOC API Configuration

## The Working Configuration

Based on your working API endpoint, here's the correct setup:

### API Structure

```
Base URL: https://indiumtech.acceldata.app
API Path: /catalog-server/api
Endpoints: /assets/{id}/...
```

**Example working URL:**
```
https://indiumtech.acceldata.app/catalog-server/api/assets/13471/sample/async
```

## ✅ Extension Configuration

### Settings Page

Enter this in the extension settings:

```
Server URL: https://indiumtech.acceldata.app
Access Key: [your-access-key]
Secret Key: [your-secret-key]
```

**Important**:
- ✅ Use `https://indiumtech.acceldata.app` (NO trailing slash)
- ✅ Do NOT include `/catalog-server/api` - that's handled internally
- ✅ The extension now automatically uses `/catalog-server/api` as the base path

## 📡 API Endpoints

All endpoints are now relative to `/catalog-server/api`:

| Method | Endpoint | Full URL Example |
|--------|----------|------------------|
| Search Assets | `/assets/search?query=...` | `https://indiumtech.acceldata.app/catalog-server/api/assets/search?query=test` |
| Get Asset | `/assets/{id}` | `https://indiumtech.acceldata.app/catalog-server/api/assets/13471` |
| Get Reliability | `/assets/{id}/reliability` | `https://indiumtech.acceldata.app/catalog-server/api/assets/13471/reliability` |
| Get Alerts | `/alerts?assetIds=...` | `https://indiumtech.acceldata.app/catalog-server/api/alerts?assetIds=123,456` |
| Get Lineage | `/assets/{id}/lineage` | `https://indiumtech.acceldata.app/catalog-server/api/assets/13471/lineage` |
| Get Sample Data | `/assets/{id}/sample/async` | `https://indiumtech.acceldata.app/catalog-server/api/assets/13471/sample/async` |

## 🔧 What Changed in the Code

### adoc-client.js

**Before (Wrong):**
```javascript
constructor(baseUrl, accessKey, secretKey) {
  this.baseUrl = baseUrl || 'https://adoc.acceldata.io';
  // ...
}

async searchAssets(query) {
  return this.makeRequest(`/api/v1/assets/search?query=${query}`);
  // Would create: https://adoc.acceldata.io/api/v1/assets/search
}
```

**After (Correct):**
```javascript
constructor(baseUrl, accessKey, secretKey) {
  this.baseUrl = baseUrl || 'https://indiumtech.acceldata.app';
  this.apiBasePath = '/catalog-server/api';
  // ...
}

async makeRequest(endpoint) {
  const url = `${this.baseUrl}${this.apiBasePath}${endpoint}`;
  // Creates: https://indiumtech.acceldata.app/catalog-server/api/assets/search
}

async searchAssets(query) {
  return this.makeRequest(`/assets/search?query=${query}`);
}
```

## 🧪 Testing

### Step 1: Reload Extension
```
1. Go to chrome://extensions/
2. Find "ADOC Data Reliability for BI Tools"
3. Click reload 🔄
```

### Step 2: Configure Settings
```
1. Click ADOC extension icon
2. Go to Settings
3. Enter:
   Server URL: https://indiumtech.acceldata.app
   Access Key: [your-key]
   Secret Key: [your-key]
4. Click "Test Connection"
```

### Step 3: Check Console
```
Right-click → Inspect → Console

Expected output:
✅ ADOC API Request: https://indiumtech.acceldata.app/catalog-server/api/assets/search?query=test&assetType=TABLE
✅ Response Status: 200 OK
✅ Response Content-Type: application/json
✅ Connection successful!
```

## 🎯 Summary

| Item | Value |
|------|-------|
| **Server URL** | `https://indiumtech.acceldata.app` |
| **API Base Path** | `/catalog-server/api` (automatic) |
| **Authentication** | `X-ACCESS-KEY` & `X-SECRET-KEY` headers |
| **Format** | JSON |

**The extension is now configured to use the correct API endpoints!**

## 🚨 Common Mistakes

❌ **Wrong**: `https://api.acceldata.io`
✅ **Correct**: `https://indiumtech.acceldata.app`

❌ **Wrong**: `https://indiumtech.acceldata.app/catalog-server/api`
✅ **Correct**: `https://indiumtech.acceldata.app`

❌ **Wrong**: Trailing slash `https://indiumtech.acceldata.app/`
✅ **Correct**: No trailing slash `https://indiumtech.acceldata.app`

## 📚 Next Steps

1. **Reload the extension** to get the updated code
2. **Test the connection** in settings
3. **Try it on PowerBI** - open a PowerBI report and the sidebar should appear
4. **Check for data** - you should see reliability scores and alerts

If you see "Connection successful!" ✅ - you're all set!
