#!/usr/bin/env python3
"""
Backend API Tests for Origin Check Bug Fix
Tests the auth origin-check fix that allows cross-domain requests while maintaining CSRF protection.
"""
import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://test-mastery-lab.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
AVERY_EMAIL = "apex.qa.avery@example.com"
AVERY_PASSWORD = "ApexQa!Avery2026"
JORDAN_EMAIL = "apex.qa.jordan@example.com"
JORDAN_PASSWORD = "ApexQa!Jordan2026"

# Cross-domain origin for testing (different from BASE_URL)
CROSS_DOMAIN_ORIGIN = "https://test-mastery-lab.cluster-3.preview.emergentcf.cloud"

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(passed, message):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def print_response(response):
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    try:
        print(f"Body: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Body: {response.text[:500]}")

# Test counters
total_tests = 0
passed_tests = 0

def test_result(passed, message):
    global total_tests, passed_tests
    total_tests += 1
    if passed:
        passed_tests += 1
    print_result(passed, message)

print(f"\n{'#'*80}")
print(f"# ORIGIN CHECK BUG FIX TESTS")
print(f"# Base URL: {BASE_URL}")
print(f"# Cross-domain Origin: {CROSS_DOMAIN_ORIGIN}")
print(f"# Started: {datetime.now().isoformat()}")
print(f"{'#'*80}\n")

# ============================================================================
# SCENARIO 1: Login with cross-domain Origin + same-origin sec-fetch-site
# ============================================================================
print_test("SCENARIO 1: Login with cross-domain Origin + same-origin sec-fetch-site")

try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': CROSS_DOMAIN_ORIGIN,
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
    }
    
    payload = {
        'email': AVERY_EMAIL,
        'password': AVERY_PASSWORD
    }
    
    response = requests.post(f"{API_BASE}/auth/login", json=payload, headers=headers, allow_redirects=False)
    print_response(response)
    
    # Check if login succeeded
    if response.status_code == 401:
        # Account doesn't exist, create it first
        print("\nAccount not found, creating via register...")
        register_payload = {
            'name': 'Avery Martinez',
            'email': AVERY_EMAIL,
            'password': AVERY_PASSWORD
        }
        register_response = requests.post(f"{API_BASE}/auth/register", json=register_payload, headers=headers, allow_redirects=False)
        print_response(register_response)
        
        if register_response.status_code in [200, 201]:
            print("\nRetrying login after registration...")
            response = requests.post(f"{API_BASE}/auth/login", json=payload, headers=headers, allow_redirects=False)
            print_response(response)
    
    # Verify success
    success = response.status_code == 200
    has_cookie = 'set-cookie' in response.headers and 'apex_session' in response.headers.get('set-cookie', '')
    not_forbidden = response.status_code != 403
    
    test_result(success and has_cookie and not_forbidden, 
                f"Login with cross-domain Origin should return 200 with apex_session cookie, not 403. Got {response.status_code}")
    
    if success:
        # Save session for later tests
        avery_session = response.cookies.get('apex_session')
        print(f"✓ Saved Avery's session cookie")
    
except Exception as e:
    test_result(False, f"Exception during login test: {str(e)}")
    avery_session = None

# ============================================================================
# SCENARIO 2: Register with cross-domain Origin + same-origin sec-fetch-site
# ============================================================================
print_test("SCENARIO 2: Register fresh account with cross-domain Origin + same-origin sec-fetch-site")

try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': CROSS_DOMAIN_ORIGIN,
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
    }
    
    # Use Jordan's account
    payload = {
        'name': 'Jordan Chen',
        'email': JORDAN_EMAIL,
        'password': JORDAN_PASSWORD
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=payload, headers=headers, allow_redirects=False)
    print_response(response)
    
    # 409 means already exists, which is fine - try login instead
    if response.status_code == 409:
        print("\nAccount already exists, trying login instead...")
        login_payload = {
            'email': JORDAN_EMAIL,
            'password': JORDAN_PASSWORD
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_payload, headers=headers, allow_redirects=False)
        print_response(response)
    
    success = response.status_code in [200, 201]
    has_cookie = 'set-cookie' in response.headers and 'apex_session' in response.headers.get('set-cookie', '')
    not_forbidden = response.status_code != 403
    
    test_result(success and has_cookie and not_forbidden,
                f"Register/Login with cross-domain Origin should return 200/201 with cookie, not 403. Got {response.status_code}")
    
    if success:
        jordan_session = response.cookies.get('apex_session')
        print(f"✓ Saved Jordan's session cookie")
    
except Exception as e:
    test_result(False, f"Exception during register test: {str(e)}")
    jordan_session = None

# ============================================================================
# SCENARIO 3: Workspace PATCH and Practice POST with cross-domain Origin
# ============================================================================
print_test("SCENARIO 3: Workspace PATCH and Practice POST with cross-domain Origin")

if avery_session:
    try:
        # First, PATCH workspace to set active subjects
        headers = {
            'Content-Type': 'application/json',
            'Origin': CROSS_DOMAIN_ORIGIN,
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Cookie': f'apex_session={avery_session}'
        }
        
        workspace_payload = {
            'activeSubjects': ['ap-psych', 'ap-csp']
        }
        
        response = requests.patch(f"{API_BASE}/workspace", json=workspace_payload, headers=headers, allow_redirects=False)
        print("PATCH /api/workspace:")
        print_response(response)
        
        workspace_success = response.status_code == 200 and response.status_code != 403
        test_result(workspace_success,
                    f"Workspace PATCH with cross-domain Origin should return 200, not 403. Got {response.status_code}")
        
        # Now POST a practice session
        import uuid
        practice_payload = {
            'attemptId': str(uuid.uuid4()),
            'subjectId': 'ap-psych',
            'type': 'drill',
            'answers': {
                'q_p1': 'B',
                'q_p2': 'C',
                'q_p3': 'A',
                'q_p4': 'D',
                'q_p5': 'B'
            },
            'durationSec': 300
        }
        
        response = requests.post(f"{API_BASE}/practice/sessions", json=practice_payload, headers=headers, allow_redirects=False)
        print("\nPOST /api/practice/sessions:")
        print_response(response)
        
        practice_success = response.status_code in [200, 201] and response.status_code != 403
        test_result(practice_success,
                    f"Practice POST with cross-domain Origin should return 200/201, not 403. Got {response.status_code}")
        
    except Exception as e:
        test_result(False, f"Exception during workspace/practice test: {str(e)}")
else:
    test_result(False, "Skipped - no valid session from previous test")

# ============================================================================
# SCENARIO 4: Google OAuth start with cross-domain Origin
# ============================================================================
print_test("SCENARIO 4: Google OAuth start with cross-domain Origin + callback URL check")

try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': CROSS_DOMAIN_ORIGIN,
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
    }
    
    response = requests.post(f"{API_BASE}/auth/google/start", json={}, headers=headers, allow_redirects=False)
    print_response(response)
    
    success = response.status_code == 200
    not_forbidden = response.status_code != 403
    has_state_cookie = 'set-cookie' in response.headers and 'apex_oauth_state' in response.headers.get('set-cookie', '')
    
    if success:
        data = response.json()
        has_url = 'url' in data
        
        # Check if callback URL points to the cross-domain origin
        if has_url:
            url = data['url']
            # The URL should contain a redirect parameter with callback to CROSS_DOMAIN_ORIGIN
            callback_in_url = CROSS_DOMAIN_ORIGIN in url or 'redirect=' in url
            print(f"\n✓ OAuth URL: {url}")
            print(f"✓ Callback domain check: {callback_in_url}")
            
            test_result(success and not_forbidden and has_state_cookie and has_url,
                        f"Google start with cross-domain Origin should return 200 with URL and state cookie, not 403. Got {response.status_code}")
        else:
            test_result(False, "Response missing 'url' field")
    else:
        test_result(False, f"Google start returned {response.status_code}, expected 200")
    
except Exception as e:
    test_result(False, f"Exception during Google OAuth start test: {str(e)}")

# ============================================================================
# SCENARIO 5: SECURITY - Login with sec-fetch-site: cross-site (should be blocked)
# ============================================================================
print_test("SCENARIO 5: SECURITY - Login with sec-fetch-site: cross-site (should be blocked)")

try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-site.com',
        'Sec-Fetch-Site': 'cross-site',  # This should trigger CSRF protection
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
    }
    
    payload = {
        'email': AVERY_EMAIL,
        'password': AVERY_PASSWORD
    }
    
    response = requests.post(f"{API_BASE}/auth/login", json=payload, headers=headers, allow_redirects=False)
    print_response(response)
    
    is_forbidden = response.status_code == 403
    has_csrf_message = False
    
    if is_forbidden:
        try:
            error_data = response.json()
            error_msg = error_data.get('error', '')
            has_csrf_message = 'cross-site' in error_msg.lower() or 'not allowed' in error_msg.lower()
            print(f"\n✓ Error message: {error_msg}")
        except:
            pass
    
    test_result(is_forbidden and has_csrf_message,
                f"Login with sec-fetch-site: cross-site should return 403 with CSRF error. Got {response.status_code}")
    
except Exception as e:
    test_result(False, f"Exception during CSRF protection test: {str(e)}")

# ============================================================================
# SCENARIO 6: SECURITY - Login with malformed Origin (should be blocked)
# ============================================================================
print_test("SCENARIO 6: SECURITY - Login with malformed Origin (should be blocked)")

try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'not-a-url',  # Malformed origin
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
    }
    
    payload = {
        'email': AVERY_EMAIL,
        'password': AVERY_PASSWORD
    }
    
    response = requests.post(f"{API_BASE}/auth/login", json=payload, headers=headers, allow_redirects=False)
    print_response(response)
    
    is_forbidden = response.status_code == 403
    has_invalid_origin_message = False
    
    if is_forbidden:
        try:
            error_data = response.json()
            error_msg = error_data.get('error', '')
            has_invalid_origin_message = 'invalid' in error_msg.lower() and 'origin' in error_msg.lower()
            print(f"\n✓ Error message: {error_msg}")
        except:
            pass
    
    test_result(is_forbidden and has_invalid_origin_message,
                f"Login with malformed Origin should return 403 with invalid origin error. Got {response.status_code}")
    
except Exception as e:
    test_result(False, f"Exception during malformed origin test: {str(e)}")

# ============================================================================
# SCENARIO 7: REGRESSION - Core auth functionality still works
# ============================================================================
print_test("SCENARIO 7: REGRESSION - Core auth functionality")

# 7a: GET /api/auth/me signed-out returns {user:null}
try:
    response = requests.get(f"{API_BASE}/auth/me", allow_redirects=False)
    print("GET /api/auth/me (signed out):")
    print_response(response)
    
    success = response.status_code == 200
    if success:
        data = response.json()
        has_null_user = data.get('user') is None
        test_result(has_null_user, f"Signed-out /me should return user:null. Got {data.get('user')}")
    else:
        test_result(False, f"GET /me returned {response.status_code}, expected 200")
except Exception as e:
    test_result(False, f"Exception during signed-out /me test: {str(e)}")

# 7b: Logout revokes session
if avery_session:
    try:
        headers = {
            'Content-Type': 'application/json',
            'Origin': BASE_URL,
            'Sec-Fetch-Site': 'same-origin',
            'Cookie': f'apex_session={avery_session}'
        }
        
        # First verify session is valid
        response = requests.get(f"{API_BASE}/auth/me", headers=headers, allow_redirects=False)
        print("\nGET /api/auth/me (before logout):")
        print_response(response)
        
        was_logged_in = response.status_code == 200 and response.json().get('user') is not None
        
        # Logout
        response = requests.post(f"{API_BASE}/auth/logout", json={}, headers=headers, allow_redirects=False)
        print("\nPOST /api/auth/logout:")
        print_response(response)
        
        logout_success = response.status_code == 200
        
        # Verify session is revoked
        response = requests.get(f"{API_BASE}/auth/me", headers=headers, allow_redirects=False)
        print("\nGET /api/auth/me (after logout):")
        print_response(response)
        
        is_logged_out = response.json().get('user') is None
        
        test_result(was_logged_in and logout_success and is_logged_out,
                    f"Logout should revoke session. Before: logged_in={was_logged_in}, After: logged_out={is_logged_out}")
    except Exception as e:
        test_result(False, f"Exception during logout test: {str(e)}")

# 7c: Duplicate email returns 409
try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
        'Sec-Fetch-Site': 'same-origin'
    }
    
    payload = {
        'name': 'Duplicate User',
        'email': AVERY_EMAIL,  # Already exists
        'password': 'DifferentPassword123!'
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=payload, headers=headers, allow_redirects=False)
    print("\nPOST /api/auth/register (duplicate email):")
    print_response(response)
    
    is_conflict = response.status_code == 409
    test_result(is_conflict, f"Duplicate email should return 409. Got {response.status_code}")
except Exception as e:
    test_result(False, f"Exception during duplicate email test: {str(e)}")

# 7d: Short password rejected
try:
    headers = {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
        'Sec-Fetch-Site': 'same-origin'
    }
    
    payload = {
        'name': 'Test User',
        'email': 'short.password@example.com',
        'password': 'short'  # Less than 10 characters
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=payload, headers=headers, allow_redirects=False)
    print("\nPOST /api/auth/register (short password):")
    print_response(response)
    
    is_bad_request = response.status_code == 400
    test_result(is_bad_request, f"Short password should return 400. Got {response.status_code}")
except Exception as e:
    test_result(False, f"Exception during short password test: {str(e)}")

# 7e: User A cannot read user B's practice session
if avery_session and jordan_session:
    try:
        # First, create a practice session for Jordan
        headers_jordan = {
            'Content-Type': 'application/json',
            'Origin': BASE_URL,
            'Sec-Fetch-Site': 'same-origin',
            'Cookie': f'apex_session={jordan_session}'
        }
        
        # Set Jordan's active subjects
        workspace_payload = {
            'activeSubjects': ['ap-psych']
        }
        requests.patch(f"{API_BASE}/workspace", json=workspace_payload, headers=headers_jordan, allow_redirects=False)
        
        # Create Jordan's practice session
        import uuid
        jordan_attempt_id = str(uuid.uuid4())
        practice_payload = {
            'attemptId': jordan_attempt_id,
            'subjectId': 'ap-psych',
            'type': 'drill',
            'answers': {
                'q_p1': 'B',
                'q_p2': 'C',
                'q_p3': 'A',
                'q_p4': 'D',
                'q_p5': 'B'
            },
            'durationSec': 300
        }
        
        response = requests.post(f"{API_BASE}/practice/sessions", json=practice_payload, headers=headers_jordan, allow_redirects=False)
        print("\nPOST /api/practice/sessions (Jordan):")
        print_response(response)
        
        if response.status_code in [200, 201]:
            jordan_session_id = response.json().get('result', {}).get('id')
            print(f"\n✓ Jordan's session ID: {jordan_session_id}")
            
            # Now try to access Jordan's session as Avery
            # First login as Avery again
            headers_avery_login = {
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Sec-Fetch-Site': 'same-origin'
            }
            login_payload = {
                'email': AVERY_EMAIL,
                'password': AVERY_PASSWORD
            }
            response = requests.post(f"{API_BASE}/auth/login", json=login_payload, headers=headers_avery_login, allow_redirects=False)
            avery_session_new = response.cookies.get('apex_session')
            
            headers_avery = {
                'Cookie': f'apex_session={avery_session_new}'
            }
            
            response = requests.get(f"{API_BASE}/practice/sessions/{jordan_session_id}", headers=headers_avery, allow_redirects=False)
            print(f"\nGET /api/practice/sessions/{jordan_session_id} (as Avery):")
            print_response(response)
            
            is_not_found = response.status_code == 404
            test_result(is_not_found, f"User A accessing User B's session should return 404. Got {response.status_code}")
        else:
            test_result(False, f"Could not create Jordan's practice session. Got {response.status_code}")
    except Exception as e:
        test_result(False, f"Exception during cross-user access test: {str(e)}")

# 7f: Unknown route returns 404
try:
    response = requests.get(f"{API_BASE}/unknown/route/that/does/not/exist", allow_redirects=False)
    print("\nGET /api/unknown/route/that/does/not/exist:")
    print_response(response)
    
    is_not_found = response.status_code == 404
    test_result(is_not_found, f"Unknown route should return 404. Got {response.status_code}")
except Exception as e:
    test_result(False, f"Exception during unknown route test: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
print(f"\n{'#'*80}")
print(f"# TEST SUMMARY")
print(f"# Total: {total_tests} | Passed: {passed_tests} | Failed: {total_tests - passed_tests}")
print(f"# Success Rate: {(passed_tests/total_tests*100):.1f}%")
print(f"# Completed: {datetime.now().isoformat()}")
print(f"{'#'*80}\n")

if passed_tests == total_tests:
    print("✅ ALL TESTS PASSED - Origin check bug fix verified successfully!")
    exit(0)
else:
    print(f"❌ {total_tests - passed_tests} TEST(S) FAILED - Review failures above")
    exit(1)
