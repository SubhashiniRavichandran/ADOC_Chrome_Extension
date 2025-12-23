// Copy this into browser console while on https://indiumtech.acceldata.app
// (after you're logged in)

// Replace with your actual keys
const ACCESS_KEY = 'YOUR_ACCESS_KEY';
const SECRET_KEY = 'YOUR_SECRET_KEY';

// Test different endpoints
const endpoints = [
  '/catalog-server/api/assets/search?query=test',
  '/catalog-server/api/assets?query=test',
  '/catalog-server/api/search?query=test',
  '/catalog-server/api/assets/13471', // Your working asset ID
];

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testing: ${endpoint}`);

  try {
    const response = await fetch(`https://indiumtech.acceldata.app${endpoint}`, {
      method: 'GET',
      headers: {
        'X-ACCESS-KEY': ACCESS_KEY,
        'X-SECRET-KEY': SECRET_KEY,
        'Accept': 'application/json, text/plain, */*'
      }
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success!`);
      console.log(`   Response:`, data);
      return true;
    } else {
      const text = await response.text();
      console.log(`   ❌ Error: ${text}`);
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
  }

  return false;
}

// Run all tests
(async () => {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
})();
