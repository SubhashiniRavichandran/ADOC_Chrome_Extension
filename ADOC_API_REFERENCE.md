# ADOC API Reference - Actual Endpoints

## Base Configuration

**Base URL Format:**
```
https://{your-instance}.acceldata.io
```

**Examples:**
- `https://adoc.acceldata.io` (Production/Demo)
- `https://indiumtech.acceldata.io` (Your instance)
- `https://{company}.acceldata.io` (Custom instance)

---

## Authentication

**Method:** API Key-based Authentication

**Headers Required:**
```http
X-ACCESS-KEY: {your_access_key}
X-SECRET-KEY: {your_secret_key}
Content-Type: application/json
```

**How to Get API Keys:**
1. Log in to ADOC web interface
2. Navigate to: **Admin Central → API Keys**
3. Click **"Generate New Key"**
4. Copy both keys immediately (secret key shown only once)

---

## Core API Endpoints

### 1. Asset Search API (Test Connection)

**Purpose:** Search for assets, also used to test connection

**Endpoint:**
```http
GET /api/v1/assets/search
```

**Parameters:**
- `query` (string, required) - Search term
- `assetType` (string, optional) - TABLE, COLUMN, DASHBOARD, etc.
- `dataSourceType` (string, optional) - SNOWFLAKE, BIGQUERY, etc.

**Full URL Example:**
```
https://indiumtech.acceldata.io/api/v1/assets/search?query=test
```

**cURL Example:**
```bash
curl -X GET "https://indiumtech.acceldata.io/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: your-access-key" \
  -H "X-SECRET-KEY: your-secret-key" \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "assets": [
    {
      "id": "asset-uuid-12345",
      "name": "USERS_TABLE",
      "fullyQualifiedName": "PROD_DB.PUBLIC.USERS_TABLE",
      "assetType": "TABLE",
      "dataSource": {
        "id": "datasource-uuid-67890",
        "name": "Snowflake Production",
        "type": "SNOWFLAKE"
      },
      "reliabilityScore": 95.5,
      "lastUpdated": "2025-01-18T10:30:00Z"
    }
  ]
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid API credentials"
}
```

---

### 2. Get Reliability Score

**Endpoint:**
```http
GET /api/v1/assets/{assetId}/reliability
```

**Full URL Example:**
```
https://indiumtech.acceldata.io/api/v1/assets/asset-uuid-12345/reliability
```

**cURL Example:**
```bash
curl -X GET "https://indiumtech.acceldata.io/api/v1/assets/asset-uuid-12345/reliability" \
  -H "X-ACCESS-KEY: your-access-key" \
  -H "X-SECRET-KEY: your-secret-key" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "assetId": "asset-uuid-12345",
  "overallScore": 95.5,
  "scoreBreakdown": {
    "accuracy": 98.0,
    "completeness": 95.0,
    "consistency": 94.0,
    "timeliness": 96.0,
    "uniqueness": 97.0,
    "validity": 94.5
  },
  "columnScores": [
    {
      "columnName": "USER_ID",
      "score": 99.0,
      "failingRules": 0
    },
    {
      "columnName": "EMAIL",
      "score": 92.0,
      "failingRules": 2
    }
  ],
  "lastEvaluated": "2025-01-18T10:30:00Z"
}
```

---

### 3. Get Alerts

**Endpoint:**
```http
GET /api/v1/alerts
```

**Parameters:**
- `assetIds` (comma-separated) - Asset IDs to get alerts for
- `status` (optional) - OPEN, ACKNOWLEDGED, CLOSED (default: OPEN)
- `severity` (optional) - CRITICAL, HIGH, MEDIUM, LOW

**Full URL Example:**
```
https://indiumtech.acceldata.io/api/v1/alerts?assetIds=asset-uuid-1,asset-uuid-2&status=OPEN
```

**cURL Example:**
```bash
curl -X GET "https://indiumtech.acceldata.io/api/v1/alerts?assetIds=asset-uuid-12345&status=OPEN" \
  -H "X-ACCESS-KEY: your-access-key" \
  -H "X-SECRET-KEY: your-secret-key" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "alerts": [
    {
      "id": "alert-uuid-abc123",
      "title": "Data Quality Threshold Breached",
      "description": "Email column has 15% null values exceeding threshold of 5%",
      "severity": "HIGH",
      "status": "OPEN",
      "affectedAssets": [
        {
          "assetId": "asset-uuid-12345",
          "assetName": "USERS_TABLE",
          "columns": ["EMAIL"]
        }
      ],
      "createdAt": "2025-01-18T09:15:00Z",
      "link": "https://indiumtech.acceldata.io/alerts/alert-uuid-abc123"
    }
  ]
}
```

---

### 4. Get Lineage

**Endpoint:**
```http
GET /api/v1/assets/{assetId}/lineage
```

**Parameters:**
- `direction` (optional) - UPSTREAM, DOWNSTREAM, BOTH (default: BOTH)
- `depth` (optional) - Number of levels (default: 2, max: 5)

**Full URL Example:**
```
https://indiumtech.acceldata.io/api/v1/assets/asset-uuid-12345/lineage?direction=BOTH&depth=2
```

**cURL Example:**
```bash
curl -X GET "https://indiumtech.acceldata.io/api/v1/assets/asset-uuid-12345/lineage?direction=BOTH&depth=2" \
  -H "X-ACCESS-KEY: your-access-key" \
  -H "X-SECRET-KEY: your-secret-key" \
  -H "Content-Type: application/json"
```

---

### 5. PowerBI Specific API

**Endpoint:**
```http
GET /api/v1/bi-tools/powerbi/workspaces/{workspaceId}/reports/{reportId}
```

**Full URL Example:**
```
https://indiumtech.acceldata.io/api/v1/bi-tools/powerbi/workspaces/12345678-1234-1234-1234-123456789abc/reports/87654321-4321-4321-4321-cba987654321
```

**cURL Example:**
```bash
curl -X GET "https://indiumtech.acceldata.io/api/v1/bi-tools/powerbi/workspaces/WORKSPACE_ID/reports/REPORT_ID" \
  -H "X-ACCESS-KEY: your-access-key" \
  -H "X-SECRET-KEY: your-secret-key" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "reportId": "87654321-4321-4321-4321-cba987654321",
  "reportName": "Sales Dashboard",
  "workspaceName": "Analytics",
  "datasetId": "dataset-uuid-555",
  "underlyingAssets": [
    {
      "adocAssetId": "asset-uuid-12345",
      "tableName": "SALES_FACT",
      "columnUsage": ["REVENUE", "DATE", "REGION"],
      "reliabilityScore": 94.5,
      "openAlerts": 1
    }
  ],
  "lastRefreshed": "2025-01-18T08:00:00Z"
}
```

---

## Testing APIs - Step by Step

### Test 1: Basic Connection Test

**Simplest test - just see if you can reach the API:**

```bash
curl -v "https://indiumtech.acceldata.io/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: YOUR_ACCESS_KEY" \
  -H "X-SECRET-KEY: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```

**What to look for:**
- `< HTTP/2 200` = Success ✅
- `< HTTP/2 401` = Wrong credentials ❌
- `< HTTP/2 404` = Wrong URL or endpoint doesn't exist ❌
- `curl: (6) Could not resolve host` = Can't reach server ❌

---

### Test 2: Check Asset Search

```bash
# Search for a specific table
curl "https://indiumtech.acceldata.io/api/v1/assets/search?query=USERS&assetType=TABLE" \
  -H "X-ACCESS-KEY: YOUR_ACCESS_KEY" \
  -H "X-SECRET-KEY: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```

---

### Test 3: Get Specific Asset Details

**First, get an asset ID from the search above, then:**

```bash
# Replace with actual asset ID from search results
curl "https://indiumtech.acceldata.io/api/v1/assets/ACTUAL_ASSET_ID/reliability" \
  -H "X-ACCESS-KEY: YOUR_ACCESS_KEY" \
  -H "X-SECRET-KEY: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```

---

## Common Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | API working correctly |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Check API credentials |
| 403 | Forbidden | API key lacks permissions |
| 404 | Not Found | Check URL or asset doesn't exist |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | ADOC issue, contact admin |

---

## Rate Limiting

**Default Limits:**
- 100 requests per minute per API key

**Headers in Response:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642511400
```

**When rate limited (429):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait and try again.",
  "retryAfter": 60
}
```

---

## Alternative Endpoints (If Above Don't Work)

Some ADOC versions might use different endpoint structures:

### Alternative 1: V2 APIs
```
/api/v2/assets/search
/api/v2/assets/{id}/reliability
```

### Alternative 2: Different Path
```
/adoc/api/v1/assets/search
/rest/v1/assets/search
```

### Alternative 3: Legacy Format
```
/api/assets/search
/api/reliability/{assetId}
```

**If none work, ask your ADOC admin for:**
- API documentation URL
- Correct endpoint paths
- API version being used

---

## Troubleshooting API Calls

### If you get "404 Not Found":

**Try these alternatives:**
```bash
# Alternative 1: Without /api/v1
curl "https://indiumtech.acceldata.io/assets/search?query=test" \
  -H "X-ACCESS-KEY: key" -H "X-SECRET-KEY: secret"

# Alternative 2: With /adoc prefix
curl "https://indiumtech.acceldata.io/adoc/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: key" -H "X-SECRET-KEY: secret"

# Alternative 3: V2 API
curl "https://indiumtech.acceldata.io/api/v2/assets/search?query=test" \
  -H "X-ACCESS-KEY: key" -H "X-SECRET-KEY: secret"
```

### If you get CORS errors in browser:

This is expected for direct browser requests. The extension handles CORS properly.

### If you get SSL certificate errors:

```bash
# For testing only - NOT for production
curl -k "https://indiumtech.acceldata.io/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: key" -H "X-SECRET-KEY: secret"
```

---

## Quick Test Script

Save this as `test-adoc.sh`:

```bash
#!/bin/bash

# Configuration
ADOC_URL="https://indiumtech.acceldata.io"
ACCESS_KEY="your-access-key"
SECRET_KEY="your-secret-key"

echo "Testing ADOC API at: $ADOC_URL"
echo "================================"
echo ""

# Test 1: Search endpoint
echo "Test 1: Asset Search"
curl -s "$ADOC_URL/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: $ACCESS_KEY" \
  -H "X-SECRET-KEY: $SECRET_KEY" \
  -H "Content-Type: application/json" | head -20

echo ""
echo ""

# Test 2: Check response code
echo "Test 2: Response Code Check"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ADOC_URL/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: $ACCESS_KEY" \
  -H "X-SECRET-KEY: $SECRET_KEY")

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API is working!"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ Authentication failed - check credentials"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "❌ Endpoint not found - check URL or API version"
else
  echo "⚠️ Unexpected response: $HTTP_CODE"
fi
```

---

## Contact Your ADOC Admin

If APIs still don't work, ask your admin:

1. **What is the exact API base URL?**
   - Is it `/api/v1/` or something else?

2. **What authentication method is used?**
   - API Keys (X-ACCESS-KEY, X-SECRET-KEY)?
   - OAuth tokens?
   - Basic auth?

3. **Can you provide API documentation?**
   - Swagger/OpenAPI docs
   - Internal API reference

4. **Are there any network restrictions?**
   - VPN required?
   - IP whitelisting?
   - Proxy configuration?

5. **What ADOC version is installed?**
   - Different versions may have different endpoints
