# ADOC Extension - Troubleshooting Guide

## "Test Connection Failed" Error

### Quick Diagnosis Steps

#### 1. Check ADOC Server URL Format

**Correct formats:**
```
✅ https://adoc.acceldata.io
✅ https://your-company.acceldata.io
✅ https://adoc.yourcompany.com

❌ http://adoc.acceldata.io (no HTTP, must be HTTPS)
❌ https://adoc.acceldata.io/ (no trailing slash)
❌ adoc.acceldata.io (missing https://)
```

#### 2. Verify API Credentials

**Where to get them:**
1. Log in to your ADOC instance
2. Navigate to: **Admin Central → API Keys**
3. Click "Generate New Key" if you don't have one
4. Copy both:
   - **Access Key** (public identifier)
   - **Secret Key** (private token)

**Common mistakes:**
- Swapping Access Key and Secret Key
- Copying with extra spaces
- Using expired keys
- Using keys from wrong environment

#### 3. Check Browser Console for Details

1. Right-click on the extension popup
2. Select "Inspect"
3. Go to "Console" tab
4. Look for error messages (they'll show the actual problem)
5. Copy any error messages you see

---

## Common Error Messages & Solutions

### Error: "Failed to fetch"

**Cause:** Network issue or CORS problem

**Solutions:**
1. Check your internet connection
2. Verify ADOC server is accessible:
   - Open `https://your-adoc-instance.com` in browser
   - Should load without errors
3. Check if you're behind a corporate proxy/VPN
4. Try from a different network

### Error: "Authentication failed"

**Cause:** Invalid credentials

**Solutions:**
1. Regenerate API keys in ADOC Admin Central
2. Double-check you copied the full key (no truncation)
3. Verify keys are for the correct ADOC instance
4. Check if keys have proper permissions

### Error: "CORS policy blocked"

**Cause:** ADOC server not allowing extension requests

**Solutions:**
1. Contact ADOC admin to whitelist Chrome extension requests
2. Check if ADOC instance has CORS enabled
3. Verify host_permissions in manifest.json includes your domain

### Error: "404 Not Found"

**Cause:** API endpoint doesn't exist

**Solutions:**
1. Verify ADOC instance URL is correct
2. Check ADOC version (extension requires specific API version)
3. Verify `/api/v1/` endpoints are available

---

## Debug Mode - Get Detailed Information

### Option 1: Check Background Service Worker

1. Go to `chrome://extensions/`
2. Find "ADOC Data Reliability for BI Tools"
3. Click "Details"
4. Look for "Inspect views: service worker"
5. Click "service worker"
6. DevTools will open
7. Go to Console tab
8. Try test connection again
9. Look for error messages

### Option 2: Check Network Requests

1. Open extension popup
2. Right-click → Inspect
3. Go to "Network" tab
4. Click "Test Connection"
5. Look at the failed request:
   - Request URL (should match your ADOC instance)
   - Status Code (tells you what went wrong)
   - Response (shows error details)

---

## Detailed Diagnostics

### Test ADOC API Manually

Try this in your terminal to test if ADOC API is accessible:

```bash
# Replace with your actual credentials
ADOC_URL="https://adoc.acceldata.io"
ACCESS_KEY="your-access-key"
SECRET_KEY="your-secret-key"

# Test connection
curl -X GET "$ADOC_URL/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: $ACCESS_KEY" \
  -H "X-SECRET-KEY: $SECRET_KEY" \
  -H "Content-Type: application/json"
```

**Expected responses:**

✅ **Success (200):**
```json
{
  "assets": [...]
}
```

❌ **Auth Failed (401):**
```json
{
  "error": "Invalid credentials"
}
```

❌ **Not Found (404):**
```
<!DOCTYPE html>...
(HTML error page)
```

### Common Issues by Response

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 200 | Success | Extension should work - check console for other errors |
| 401 | Unauthorized | Invalid API credentials |
| 403 | Forbidden | API key lacks permissions |
| 404 | Not Found | Wrong URL or API endpoint doesn't exist |
| 500 | Server Error | ADOC instance issue - contact admin |
| CORS | Cross-Origin | ADOC needs to allow extension domain |

---

## Step-by-Step Connection Test

### 1. Verify Settings Format

Open extension settings and check:

```
Server URL: https://adoc.acceldata.io
           ↑                        ↑
      Must have https://     No trailing /

Access Key: abc123def456...
           ↑
      Usually alphanumeric, no special chars

Secret Key: xyz789uvw012...
           ↑
      Longer, may have special chars
```

### 2. Test in Stages

**Stage 1: Can you access ADOC web UI?**
- Open `https://your-adoc-instance.com` in browser
- Can you log in? ✅ → Continue
- Can't access? ❌ → Check URL, network, VPN

**Stage 2: Are API keys valid?**
- Log in to ADOC
- Go to Admin Central → API Keys
- See your key listed? ✅ → Continue
- No keys or expired? ❌ → Generate new key

**Stage 3: Test API directly**
- Use curl command above
- Gets 200 response? ✅ → API works
- Gets error? ❌ → Check credentials

**Stage 4: Test extension**
- If API works but extension doesn't → Console error
- Check browser DevTools for details

---

## Environment-Specific Issues

### Corporate Network / VPN

**Symptoms:**
- Works at home, fails at office
- Timeout errors
- Connection refused

**Solutions:**
1. Check if ADOC is accessible from corporate network
2. Verify proxy settings
3. Check firewall rules
4. Use VPN if ADOC is external

### Self-Hosted ADOC

**Additional checks:**
1. Verify SSL certificate is valid
2. Check if API endpoints are enabled
3. Confirm CORS headers are set
4. Verify network access from your machine

---

## Still Not Working?

### Collect This Information:

1. **ADOC Server URL** (sanitized, e.g., `https://company.acceldata.io`)
2. **Error message from Console**
3. **Network request details:**
   - Request URL
   - Status code
   - Response body
4. **ADOC version** (if known)
5. **Network environment** (corporate, home, VPN, etc.)

### Where to Get Help:

**Option 1: Check Extension Console**
```bash
# See detailed error logs
chrome://extensions/ → Details → Inspect service worker
```

**Option 2: Contact Support**
- Email: support@acceldata.io
- Provide information collected above
- Include extension version (1.0.0)

**Option 3: Check ADOC Documentation**
- API documentation
- Authentication guide
- CORS configuration

---

## Quick Fixes Checklist

Try these in order:

- [ ] Remove trailing slash from URL
- [ ] Verify HTTPS (not HTTP)
- [ ] Regenerate API keys
- [ ] Copy keys again (avoid extra spaces)
- [ ] Test ADOC in browser (verify it loads)
- [ ] Check browser console for errors
- [ ] Try from different network
- [ ] Disable VPN temporarily
- [ ] Clear extension cache (remove and reload)
- [ ] Check ADOC server status

---

## Success Indicators

When connection works, you should see:

✅ **In Extension Popup:**
```
Connection Status: Connected ●
```

✅ **After Test Connection:**
```
"Connection successful!" (green message)
```

✅ **In Console:**
```
No errors
ADOC API response: 200 OK
```

---

## Advanced Debugging

### Enable Verbose Logging

Temporarily modify `src/background/background.js`:

```javascript
// Add at the top of background.js
const DEBUG = true;

// Before each API call, add:
if (DEBUG) console.log('Making request to:', url, 'with headers:', headers);
```

Then reload extension and check console for detailed logs.

### Test Specific Endpoints

In console, test individual endpoints:

```javascript
// Test in browser console after loading extension
chrome.runtime.sendMessage({
  type: 'TEST_CONNECTION',
  payload: {}
}, response => {
  console.log('Connection test result:', response);
});
```

---

## Prevention

### Before Deploying to Users:

1. Test with multiple ADOC instances
2. Verify API key permissions
3. Test from different networks
4. Document required ADOC version
5. Create troubleshooting guide for users
6. Set up monitoring/logging

### For Users:

1. Provide clear API key generation guide
2. List supported ADOC versions
3. Include network requirements
4. Provide test credentials for sandbox (if available)

