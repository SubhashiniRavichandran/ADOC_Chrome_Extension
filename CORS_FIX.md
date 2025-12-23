# CORS Error Fix for ADOC Extension

## The Problem

You're seeing this error:
```
Access to fetch at 'https://indiumtech.acceldata.app//api/v1/assets/search...'
has been blocked by CORS policy
```

**UPDATE**: The issue was that `indiumtech.acceldata.app` is the **frontend web app**, not the API.

The correct API domain is: **`https://api.acceldata.io`**

This happens because the ADOC server doesn't allow requests from Chrome extensions.

## Fixed Issues

### ✅ 1. Double Slash Fixed
- **Before**: `https://indiumtech.acceldata.app//api/v1/`
- **After**: `https://indiumtech.acceldata.app/api/v1/`

The extension now automatically removes trailing slashes from your URL.

### ✅ 2. Added `.acceldata.app` Domain Support
Updated `manifest.json` to include `*://*.acceldata.app/*` in host permissions.

## The CORS Issue (Requires Server-Side Fix)

### Why CORS Happens

Chrome extensions make cross-origin requests, which triggers CORS security checks. The ADOC server must explicitly allow these requests.

### Solution Options

#### **Option 1: Contact ADOC Admin (Recommended)**

Ask your ADOC admin to configure the server to allow Chrome extension requests:

**What they need to add to ADOC server configuration:**

```
Access-Control-Allow-Origin: chrome-extension://cjaihiggbecjcjjkomeckoddmjkbgija
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: X-ACCESS-KEY, X-SECRET-KEY, Content-Type
Access-Control-Allow-Credentials: true
```

Or to allow all Chrome extensions:
```
Access-Control-Allow-Origin: chrome-extension://*
```

#### **Option 2: Use a Proxy Server (Workaround)**

If ADOC admin can't change server settings immediately, you can set up a simple proxy:

**Proxy Server (Node.js example):**

```javascript
// cors-proxy.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors()); // Allow all origins

app.all('/proxy/*', async (req, res) => {
  const targetUrl = req.params[0];
  const adocUrl = `https://indiumtech.acceldata.app/${targetUrl}`;

  try {
    const response = await fetch(adocUrl, {
      method: req.method,
      headers: {
        'X-ACCESS-KEY': req.headers['x-access-key'],
        'X-SECRET-KEY': req.headers['x-secret-key'],
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));
```

Then use: `http://localhost:3000/proxy/api/v1/assets/search?query=test`

#### **Option 3: Verify Chrome Extension Permissions**

The extension already has the proper permissions, but let's verify:

1. Go to `chrome://extensions/`
2. Find "ADOC Data Reliability for BI Tools"
3. Click "Details"
4. Check "Site access" shows:
   - `https://indiumtech.acceldata.app/*`

If not listed, reload the extension:
1. Click "Remove"
2. Click "Load unpacked" again
3. Select the folder

---

## Quick Fix - Reload Extension

Since we just fixed the code:

### Step 1: Reload Extension

```bash
# In Chrome:
1. Go to chrome://extensions/
2. Find "ADOC Data Reliability for BI Tools"
3. Click the reload icon (circular arrow)
```

### Step 2: Re-configure Settings

1. Click ADOC extension icon
2. Go to Settings
3. Enter **exactly** (no trailing slash):
   ```
   Server URL: https://indiumtech.acceldata.app
   Access Key: your-access-key
   Secret Key: your-secret-key
   ```
4. Click "Test Connection"

### Step 3: Check Console Again

1. Right-click on settings page
2. Inspect → Console
3. Click "Test Connection"
4. Look for the error

---

## Expected Outcomes

### ✅ If CORS is Fixed on Server

You'll see:
```
HTTP 200 OK
Connection successful!
```

### ❌ If CORS Still Blocked

You'll still see:
```
CORS policy blocked
```

**Action**: Contact ADOC admin with the information above.

### 🔧 Alternative: Test with cURL

To verify the API works (bypassing CORS):

```bash
curl -X GET "https://indiumtech.acceldata.app/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: your-access-key" \
  -H "X-SECRET-KEY: your-secret-key" \
  -H "Content-Type: application/json"
```

If cURL works but extension doesn't → It's definitely a CORS issue.

---

## Technical Details

### Why Chrome Extensions Trigger CORS

1. Extensions run in isolated contexts
2. Fetch API from service workers triggers preflight OPTIONS requests
3. Servers must respond with CORS headers to allow these requests

### What's in the Preflight Request

```http
OPTIONS /api/v1/assets/search HTTP/1.1
Origin: chrome-extension://cjaihiggbecjcjjkomeckoddmjkbgija
Access-Control-Request-Method: GET
Access-Control-Request-Headers: x-access-key, x-secret-key, content-type
```

### What Server Must Respond With

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: chrome-extension://cjaihiggbecjcjjkomeckoddmjkbgija
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: X-ACCESS-KEY, X-SECRET-KEY, Content-Type
Access-Control-Max-Age: 86400
```

---

## Email Template for ADOC Admin

**Subject**: Chrome Extension CORS Configuration Request

```
Hi [ADOC Admin],

I'm using the ADOC Chrome Extension to view data reliability information
directly in PowerBI. The extension needs CORS headers configured on the
ADOC server to function properly.

Current error:
"Access-Control-Allow-Origin header is present on the requested resource"

Server: https://indiumtech.acceldata.app
Extension Origin: chrome-extension://[ID]

Required CORS headers:
- Access-Control-Allow-Origin: chrome-extension://*
- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
- Access-Control-Allow-Headers: X-ACCESS-KEY, X-SECRET-KEY, Content-Type
- Access-Control-Allow-Credentials: true

Or allow all origins for testing:
- Access-Control-Allow-Origin: *

Can you please add these headers to the ADOC API responses?

Thank you!
```

---

## Immediate Next Steps

1. **Reload extension** in Chrome (to get the fixes)
2. **Re-enter settings** without trailing slash
3. **Test connection**
4. **If still CORS error** → Contact ADOC admin with template above
5. **If different error** → Let me know what it says!

---

## Summary

- ✅ Fixed double slash issue in code
- ✅ Added `.acceldata.app` domain support
- ⏳ CORS issue requires server-side configuration
- 📧 Contact ADOC admin to enable CORS

**The extension code is correct - this is a server configuration issue.**
