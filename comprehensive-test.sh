#!/bin/bash

# Comprehensive API Test for Ganuwa Backend
# Tests all major endpoints and functionality

cd "/Users/aliyumohammedlawal/Documents/Projects - New/kanostate.gov.ng/source code/ganuwa-backend"
PORT=5002 node src/server.js > /tmp/ganuwa-comprehensive.log 2>&1 &
SERVER_PID=$!

echo "🚀 Starting Ganuwa Backend Comprehensive Test..."
sleep 12

echo "==========================================="
echo "  GANUWA BACKEND COMPREHENSIVE TEST"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local headers=$4
  local data=$5
  local expected_code=$6

  echo -e "\n${YELLOW}Testing:${NC} $name"

  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$url" $headers -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$url" $headers)
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC} (Expected $expected_code, got $http_code)"
    ((FAILED++))
  fi
}

# ===========================================
# 1. AUTHENTICATION TESTS
# ===========================================
echo -e "\n\n${YELLOW}=== AUTHENTICATION ENDPOINTS ===${NC}"

test_endpoint "Health Check" "GET" "http://localhost:5002/api/v1/health" "" "" "200"
test_endpoint "API Info" "GET" "http://localhost:5002/api/v1" "" "" "200"

# Login
echo -e "\n${YELLOW}Logging in as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kanostate.gov.ng","password":"Admin@2025!ChangeMe"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful!${NC}"
  ((PASSED++))

  AUTH_HEADER="-H 'Authorization: Bearer $TOKEN'"

  test_endpoint "Get Current User" "GET" "http://localhost:5002/api/v1/auth/me" "$AUTH_HEADER" "" "200"
else
  echo -e "${RED}❌ Login failed!${NC}"
  ((FAILED++))
  echo "Response: $LOGIN_RESPONSE"
  kill $SERVER_PID
  exit 1
fi

# ===========================================
# 2. NEWS ENDPOINTS
# ===========================================
echo -e "\n\n${YELLOW}=== NEWS ENDPOINTS ===${NC}"

test_endpoint "Get All News (Public)" "GET" "http://localhost:5002/api/v1/news?limit=5" "" "" "200"

# Create news article
NEWS_DATA='{"title":{"en":"Test News Article"},"excerpt":{"en":"This is a test excerpt"},"content":{"en":"This is test content for the news article."},"category":"government","status":"published","featured":true}'
CREATE_NEWS=$(curl -s -X POST http://localhost:5002/api/v1/news \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NEWS_DATA")

NEWS_ID=$(echo "$CREATE_NEWS" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['news']['_id'])" 2>/dev/null)

if [ -n "$NEWS_ID" ]; then
  echo -e "${GREEN}✅ News Created (ID: $NEWS_ID)${NC}"
  ((PASSED++))

  test_endpoint "Get News by ID" "GET" "http://localhost:5002/api/v1/news/$NEWS_ID" "" "" "200"
  test_endpoint "Get Featured News" "GET" "http://localhost:5002/api/v1/news/featured" "" "" "200"
else
  echo -e "${RED}❌ Failed to create news${NC}"
  ((FAILED++))
fi

# ===========================================
# 3. CONTACT FORM ENDPOINTS
# ===========================================
echo -e "\n\n${YELLOW}=== CONTACT FORM ENDPOINTS ===${NC}"

CONTACT_DATA='{"name":"John Doe","email":"john@example.com","phone":"+2348012345678","subject":"Test Contact","message":"This is a test contact message.","category":"general"}'
test_endpoint "Submit Contact Form (Public)" "POST" "http://localhost:5002/api/v1/contacts" "-H 'Content-Type: application/json'" "$CONTACT_DATA" "201"
test_endpoint "Get All Contacts (Admin)" "GET" "http://localhost:5002/api/v1/contacts" "$AUTH_HEADER" "" "200"

# ===========================================
# 4. SUBSCRIBER ENDPOINTS
# ===========================================
echo -e "\n\n${YELLOW}=== SUBSCRIBER ENDPOINTS ===${NC}"

SUBSCRIBER_DATA='{"email":"subscriber@example.com"}'
test_endpoint "Subscribe to Newsletter (Public)" "POST" "http://localhost:5002/api/v1/subscribers" "-H 'Content-Type: application/json'" "$SUBSCRIBER_DATA" "201"
test_endpoint "Get All Subscribers (Admin)" "GET" "http://localhost:5002/api/v1/subscribers" "$AUTH_HEADER" "" "200"

# ===========================================
# 5. OTHER CONTENT ENDPOINTS
# ===========================================
echo -e "\n\n${YELLOW}=== OTHER CONTENT ENDPOINTS ===${NC}"

test_endpoint "Get All Leaders" "GET" "http://localhost:5002/api/v1/leaders" "" "" "200"
test_endpoint "Get All Services" "GET" "http://localhost:5002/api/v1/services" "" "" "200"
test_endpoint "Get All Projects" "GET" "http://localhost:5002/api/v1/projects" "" "" "200"
test_endpoint "Get All MDAs" "GET" "http://localhost:5002/api/v1/mdas" "" "" "200"
test_endpoint "Get All LGAs" "GET" "http://localhost:5002/api/v1/lgas" "" "" "200"
test_endpoint "Get All Events" "GET" "http://localhost:5002/api/v1/events" "" "" "200"
test_endpoint "Get Upcoming Events" "GET" "http://localhost:5002/api/v1/events/upcoming" "" "" "200"
test_endpoint "Get All Announcements" "GET" "http://localhost:5002/api/v1/announcements" "" "" "200"
test_endpoint "Get All Press Releases" "GET" "http://localhost:5002/api/v1/press-releases" "" "" "200"
test_endpoint "Get All Media" "GET" "http://localhost:5002/api/v1/media" "" "" "200"
test_endpoint "Get All Hero Banners" "GET" "http://localhost:5002/api/v1/hero-banners" "" "" "200"
test_endpoint "Get Active Hero Banners" "GET" "http://localhost:5002/api/v1/hero-banners/active" "" "" "200"
test_endpoint "Get All Quick Links" "GET" "http://localhost:5002/api/v1/quick-links" "" "" "200"
test_endpoint "Get All Pages" "GET" "http://localhost:5002/api/v1/pages" "" "" "200"
test_endpoint "Get All FAQs" "GET" "http://localhost:5002/api/v1/faqs" "" "" "200"

# ===========================================
# 6. AUTHORIZATION TESTS
# ===========================================
echo -e "\n\n${YELLOW}=== AUTHORIZATION TESTS ===${NC}"

test_endpoint "Protected Route Without Token (Should Fail)" "GET" "http://localhost:5002/api/v1/auth/me" "" "" "401"
test_endpoint "Create Content Without Token (Should Fail)" "POST" "http://localhost:5002/api/v1/news" "-H 'Content-Type: application/json'" "$NEWS_DATA" "401"

# ===========================================
# SUMMARY
# ===========================================
echo -e "\n\n==========================================="
echo -e "          TEST SUMMARY"
echo -e "==========================================="
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo -e "TOTAL: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Backend is 100% operational.${NC}"
else
  echo -e "\n${RED}⚠️  Some tests failed. Check the output above.${NC}"
fi

# Stop server
echo -e "\n${YELLOW}Stopping server...${NC}"
kill $SERVER_PID 2>/dev/null
sleep 2

echo -e "\n${YELLOW}Server logs available at: /tmp/ganuwa-comprehensive.log${NC}"
echo -e "${GREEN}✅ Comprehensive test completed!${NC}\n"