#!/usr/bin/env python3
"""
Frontend Integration Test Script
Tests all enhanced API endpoints with the frontend integration
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "http://localhost:12000"
FRONTEND_URL = "http://localhost:12006"

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        # First try a simple endpoint that doesn't require auth
        response = requests.get(f"{BACKEND_URL}/api/auth/login/", json={})
        print(f"✅ Backend Health Check: {response.status_code}")
        # 400 or 405 means the server is running but expects different data/method
        if response.status_code in [200, 400, 405]:
            print(f"   Backend server is responding")
            return True
        else:
            print(f"   Unexpected status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend Health Check Failed: {e}")
        return False

def test_frontend_health():
    """Test if frontend is running"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        print(f"✅ Frontend Health Check: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Frontend Health Check Failed: {e}")
        return False

def get_auth_token():
    """Get authentication token"""
    try:
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{BACKEND_URL}/api/auth/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"✅ Authentication successful")
            return token
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def test_enhanced_endpoints(token):
    """Test all enhanced API endpoints"""
    headers = {"Authorization": f"Token {token}"}
    
    endpoints_to_test = [
        {
            "name": "Dashboard Stats",
            "url": f"{BACKEND_URL}/api/dashboard/stats/",
            "method": "GET"
        },
        {
            "name": "Recent Activity",
            "url": f"{BACKEND_URL}/api/dashboard/activity/",
            "method": "GET"
        },
        {
            "name": "Available Time Slots",
            "url": f"{BACKEND_URL}/api/appointments/available-slots/",
            "method": "GET",
            "params": {
                "physiotherapist_id": 1,
                "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            }
        },
        {
            "name": "Exercise Analytics",
            "url": f"{BACKEND_URL}/api/analytics/exercises/",
            "method": "GET",
            "params": {"days": 30}
        },
        {
            "name": "Global Search",
            "url": f"{BACKEND_URL}/api/search/",
            "method": "GET",
            "params": {"q": "exercise"}
        },
        {
            "name": "Health Check",
            "url": f"{BACKEND_URL}/api/health/",
            "method": "GET"
        }
    ]
    
    results = []
    
    for endpoint in endpoints_to_test:
        try:
            if endpoint["method"] == "GET":
                params = endpoint.get("params", {})
                response = requests.get(endpoint["url"], headers=headers, params=params)
            else:
                data = endpoint.get("data", {})
                response = requests.post(endpoint["url"], headers=headers, json=data)
            
            success = response.status_code in [200, 201]
            status_icon = "✅" if success else "❌"
            
            print(f"{status_icon} {endpoint['name']}: {response.status_code}")
            
            if success and response.content:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print(f"   Keys: {list(data.keys())}")
                    elif isinstance(data, list):
                        print(f"   Items: {len(data)}")
                except:
                    print(f"   Response length: {len(response.content)} bytes")
            
            results.append({
                "endpoint": endpoint["name"],
                "status": response.status_code,
                "success": success
            })
            
        except Exception as e:
            print(f"❌ {endpoint['name']}: Error - {e}")
            results.append({
                "endpoint": endpoint["name"],
                "status": "error",
                "success": False
            })
    
    return results

def test_quick_actions(token):
    """Test quick actions endpoint"""
    headers = {"Authorization": f"Token {token}"}
    
    quick_actions = [
        {
            "name": "Mark All Notifications Read",
            "action": "mark_all_notifications_read",
            "data": {}
        }
    ]
    
    for action in quick_actions:
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/actions/",
                headers=headers,
                json={
                    "action": action["action"],
                    "data": action["data"]
                }
            )
            
            success = response.status_code in [200, 201]
            status_icon = "✅" if success else "❌"
            print(f"{status_icon} Quick Action - {action['name']}: {response.status_code}")
            
        except Exception as e:
            print(f"❌ Quick Action - {action['name']}: Error - {e}")

def test_frontend_api_integration():
    """Test frontend API service integration"""
    print("\n🔧 Testing Frontend API Integration...")
    
    # Test if frontend can load
    try:
        response = requests.get(FRONTEND_URL)
        if response.status_code == 200:
            print("✅ Frontend loads successfully")
            
            # Check if API service is properly configured
            content = response.text
            if "api" in content.lower():
                print("✅ Frontend contains API references")
            else:
                print("⚠️  Frontend may not have API integration")
                
        else:
            print(f"❌ Frontend load failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Frontend integration test failed: {e}")

def generate_integration_report(results):
    """Generate integration test report"""
    print("\n📊 INTEGRATION TEST REPORT")
    print("=" * 50)
    
    total_tests = len(results)
    successful_tests = sum(1 for r in results if r["success"])
    
    print(f"Total Endpoints Tested: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {total_tests - successful_tests}")
    print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    print("\nDetailed Results:")
    for result in results:
        status_icon = "✅" if result["success"] else "❌"
        print(f"{status_icon} {result['endpoint']}: {result['status']}")
    
    print("\n🎯 INTEGRATION STATUS")
    if successful_tests == total_tests:
        print("🟢 ALL SYSTEMS OPERATIONAL - Full API frontend integration successful!")
    elif successful_tests >= total_tests * 0.8:
        print("🟡 MOSTLY OPERATIONAL - Minor issues detected")
    else:
        print("🔴 INTEGRATION ISSUES - Multiple endpoints failing")

def main():
    """Main test execution"""
    print("🚀 HEALTHCARE APP - FULL API FRONTEND INTEGRATION TEST")
    print("=" * 60)
    
    # Test backend health
    if not test_backend_health():
        print("❌ Backend not available. Please start the Django server.")
        sys.exit(1)
    
    # Test frontend health
    if not test_frontend_health():
        print("❌ Frontend not available. Please start the React server.")
        sys.exit(1)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Authentication failed. Cannot proceed with API tests.")
        sys.exit(1)
    
    print("\n🔍 Testing Enhanced API Endpoints...")
    results = test_enhanced_endpoints(token)
    
    print("\n⚡ Testing Quick Actions...")
    test_quick_actions(token)
    
    print("\n🌐 Testing Frontend Integration...")
    test_frontend_api_integration()
    
    # Generate final report
    generate_integration_report(results)
    
    print(f"\n🔗 Access your application:")
    print(f"   Frontend: {FRONTEND_URL}")
    print(f"   Backend API: {BACKEND_URL}/api/")
    print(f"   Admin Panel: {BACKEND_URL}/admin/")

if __name__ == "__main__":
    main()