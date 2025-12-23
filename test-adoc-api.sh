#!/bin/bash

# ADOC API Interactive Tester
# Tests all major endpoints with your credentials

echo "🧪 ADOC API Interactive Tester"
echo "================================"
echo ""

# Get configuration
echo "Enter your ADOC configuration:"
read -p "Server URL (e.g., https://indiumtech.acceldata.io): " ADOC_URL
read -p "Access Key: " ACCESS_KEY
read -p "Secret Key: " SECRET_KEY

# Remove trailing slash from URL if present
ADOC_URL="${ADOC_URL%/}"

echo ""
echo "Configuration:"
echo "  Server: $ADOC_URL"
echo "  Access Key: ${ACCESS_KEY:0:10}..."
echo ""
echo "Starting tests..."
echo "================="
echo ""

# Test 1: Basic connectivity
echo "Test 1: Server Connectivity"
echo "----------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ADOC_URL" --max-time 10 2>&1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "301" ]; then
  echo "✅ Server is reachable (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "000" ]; then
  echo "❌ Cannot reach server - check URL or VPN connection"
  echo "   Make sure you're connected to VPN if required"
  exit 1
else
  echo "⚠️ Server responded with HTTP $HTTP_CODE"
fi

echo ""

# Test 2: API v1 Asset Search
echo "Test 2: API v1 Asset Search (Main Test)"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" "$ADOC_URL/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: $ACCESS_KEY" \
  -H "X-SECRET-KEY: $SECRET_KEY" \
  -H "Content-Type: application/json" \
  --max-time 10 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS! API is working correctly"
  echo ""
  echo "Response preview:"
  echo "$BODY" | head -20
  echo ""
  echo "✅ Your credentials are valid!"
  echo "✅ Extension should work with these settings"

elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ AUTHENTICATION FAILED"
  echo ""
  echo "Response:"
  echo "$BODY"
  echo ""
  echo "Action required:"
  echo "1. Log in to ADOC Admin Central"
  echo "2. Go to API Keys section"
  echo "3. Generate new API keys"
  echo "4. Copy both Access Key and Secret Key"
  echo "5. Try again with new keys"

elif [ "$HTTP_CODE" = "404" ]; then
  echo "❌ ENDPOINT NOT FOUND"
  echo ""
  echo "The /api/v1/assets/search endpoint doesn't exist"
  echo ""
  echo "Trying alternative endpoints..."
  echo ""

  # Try alternative endpoints
  ALT_ENDPOINTS=(
    "/api/v2/assets/search?query=test"
    "/adoc/api/v1/assets/search?query=test"
    "/rest/v1/assets/search?query=test"
    "/assets/search?query=test"
  )

  for endpoint in "${ALT_ENDPOINTS[@]}"; do
    echo "Trying: $endpoint"
    ALT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ADOC_URL$endpoint" \
      -H "X-ACCESS-KEY: $ACCESS_KEY" \
      -H "X-SECRET-KEY: $SECRET_KEY" \
      --max-time 5)

    if [ "$ALT_CODE" = "200" ]; then
      echo "✅ Found working endpoint: $endpoint"
      echo ""
      echo "⚠️ NOTE: You'll need to update the extension code to use:"
      echo "   Base path: $(dirname $endpoint)"
      break
    else
      echo "   HTTP $ALT_CODE"
    fi
  done

  echo ""
  echo "Contact your ADOC admin to confirm correct API endpoints"

elif [ "$HTTP_CODE" = "000" ]; then
  echo "❌ CONNECTION FAILED"
  echo ""
  echo "Cannot connect to API endpoint"
  echo ""
  echo "Possible causes:"
  echo "1. Not connected to VPN"
  echo "2. API endpoints are disabled"
  echo "3. Firewall blocking requests"
  echo "4. Server is down"

else
  echo "❌ UNEXPECTED RESPONSE: HTTP $HTTP_CODE"
  echo ""
  echo "Response:"
  echo "$BODY"
fi

echo ""
echo ""

# Test 3: Alternative authentication methods
if [ "$HTTP_CODE" != "200" ]; then
  echo "Test 3: Trying Alternative Authentication"
  echo "------------------------------------------"

  # Try without Content-Type header
  ALT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ADOC_URL/api/v1/assets/search?query=test" \
    -H "X-ACCESS-KEY: $ACCESS_KEY" \
    -H "X-SECRET-KEY: $SECRET_KEY" \
    --max-time 5)

  echo "Without Content-Type header: HTTP $ALT_CODE"

  if [ "$ALT_CODE" = "200" ]; then
    echo "✅ Works without Content-Type header!"
  fi

  echo ""
fi

# Summary
echo "Summary"
echo "======="
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ All tests passed!"
  echo ""
  echo "Extension configuration:"
  echo "  Server URL: $ADOC_URL"
  echo "  Access Key: $ACCESS_KEY"
  echo "  Secret Key: $SECRET_KEY"
  echo ""
  echo "Next steps:"
  echo "1. Open Chrome extension settings"
  echo "2. Enter the above configuration"
  echo "3. Click 'Test Connection'"
  echo "4. Should work!"
else
  echo "❌ Tests failed"
  echo ""
  echo "Next steps:"
  echo "1. Verify you're connected to VPN (if required)"
  echo "2. Check credentials in ADOC Admin Central"
  echo "3. Contact ADOC admin for:"
  echo "   - Correct API base URL"
  echo "   - API version (v1, v2, etc.)"
  echo "   - Network requirements"
fi

echo ""
