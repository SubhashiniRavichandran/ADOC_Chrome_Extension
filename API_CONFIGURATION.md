# ADOC API Configuration Guide

## Important: Two Different Domains

ADOC uses **separate domains** for the web application and API:

| Purpose | Domain | Use For |
|---------|--------|---------|
| **Web Application** | `https://indiumtech.acceldata.app` | Login, UI, dashboards |
| **API Backend** | `https://api.acceldata.io` | REST API calls from extension |

## ✅ Correct Configuration

### Extension Settings

Use the **API domain**, not the web app domain:

```
Server URL: https://api.acceldata.io
Access Key: [your-access-key]
Secret Key: [your-secret-key]
```

### How to Get API Keys

1. Go to `https://indiumtech.acceldata.app`
2. Log in with your credentials
3. Navigate to: **Settings** → **API Keys** (or **Admin Central**)
4. Generate new API keys if needed
5. Copy both **Access Key** and **Secret Key**

## ❌ Common Mistakes

### Mistake 1: Using Web App URL
```
❌ Wrong: https://indiumtech.acceldata.app
✅ Correct: https://api.acceldata.io
```

### Mistake 2: Trailing Slash
```
❌ Wrong: https://api.acceldata.io/
✅ Correct: https://api.acceldata.io
```

### Mistake 3: Including API Path
```
❌ Wrong: https://api.acceldata.io/api/v1
✅ Correct: https://api.acceldata.io
```

## 🧪 Testing Your Configuration

### Method 1: Quick Test with cURL

```bash
./test-api-quick.sh
```

Enter your Access Key and Secret Key when prompted.

**Expected Result:**
```
HTTP/2 200
Content-Type: application/json
{ "data": [...], "status": "success" }
```

### Method 2: In Extension

1. Reload extension: `chrome://extensions/` → Click reload 🔄
2. Click ADOC extension icon → **Settings**
3. Enter:
   - Server URL: `https://api.acceldata.io`
   - Access Key: `[your-key]`
   - Secret Key: `[your-key]`
4. Click **"Test Connection"**
5. Check console (Right-click → Inspect → Console)

**Expected Console Output:**
```
ADOC API Request: https://api.acceldata.io/api/v1/assets/search?query=test&assetType=TABLE
Response Status: 200 OK
Response Content-Type: application/json
✅ Connection successful!
```

## 🔍 API Endpoints

All endpoints are relative to `https://api.acceldata.io`:

| Endpoint | Purpose |
|----------|---------|
| `/api/v1/assets/search` | Search for assets |
| `/api/v1/assets/{id}` | Get asset details |
| `/api/v1/assets/{id}/reliability` | Get reliability score |
| `/api/v1/alerts` | Get active alerts |
| `/api/v1/assets/{id}/lineage` | Get data lineage |

## 🔐 Authentication

All requests must include these headers:

```
X-ACCESS-KEY: [your-access-key]
X-SECRET-KEY: [your-secret-key]
Content-Type: application/json
```

## 🚨 Troubleshooting

### Error: "Unexpected token '<', '<!doctype'..."
**Cause**: Using web app URL instead of API URL
**Fix**: Change to `https://api.acceldata.io`

### Error: "CORS policy blocked"
**Cause**: ADOC server not allowing Chrome extension origin
**Fix**: Contact ADOC admin to add CORS headers (see CORS_FIX.md)

### Error: "Authentication failed"
**Cause**: Invalid or expired API keys
**Fix**: Generate new keys in ADOC Admin Central

### Error: "Failed to fetch"
**Cause**: Network issue, VPN not connected, or incorrect domain
**Fix**:
1. Verify VPN connection if required
2. Test with cURL: `./test-api-quick.sh`
3. Confirm domain is `api.acceldata.io`

## 📚 More Information

- **Postman Collection**: https://api.acceldata.io/
- **API Documentation**: https://docs.acceldata.io/sdk/sdk-apis
- **CORS Fix Guide**: See `CORS_FIX.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`

## 🎯 Quick Summary

**Use this in extension settings:**
```
https://api.acceldata.io
```

**NOT these:**
- ❌ `https://indiumtech.acceldata.app` (web app, not API)
- ❌ `https://adoc.acceldata.io` (old default)
- ❌ `https://api.acceldata.io/` (trailing slash)
