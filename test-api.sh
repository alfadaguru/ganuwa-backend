#!/bin/bash

# Start the server
cd "/Users/aliyumohammedlawal/Documents/Projects - New/kanostate.gov.ng/source code/ganuwa-backend"
PORT=5001 node src/server.js > /tmp/ganuwa-test.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 12

echo "========================================="
echo "Testing Ganuwa Backend API"
echo "========================================="

# Test 1: Health Check
echo -e "\n[TEST 1] Health Check Endpoint"
curl -s http://localhost:5001/api/v1/health | python3 -m json.tool

# Test 2: API Info
echo -e "\n[TEST 2] API Info Endpoint"
curl -s http://localhost:5001/api/v1 | python3 -m json.tool | head -20

# Test 3: Login with default admin
echo -e "\n[TEST 3] Admin Login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kanostate.gov.ng","password":"Admin@2025!ChangeMe"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo -e "\n✅ Login successful! Token received."

  # Test 4: Get current user profile
  echo -e "\n[TEST 4] Get Current User Profile (Protected Route)"
  curl -s http://localhost:5001/api/v1/auth/me \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

  # Test 5: Get all news (should be empty)
  echo -e "\n[TEST 5] Get All News (Public Route)"
  curl -s "http://localhost:5001/api/v1/news?limit=5" | python3 -m json.tool

  # Test 6: Create a news article
  echo -e "\n[TEST 6] Create News Article (Protected Route)"
  curl -s -X POST http://localhost:5001/api/v1/news \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": {"en": "Test News Article", "ha": "Labarin Gwaji"},
      "content": {"en": "This is a test news article content.", "ha": "Wannan shine abun ciki na labarin gwaji."},
      "category": "government",
      "status": "published",
      "featured": true
    }' | python3 -m json.tool

  # Test 7: Get news again (should have 1 item)
  echo -e "\n[TEST 7] Get News After Creation"
  curl -s "http://localhost:5001/api/v1/news?limit=5" | python3 -m json.tool

else
  echo "❌ Login failed! Cannot proceed with authenticated tests."
fi

# Show server logs
echo -e "\n========================================="
echo "Server Logs:"
echo "========================================="
cat /tmp/ganuwa-test.log

# Stop the server
echo -e "\n========================================="
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
sleep 2
echo "✅ Tests completed!"