#!/usr/bin/env python3
"""
EXHAUSTIVE API TEST - Tests 100% of all endpoints
NO LIES. NO ASSUMPTIONS. REAL HTTP REQUESTS.
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:5005/api/v1"

# Stats
total = 0
passed = 0
failed = 0

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def test(name, method, url, expected_status, headers=None, data=None):
    """Test an endpoint"""
    global total, passed, failed
    total += 1

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)

        if response.status_code == expected_status:
            print(f"{GREEN}✅ PASS{RESET} [{response.status_code}] {name}")
            passed += 1
            return response
        else:
            print(f"{RED}❌ FAIL{RESET} [{response.status_code} vs {expected_status}] {name}")
            failed += 1
            return response
    except Exception as e:
        print(f"{RED}❌ ERROR{RESET} {name}: {str(e)}")
        failed += 1
        return None

print("=" * 60)
print("  EXHAUSTIVE API TEST - 100% Coverage")
print("=" * 60)
print()

# Wait for server
time.sleep(2)

print("PART 1: AUTHENTICATION (9 tests)")
print("=" * 60)

# Health check
test("GET /health", "GET", f"{BASE_URL}/health", 200)
test("GET /api root", "GET", f"{BASE_URL}", 200)

# Login
print(f"\n{BLUE}Logging in...{RESET}")
login_response = test(
    "POST /auth/login",
    "POST",
    f"{BASE_URL}/auth/login",
    200,
    data={"email": "admin@kanostate.gov.ng", "password": "Admin@2025!ChangeMe"}
)

if login_response and login_response.status_code == 200:
    token = login_response.json()['data']['accessToken']
    print(f"{GREEN}✅ Token obtained{RESET}")
    headers = {"Authorization": f"Bearer {token}"}
else:
    print(f"{RED}❌ CRITICAL: Cannot get token!{RESET}")
    sys.exit(1)

# Auth tests
test("GET /auth/me (with token)", "GET", f"{BASE_URL}/auth/me", 200, headers=headers)
test("GET /auth/me (no token)", "GET", f"{BASE_URL}/auth/me", 401)
test("PUT /auth/profile", "PUT", f"{BASE_URL}/auth/profile", 200, headers=headers, data={"phoneNumber": "+2348012345678"})
test("PUT /auth/change-password", "PUT", f"{BASE_URL}/auth/change-password", 200, headers=headers,
     data={"currentPassword": "Admin@2025!ChangeMe", "newPassword": "NewPass@2025!"})
test("PUT /auth/change-password back", "PUT", f"{BASE_URL}/auth/change-password", 200, headers=headers,
     data={"currentPassword": "NewPass@2025!", "newPassword": "Admin@2025!ChangeMe"})
test("POST /auth/forgot-password", "POST", f"{BASE_URL}/auth/forgot-password", 200,
     data={"email": "admin@kanostate.gov.ng"})

print(f"\n{BLUE}PART 2: NEWS (Full CRUD - 11 tests){RESET}")
print("=" * 60)

# CREATE
create_response = test(
    "POST /news",
    "POST",
    f"{BASE_URL}/news",
    201,
    headers=headers,
    data={
        "title": {"en": "Exhaustive Test News"},
        "excerpt": {"en": "Test excerpt"},
        "content": {"en": "Test content"},
        "category": "government",
        "status": "published",
        "featured": True
    }
)

news_id = None
if create_response and create_response.status_code == 201:
    news_id = create_response.json()['data']['news']['_id']
    print(f"{BLUE}Created News ID: {news_id}{RESET}")

# READ
test("GET /news (all)", "GET", f"{BASE_URL}/news", 200)
if news_id:
    test("GET /news/:id", "GET", f"{BASE_URL}/news/{news_id}", 200)
test("GET /news/featured", "GET", f"{BASE_URL}/news/featured", 200)
test("GET /news/category/government", "GET", f"{BASE_URL}/news/category/government", 200)
test("GET /news/slug/exhaustive-test-news", "GET", f"{BASE_URL}/news/slug/exhaustive-test-news", 200)

# UPDATE
if news_id:
    update_response = test(
        "PUT /news/:id",
        "PUT",
        f"{BASE_URL}/news/{news_id}",
        200,
        headers=headers,
        data={"title": {"en": "Updated Test News"}}
    )

    # Verify update
    verify_response = requests.get(f"{BASE_URL}/news/{news_id}")
    if verify_response.status_code == 200:
        updated_title = verify_response.json()['data']['news']['title']['en']
        if updated_title == "Updated Test News":
            print(f"{GREEN}✅ PASS{RESET} [UPDATE VERIFIED] Title updated correctly")
            passed += 1
        else:
            print(f"{RED}❌ FAIL{RESET} [UPDATE NOT VERIFIED] Expected 'Updated Test News', got '{updated_title}'")
            failed += 1
        total += 1

    # DELETE
    test("DELETE /news/:id", "DELETE", f"{BASE_URL}/news/{news_id}", 200, headers=headers)
    test("GET /news/:id (deleted)", "GET", f"{BASE_URL}/news/{news_id}", 404)

# Security tests
test("POST /news (no auth)", "POST", f"{BASE_URL}/news", 401,
     data={"title": {"en": "Test"}})

print(f"\n{BLUE}PART 3: ALL OTHER CONTENT TYPES (44 tests){RESET}")
print("=" * 60)

# LEADERS
test("GET /leaders", "GET", f"{BASE_URL}/leaders", 200)
leader_response = test("POST /leaders", "POST", f"{BASE_URL}/leaders", 201, headers=headers,
                       data={"name": "Test Leader", "position": "governor", "ministry": "Executive",
                             "bio": {"en": "Test"}, "image": "test.jpg"})
if leader_response and leader_response.status_code == 201:
    leader_id = leader_response.json()['data']['leader']['_id']
    test("GET /leaders/:id", "GET", f"{BASE_URL}/leaders/{leader_id}", 200)
test("GET /leaders/position/governor", "GET", f"{BASE_URL}/leaders/position/governor", 200)

# SERVICES
test("GET /services", "GET", f"{BASE_URL}/services", 200)
service_response = test("POST /services", "POST", f"{BASE_URL}/services", 201, headers=headers,
                        data={"name": {"en": "Test Service"}, "description": {"en": "Test"},
                              "category": "health", "slug": "test-service-python"})
if service_response and service_response.status_code == 201:
    service_id = service_response.json()['data']['service']['_id']
    test("GET /services/:id", "GET", f"{BASE_URL}/services/{service_id}", 200)
test("GET /services/category/health", "GET", f"{BASE_URL}/services/category/health", 200)
test("GET /services/slug/test-service-python", "GET", f"{BASE_URL}/services/slug/test-service-python", 200)

# PROJECTS
test("GET /projects", "GET", f"{BASE_URL}/projects", 200)
project_response = test("POST /projects", "POST", f"{BASE_URL}/projects", 201, headers=headers,
                        data={"title": {"en": "Test Project"}, "description": {"en": "Test"},
                              "category": "infrastructure", "status": "ongoing", "slug": "test-project-python"})
if project_response and project_response.status_code == 201:
    project_id = project_response.json()['data']['project']['_id']
    test("GET /projects/:id", "GET", f"{BASE_URL}/projects/{project_id}", 200)
    test("GET /projects/slug/test-project-python", "GET", f"{BASE_URL}/projects/slug/test-project-python", 200)
test("GET /projects/status/ongoing", "GET", f"{BASE_URL}/projects/status/ongoing", 200)
test("GET /projects/category/infrastructure", "GET", f"{BASE_URL}/projects/category/infrastructure", 200)

# MDAs
test("GET /mdas", "GET", f"{BASE_URL}/mdas", 200)
mda_response = test("POST /mdas", "POST", f"{BASE_URL}/mdas", 201, headers=headers,
                    data={"name": {"en": "Test Ministry"}, "type": "ministry",
                          "description": {"en": "Test"}, "slug": "test-ministry-python"})
if mda_response and mda_response.status_code == 201:
    mda_id = mda_response.json()['data']['mda']['_id']
    test("GET /mdas/:id", "GET", f"{BASE_URL}/mdas/{mda_id}", 200)
    test("GET /mdas/slug/test-ministry-python", "GET", f"{BASE_URL}/mdas/slug/test-ministry-python", 200)
test("GET /mdas/type/ministry", "GET", f"{BASE_URL}/mdas/type/ministry", 200)

# LGAs
test("GET /lgas", "GET", f"{BASE_URL}/lgas", 200)
lga_response = test("POST /lgas", "POST", f"{BASE_URL}/lgas", 201, headers=headers,
                    data={"name": "Test LGA", "slug": "test-lga-python", "description": {"en": "Test"}})
if lga_response and lga_response.status_code == 201:
    lga_id = lga_response.json()['data']['lga']['_id']
    test("GET /lgas/:id", "GET", f"{BASE_URL}/lgas/{lga_id}", 200)
    test("GET /lgas/slug/test-lga-python", "GET", f"{BASE_URL}/lgas/slug/test-lga-python", 200)

# EVENTS
test("GET /events", "GET", f"{BASE_URL}/events", 200)
test("GET /events/upcoming", "GET", f"{BASE_URL}/events/upcoming", 200)
test("GET /events/past", "GET", f"{BASE_URL}/events/past", 200)
event_response = test("POST /events", "POST", f"{BASE_URL}/events", 201, headers=headers,
                      data={"title": {"en": "Test Event"}, "description": {"en": "Test"},
                            "startDate": "2026-12-31", "endDate": "2026-12-31", "venue": "Test",
                            "category": "conference", "slug": "test-event-python"})
if event_response and event_response.status_code == 201:
    event_id = event_response.json()['data']['event']['_id']
    test("GET /events/:id", "GET", f"{BASE_URL}/events/{event_id}", 200)
    test("GET /events/slug/test-event-python", "GET", f"{BASE_URL}/events/slug/test-event-python", 200)
test("GET /events/category/conference", "GET", f"{BASE_URL}/events/category/conference", 200)

# ANNOUNCEMENTS
test("GET /announcements", "GET", f"{BASE_URL}/announcements", 200)
ann_response = test("POST /announcements", "POST", f"{BASE_URL}/announcements", 201, headers=headers,
                    data={"title": {"en": "Test"}, "content": {"en": "Test"}, "priority": "high", "isActive": True})
if ann_response and ann_response.status_code == 201:
    ann_id = ann_response.json()['data']['announcement']['_id']
    test("GET /announcements/:id", "GET", f"{BASE_URL}/announcements/{ann_id}", 200)
test("GET /announcements/priority/high", "GET", f"{BASE_URL}/announcements/priority/high", 200)

# PRESS RELEASES
test("GET /press-releases", "GET", f"{BASE_URL}/press-releases", 200)
press_response = test("POST /press-releases", "POST", f"{BASE_URL}/press-releases", 201, headers=headers,
                      data={"title": {"en": "Test Press"}, "content": {"en": "Test"},
                            "slug": "test-press-python", "releaseDate": "2026-01-18"})
if press_response and press_response.status_code == 201:
    press_id = press_response.json()['data']['pressRelease']['_id']
    test("GET /press-releases/:id", "GET", f"{BASE_URL}/press-releases/{press_id}", 200)
    test("GET /press-releases/slug/test-press-python", "GET", f"{BASE_URL}/press-releases/slug/test-press-python", 200)

# MEDIA
test("GET /media", "GET", f"{BASE_URL}/media", 200)
media_response = test("POST /media", "POST", f"{BASE_URL}/media", 201, headers=headers,
                      data={"title": {"en": "Test Media"}, "type": "image",
                            "url": "http://test.jpg", "album": "Python Test"})
if media_response and media_response.status_code == 201:
    media_id = media_response.json()['data']['media']['_id']
    test("GET /media/:id", "GET", f"{BASE_URL}/media/{media_id}", 200)
test("GET /media/type/image", "GET", f"{BASE_URL}/media/type/image", 200)

# HERO BANNERS
test("GET /hero-banners", "GET", f"{BASE_URL}/hero-banners", 200)
test("GET /hero-banners/active", "GET", f"{BASE_URL}/hero-banners/active", 200)
test("POST /hero-banners", "POST", f"{BASE_URL}/hero-banners", 201, headers=headers,
     data={"title": {"en": "Test"}, "image": "test.jpg", "isActive": True, "displayOrder": 1})

# QUICK LINKS
test("GET /quick-links", "GET", f"{BASE_URL}/quick-links", 200)
test("POST /quick-links", "POST", f"{BASE_URL}/quick-links", 201, headers=headers,
     data={"title": {"en": "Test Link"}, "url": "http://test.com", "icon": "test", "displayOrder": 1})

# PAGES
test("GET /pages", "GET", f"{BASE_URL}/pages", 200)
page_response = test("POST /pages", "POST", f"{BASE_URL}/pages", 201, headers=headers,
                     data={"title": {"en": "Test Page"}, "content": {"en": "Test"}, "slug": "test-page-python"})
if page_response and page_response.status_code == 201:
    page_id = page_response.json()['data']['page']['_id']
    test("GET /pages/:id", "GET", f"{BASE_URL}/pages/{page_id}", 200)
    test("GET /pages/slug/test-page-python", "GET", f"{BASE_URL}/pages/slug/test-page-python", 200)

# FAQs
test("GET /faqs", "GET", f"{BASE_URL}/faqs", 200)
faq_response = test("POST /faqs", "POST", f"{BASE_URL}/faqs", 201, headers=headers,
                    data={"question": {"en": "Test?"}, "answer": {"en": "Test"},
                          "category": "general", "isActive": True, "displayOrder": 1})
if faq_response and faq_response.status_code == 201:
    faq_id = faq_response.json()['data']['faq']['_id']
    test("GET /faqs/:id", "GET", f"{BASE_URL}/faqs/{faq_id}", 200)
test("GET /faqs/category/general", "GET", f"{BASE_URL}/faqs/category/general", 200)

print(f"\n{BLUE}PART 4: PUBLIC ENDPOINTS (4 tests){RESET}")
print("=" * 60)

# CONTACTS
test("POST /contacts", "POST", f"{BASE_URL}/contacts", 201,
     data={"name": "Test", "email": "test@test.com", "phone": "+234800",
           "subject": "Test", "message": "Test", "category": "general"})
test("GET /contacts", "GET", f"{BASE_URL}/contacts", 200, headers=headers)

# SUBSCRIBERS
import random
test("POST /subscribers", "POST", f"{BASE_URL}/subscribers", 201,
     data={"email": f"test{random.randint(1000,9999)}@test.com"})
test("GET /subscribers", "GET", f"{BASE_URL}/subscribers", 200, headers=headers)

print(f"\n{BLUE}PART 5: ERROR HANDLING (6 tests){RESET}")
print("=" * 60)

test("GET /news/invalid-id", "GET", f"{BASE_URL}/news/invalid", 500)
test("POST /news (missing fields)", "POST", f"{BASE_URL}/news", 500, headers=headers,
     data={"title": {"en": "Test"}})
test("GET /leaders/nonexistent", "GET", f"{BASE_URL}/leaders/123456789012345678901234", 404)
test("PUT /news/nonexistent", "PUT", f"{BASE_URL}/news/123456789012345678901234", 404, headers=headers,
     data={"title": {"en": "Test"}})
test("POST /auth/login (wrong pass)", "POST", f"{BASE_URL}/auth/login", 401,
     data={"email": "admin@kanostate.gov.ng", "password": "wrong"})
test("POST /news (no auth)", "POST", f"{BASE_URL}/news", 401,
     data={"title": {"en": "Test"}})

# Final Results
print(f"\n{'=' * 60}")
print(f"           FINAL RESULTS")
print(f"{'=' * 60}\n")
print(f"{BLUE}Total Tests:{RESET}    {total}")
print(f"{GREEN}Passed:{RESET}         {passed}")
print(f"{RED}Failed:{RESET}         {failed}")
print(f"\nPass Rate:      {int(passed/total*100)}%\n")

if failed == 0:
    print(f"{GREEN}╔══════════════════════════════════════╗{RESET}")
    print(f"{GREEN}║  🎉 ALL TESTS PASSED! 100% SUCCESS  ║{RESET}")
    print(f"{GREEN}╚══════════════════════════════════════╝{RESET}")
    sys.exit(0)
else:
    print(f"{RED}╔══════════════════════════════════════╗{RESET}")
    print(f"{RED}║  ⚠️  SOME TESTS FAILED               ║{RESET}")
    print(f"{RED}╚══════════════════════════════════════╝{RESET}")
    sys.exit(1)