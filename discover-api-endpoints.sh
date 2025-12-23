#!/bin/bash

# ADOC API Endpoint Discovery
# Tests common API path variations to find the correct one

echo "🔍 ADOC API Endpoint Discovery"
echo "================================"
echo ""

# Get credentials
read -p "Server URL (https://indiumtech.acceldata.app): " ADOC_URL
read -p "Access Key: " ACCESS_KEY
read -p "Secret Key: " SECRET_KEY

# Remove trailing slash
ADOC_URL="${ADOC_URL%/}"

echo ""
echo "Testing common API endpoint patterns..."
echo "========================================"
echo ""

# Common API path variations
ENDPOINTS=(
  "/adoc/api/v1/assets/search?query=test"
  "/api/assets/search?query=test"
  "/rest/api/v1/assets/search?query=test"
  "/api/v2/assets/search?query=test"
  "/backend/api/v1/assets/search?query=test"
  "/services/api/v1/assets/search?query=test"
  "/data/api/v1/assets/search?query=test"
)

FOUND=false

for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "Testing: $endpoint ... "

  RESPONSE=$(curl -s -w "\n%{http_code}\n%{content_type}" "$ADOC_URL$endpoint" \
    -H "X-ACCESS-KEY: $ACCESS_KEY" \
    -H "X-SECRET-KEY: $SECRET_KEY" \
    -H "Content-Type: application/json" \
    --max-time 5 2>&1)

  HTTP_CODE=$(echo "$RESPONSE" | tail -n2 | head -n1)
  CONTENT_TYPE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d' | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
      echo "✅ FOUND!"
      echo ""
      echo "Working endpoint: $ADOC_URL$endpoint"
      echo "Content-Type: $CONTENT_TYPE"
      echo ""
      echo "Response preview:"
      echo "$BODY" | head -10
      echo ""
      FOUND=true

      # Extract base path
      BASE_PATH=$(dirname "$endpoint" | sed 's|/assets/search||')
      echo "================================================"
      echo "✅ SUCCESS! Use this in your extension:"
      echo "================================================"
      echo ""
      echo "Base API Path: $BASE_PATH"
      echo "Full Base URL: $ADOC_URL$BASE_PATH"
      echo ""
      break
    else
      echo "❌ Returns HTML (HTTP $HTTP_CODE)"
    fi
  elif [ "$HTTP_CODE" = "401" ]; then
    echo "🔐 Needs auth (HTTP $HTTP_CODE) - endpoint exists!"
  elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Not found"
  else
    echo "⚠️  HTTP $HTTP_CODE"
  fi
done

echo ""

if [ "$FOUND" = false ]; then
  echo "❌ Could not find working API endpoint"
  echo ""
  echo "Next steps:"
  echo "1. Check ADOC documentation for correct API base path"
  echo "2. Contact ADOC admin to confirm API endpoint structure"
  echo "3. Check if API requires different authentication (Bearer token, etc.)"
  echo ""
  echo "Try manually testing in browser DevTools:"
  echo "1. Open $ADOC_URL in browser and log in"
  echo "2. Open DevTools (F12) → Network tab"
  echo "3. Use the application to trigger an API call"
  echo "4. Look at the request URL to see actual API path"
fi
