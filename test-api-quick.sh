#!/bin/bash

echo "🧪 Quick API Test - api.acceldata.io"
echo "====================================="
echo ""

read -p "Access Key: " ACCESS_KEY
read -p "Secret Key: " SECRET_KEY

echo ""
echo "Testing: https://api.acceldata.io/api/v1/assets/search?query=test"
echo ""

curl -v "https://api.acceldata.io/api/v1/assets/search?query=test" \
  -H "X-ACCESS-KEY: $ACCESS_KEY" \
  -H "X-SECRET-KEY: $SECRET_KEY" \
  -H "Content-Type: application/json" \
  2>&1 | grep -E "(HTTP|Content-Type|Access-Control|<|{)"

