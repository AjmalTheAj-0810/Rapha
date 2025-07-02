#!/usr/bin/env python3
"""
Test script to verify the new API endpoints work correctly
"""

import requests
import json
import sys

BASE_URL = "http://localhost:12000/api"

def test_endpoint(endpoint, method="GET", data=None, token=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Token {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        
        print(f"\n{method} {endpoint}")
        print(f"Status: {response.status_code}")
        
        if response.status_code < 400:
            try:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)[:200]}...")
                return True
            except:
                print(f"Response: {response.text[:200]}...")
                return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Exception: {e}")
        return False

def get_auth_token():
    """Get authentication token"""
    print("Getting authentication token...")
    
    # Try to get token with admin credentials
    response = requests.post(f"{BASE_URL}/auth/token/", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if response.status_code == 200:
        token = response.json().get("token")
        print(f"Got token: {token[:20]}...")
        return token
    else:
        print(f"Failed to get token: {response.text}")
        return None

def main():
    print("Testing Healthcare API Endpoints")
    print("=" * 40)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("Cannot proceed without authentication token")
        sys.exit(1)
    
    # Test new endpoints
    endpoints_to_test = [
        ("/health/", "GET"),
        ("/dashboard/stats/", "GET"),
        ("/dashboard/activity/", "GET"),
        ("/search/", "GET"),
        ("/actions/", "POST", {"action": "get_unread_count"}),
    ]
    
    success_count = 0
    total_count = len(endpoints_to_test)
    
    for endpoint_info in endpoints_to_test:
        endpoint = endpoint_info[0]
        method = endpoint_info[1]
        data = endpoint_info[2] if len(endpoint_info) > 2 else None
        
        if test_endpoint(endpoint, method, data, token):
            success_count += 1
    
    print(f"\n\nResults: {success_count}/{total_count} endpoints working")
    
    if success_count == total_count:
        print("✅ All endpoints are working correctly!")
    else:
        print("❌ Some endpoints have issues")

if __name__ == "__main__":
    main()