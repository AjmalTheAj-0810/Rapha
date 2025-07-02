#!/usr/bin/env python3
"""
API Endpoints Test Script
Tests all enhanced API endpoints for the healthcare management system
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "http://localhost:12000"

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
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def test_api_endpoints(token):
    """Test all API endpoints"""
    headers = {"Authorization": f"Token {token}"}
    
    endpoints = [
        {
            "name": "Dashboard Stats",
            "url": f"{BACKEND_URL}/api/dashboard/stats/",
            "method": "GET",
            "description": "Get dashboard statistics"
        },
        {
            "name": "Recent Activity",
            "url": f"{BACKEND_URL}/api/dashboard/activity/",
            "method": "GET",
            "description": "Get recent activity feed"
        },
        {
            "name": "Available Time Slots",
            "url": f"{BACKEND_URL}/api/booking/available-slots/",
            "method": "GET",
            "params": {
                "physiotherapist_id": 1,
                "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            },
            "description": "Get available appointment slots"
        },
        {
            "name": "Exercise Analytics",
            "url": f"{BACKEND_URL}/api/analytics/exercises/",
            "method": "GET",
            "params": {"days": 30},
            "description": "Get exercise analytics data"
        },
        {
            "name": "Pain Analytics",
            "url": f"{BACKEND_URL}/api/analytics/pain/",
            "method": "GET",
            "params": {"days": 30},
            "description": "Get pain tracking analytics"
        },
        {
            "name": "Progress Analytics",
            "url": f"{BACKEND_URL}/api/analytics/progress/",
            "method": "GET",
            "params": {"days": 30},
            "description": "Get progress analytics"
        },
        {
            "name": "Global Search",
            "url": f"{BACKEND_URL}/api/search/",
            "method": "GET",
            "params": {"q": "exercise"},
            "description": "Search across all content"
        },
        {
            "name": "Notifications",
            "url": f"{BACKEND_URL}/api/notifications/",
            "method": "GET",
            "description": "Get user notifications"
        },
        {
            "name": "Unread Notification Count",
            "url": f"{BACKEND_URL}/api/notification-count/unread/",
            "method": "GET",
            "description": "Get unread notification count"
        },
        {
            "name": "Health Check",
            "url": f"{BACKEND_URL}/api/health/",
            "method": "GET",
            "description": "System health check"
        }
    ]
    
    results = []
    
    print("\n🔍 Testing API Endpoints...")
    print("=" * 60)
    
    for endpoint in endpoints:
        try:
            print(f"\n📡 {endpoint['name']}")
            print(f"   {endpoint['description']}")
            
            if endpoint["method"] == "GET":
                params = endpoint.get("params", {})
                response = requests.get(endpoint["url"], headers=headers, params=params)
            else:
                data = endpoint.get("data", {})
                response = requests.post(endpoint["url"], headers=headers, json=data)
            
            success = response.status_code in [200, 201]
            status_icon = "✅" if success else "❌"
            
            print(f"   {status_icon} Status: {response.status_code}")
            
            if success and response.content:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print(f"   📊 Response keys: {list(data.keys())}")
                        # Show some sample data
                        for key, value in list(data.items())[:3]:
                            if isinstance(value, (int, float, str, bool)):
                                print(f"      {key}: {value}")
                            elif isinstance(value, list):
                                print(f"      {key}: [{len(value)} items]")
                            elif isinstance(value, dict):
                                print(f"      {key}: {{{len(value)} keys}}")
                    elif isinstance(data, list):
                        print(f"   📊 Response: [{len(data)} items]")
                        if data and isinstance(data[0], dict):
                            print(f"      Sample keys: {list(data[0].keys())}")
                except Exception as e:
                    print(f"   📊 Response length: {len(response.content)} bytes")
            elif not success:
                print(f"   ❌ Error: {response.text[:200]}")
            
            results.append({
                "endpoint": endpoint["name"],
                "status": response.status_code,
                "success": success
            })
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append({
                "endpoint": endpoint["name"],
                "status": "error",
                "success": False
            })
    
    return results

def test_quick_actions(token):
    """Test quick actions endpoint"""
    headers = {"Authorization": f"Token {token}"}
    
    print("\n⚡ Testing Quick Actions...")
    print("=" * 40)
    
    quick_actions = [
        {
            "name": "Mark All Notifications Read",
            "action": "mark_all_notifications_read",
            "data": {}
        }
    ]
    
    for action in quick_actions:
        try:
            print(f"\n🎯 {action['name']}")
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
            print(f"   {status_icon} Status: {response.status_code}")
            
            if success:
                try:
                    data = response.json()
                    print(f"   📊 Response: {data}")
                except:
                    print(f"   📊 Response: {response.text}")
            else:
                print(f"   ❌ Error: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def generate_report(results):
    """Generate test report"""
    print("\n📊 API INTEGRATION TEST REPORT")
    print("=" * 50)
    
    total_tests = len(results)
    successful_tests = sum(1 for r in results if r["success"])
    
    print(f"📈 Total Endpoints Tested: {total_tests}")
    print(f"✅ Successful: {successful_tests}")
    print(f"❌ Failed: {total_tests - successful_tests}")
    print(f"📊 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    print("\n📋 Detailed Results:")
    for result in results:
        status_icon = "✅" if result["success"] else "❌"
        print(f"   {status_icon} {result['endpoint']}: {result['status']}")
    
    print("\n🎯 INTEGRATION STATUS")
    if successful_tests == total_tests:
        print("🟢 ALL SYSTEMS OPERATIONAL")
        print("   ✨ Full API integration successful!")
        print("   🚀 Ready for frontend integration!")
    elif successful_tests >= total_tests * 0.8:
        print("🟡 MOSTLY OPERATIONAL")
        print("   ⚠️  Minor issues detected")
        print("   🔧 Some endpoints may need attention")
    else:
        print("🔴 INTEGRATION ISSUES")
        print("   ❌ Multiple endpoints failing")
        print("   🛠️  Requires immediate attention")

def main():
    """Main test execution"""
    print("🚀 HEALTHCARE API - COMPREHENSIVE ENDPOINT TEST")
    print("=" * 60)
    print("🏥 Testing enhanced API endpoints for frontend integration")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Authentication failed. Cannot proceed with API tests.")
        print("💡 Make sure the backend server is running and admin user exists.")
        sys.exit(1)
    
    # Test all endpoints
    results = test_api_endpoints(token)
    
    # Test quick actions
    test_quick_actions(token)
    
    # Generate final report
    generate_report(results)
    
    print(f"\n🔗 Access your application:")
    print(f"   🌐 Backend API: {BACKEND_URL}/api/")
    print(f"   🛠️  Admin Panel: {BACKEND_URL}/admin/")
    print(f"   📚 API Documentation: {BACKEND_URL}/api/docs/")

if __name__ == "__main__":
    main()