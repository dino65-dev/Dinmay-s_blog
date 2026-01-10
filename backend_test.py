#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Dinmay's Blog
Tests all backend endpoints in the specified order from the review request.
"""

import requests
import json
import os
import sys
from datetime import datetime
import uuid
import io
from pathlib import Path

# Use localhost for testing since external URL has routing issues
BASE_URL = "http://localhost:8001"
API_URL = f"{BASE_URL}/api"

# Test configuration
ADMIN_PASSWORD = "tapuhero@123"
auth_token = None

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_result(self, test_name, success, message="", details=""):
        self.results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
        if success:
            self.passed += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.failed += 1
            print(f"❌ {test_name}: {message}")
            if details:
                print(f"   Details: {details}")
    
    def print_summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        print(f"{'='*60}")
        
        if self.failed > 0:
            print("\nFAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['message']}")
                    if result['details']:
                        print(f"   {result['details']}")

results = TestResults()

def make_request(method, endpoint, **kwargs):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        response = requests.request(method, url, timeout=30, **kwargs)
        return response
    except requests.exceptions.RequestException as e:
        return None

def test_health_check():
    """Test 1: Health Check - GET /api/health"""
    print("\n1. Testing Health Check Endpoint...")
    
    response = make_request('GET', '/health')
    if response is None:
        results.add_result("Health Check", False, "Connection failed", "Could not connect to backend")
        return
    
    if response.status_code == 200:
        try:
            data = response.json()
            if data.get('status') == 'healthy':
                results.add_result("Health Check", True, "Backend is healthy", f"Response: {data}")
            else:
                results.add_result("Health Check", False, f"Unhealthy status: {data.get('status')}", str(data))
        except json.JSONDecodeError:
            results.add_result("Health Check", False, "Invalid JSON response", response.text)
    else:
        results.add_result("Health Check", False, f"HTTP {response.status_code}", response.text)

def test_authentication():
    """Test 2: Authentication - POST /api/auth/login"""
    global auth_token
    print("\n2. Testing Authentication...")
    
    # Test with correct password
    login_data = {"password": ADMIN_PASSWORD}
    response = make_request('POST', '/auth/login', json=login_data)
    
    if response is None:
        results.add_result("Authentication - Login", False, "Connection failed")
        return
    
    if response.status_code == 200:
        try:
            data = response.json()
            auth_token = data.get('token')
            if auth_token:
                results.add_result("Authentication - Login", True, "Login successful", f"Token received: {auth_token[:20]}...")
            else:
                results.add_result("Authentication - Login", False, "No token in response", str(data))
        except json.JSONDecodeError:
            results.add_result("Authentication - Login", False, "Invalid JSON response", response.text)
    else:
        results.add_result("Authentication - Login", False, f"HTTP {response.status_code}", response.text)
    
    # Test with incorrect password
    wrong_login_data = {"password": "wrongpassword"}
    response = make_request('POST', '/auth/login', json=wrong_login_data)
    
    if response and response.status_code == 401:
        results.add_result("Authentication - Wrong Password", True, "Correctly rejected wrong password")
    else:
        status = response.status_code if response else "No response"
        results.add_result("Authentication - Wrong Password", False, f"Expected 401, got {status}")

def test_blog_posts_crud():
    """Test 3: Blog Posts CRUD Operations"""
    print("\n3. Testing Blog Posts CRUD...")
    
    # Test GET /api/posts (get all posts)
    response = make_request('GET', '/posts')
    if response and response.status_code == 200:
        try:
            posts = response.json()
            results.add_result("Blog Posts - Get All", True, f"Retrieved {len(posts)} posts")
        except json.JSONDecodeError:
            results.add_result("Blog Posts - Get All", False, "Invalid JSON response", response.text)
    else:
        status = response.status_code if response else "No response"
        results.add_result("Blog Posts - Get All", False, f"HTTP {status}")
    
    # Test POST /api/posts (create post) - requires auth
    if auth_token:
        headers = {"Authorization": f"Bearer {auth_token}"}
        test_post = {
            "title": "Test Blog Post",
            "slug": f"test-post-{uuid.uuid4().hex[:8]}",
            "content": "This is a test blog post content with **markdown** formatting.",
            "excerpt": "Test excerpt for the blog post",
            "contentType": "markdown",
            "featuredImage": "https://example.com/test-image.jpg"
        }
        
        response = make_request('POST', '/posts', json=test_post, headers=headers)
        if response and response.status_code == 200:
            try:
                created_post = response.json()
                post_id = created_post.get('id')
                post_slug = created_post.get('slug')
                results.add_result("Blog Posts - Create", True, f"Created post with ID: {post_id}")
                
                # Test GET /api/posts/{slug} (get single post)
                if post_slug:
                    response = make_request('GET', f'/posts/{post_slug}')
                    if response and response.status_code == 200:
                        results.add_result("Blog Posts - Get by Slug", True, f"Retrieved post: {post_slug}")
                    else:
                        status = response.status_code if response else "No response"
                        results.add_result("Blog Posts - Get by Slug", False, f"HTTP {status}")
                
                # Test PUT /api/posts/{id} (update post)
                if post_id:
                    update_data = {
                        "title": "Updated Test Blog Post",
                        "content": "Updated content for the test blog post."
                    }
                    response = make_request('PUT', f'/posts/{post_id}', json=update_data, headers=headers)
                    if response and response.status_code == 200:
                        results.add_result("Blog Posts - Update", True, f"Updated post: {post_id}")
                    else:
                        status = response.status_code if response else "No response"
                        results.add_result("Blog Posts - Update", False, f"HTTP {status}")
                
                # Test DELETE /api/posts/{id} (delete post)
                if post_id:
                    response = make_request('DELETE', f'/posts/{post_id}', headers=headers)
                    if response and response.status_code == 200:
                        results.add_result("Blog Posts - Delete", True, f"Deleted post: {post_id}")
                    else:
                        status = response.status_code if response else "No response"
                        results.add_result("Blog Posts - Delete", False, f"HTTP {status}")
                        
            except json.JSONDecodeError:
                results.add_result("Blog Posts - Create", False, "Invalid JSON response", response.text)
        else:
            status = response.status_code if response else "No response"
            results.add_result("Blog Posts - Create", False, f"HTTP {status}")
    else:
        results.add_result("Blog Posts - Create", False, "No auth token available")

def test_search_posts():
    """Test 4: Search Posts - GET /api/search/posts"""
    print("\n4. Testing Search Posts...")
    
    # Test basic search
    response = make_request('GET', '/search/posts?q=test')
    if response and response.status_code == 200:
        try:
            search_results = response.json()
            results.add_result("Search Posts - Basic", True, f"Search returned {len(search_results)} results")
        except json.JSONDecodeError:
            results.add_result("Search Posts - Basic", False, "Invalid JSON response", response.text)
    else:
        status = response.status_code if response else "No response"
        results.add_result("Search Posts - Basic", False, f"HTTP {status}")
    
    # Test advanced search with filters
    params = {
        'q': 'test',
        'content_type': 'markdown',
        'sort_by': 'date',
        'order': 'desc'
    }
    response = make_request('GET', '/search/posts', params=params)
    if response and response.status_code == 200:
        try:
            search_results = response.json()
            results.add_result("Search Posts - Advanced", True, f"Advanced search returned {len(search_results)} results")
        except json.JSONDecodeError:
            results.add_result("Search Posts - Advanced", False, "Invalid JSON response", response.text)
    else:
        status = response.status_code if response else "No response"
        results.add_result("Search Posts - Advanced", False, f"HTTP {status}")

def test_image_upload():
    """Test 5: Image Upload APIs"""
    print("\n5. Testing Image Upload...")
    
    # Test GET /api/upload/status
    response = make_request('GET', '/upload/status')
    if response and response.status_code == 200:
        try:
            status_data = response.json()
            cloudinary_configured = status_data.get('cloudinary_configured', False)
            results.add_result("Image Upload - Status", True, f"Upload status retrieved, Cloudinary: {cloudinary_configured}")
        except json.JSONDecodeError:
            results.add_result("Image Upload - Status", False, "Invalid JSON response", response.text)
    else:
        status = response.status_code if response else "No response"
        results.add_result("Image Upload - Status", False, f"HTTP {status}")
    
    # Test POST /api/upload/image with a small test image
    try:
        # Create a small test image (1x1 pixel PNG)
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': ('test.png', io.BytesIO(test_image_data), 'image/png')}
        headers = {}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'
        
        response = requests.post(f"{API_URL}/upload/image", files=files, headers=headers, timeout=30)
        
        if response and response.status_code == 200:
            try:
                upload_result = response.json()
                if upload_result.get('success'):
                    results.add_result("Image Upload - Upload", True, f"Image uploaded successfully, storage: {upload_result.get('storage')}")
                else:
                    results.add_result("Image Upload - Upload", False, "Upload not successful", str(upload_result))
            except json.JSONDecodeError:
                results.add_result("Image Upload - Upload", False, "Invalid JSON response", response.text)
        else:
            status = response.status_code if response else "No response"
            results.add_result("Image Upload - Upload", False, f"HTTP {status}")
            
    except Exception as e:
        results.add_result("Image Upload - Upload", False, f"Upload test failed: {str(e)}")

def test_about_api():
    """Test 6: About API"""
    print("\n6. Testing About API...")
    
    # Test GET /api/about
    response = make_request('GET', '/about')
    if response and response.status_code == 200:
        try:
            about_data = response.json()
            results.add_result("About API - Get", True, "About content retrieved successfully")
        except json.JSONDecodeError:
            results.add_result("About API - Get", False, "Invalid JSON response", response.text)
    else:
        status = response.status_code if response else "No response"
        results.add_result("About API - Get", False, f"HTTP {status}")

def test_comments_api():
    """Test 7: Comments API"""
    print("\n7. Testing Comments API...")
    
    # First, we need a post ID to test comments. Let's get existing posts or create one
    response = make_request('GET', '/posts')
    post_id = None
    
    if response and response.status_code == 200:
        try:
            posts = response.json()
            if posts:
                post_id = posts[0].get('id')
        except json.JSONDecodeError:
            pass
    
    # If no posts exist, create one for testing
    if not post_id and auth_token:
        headers = {"Authorization": f"Bearer {auth_token}"}
        test_post = {
            "title": "Test Post for Comments",
            "slug": f"comment-test-{uuid.uuid4().hex[:8]}",
            "content": "This post is for testing comments.",
            "excerpt": "Comment test post",
            "contentType": "markdown"
        }
        
        response = make_request('POST', '/posts', json=test_post, headers=headers)
        if response and response.status_code == 200:
            try:
                created_post = response.json()
                post_id = created_post.get('id')
            except json.JSONDecodeError:
                pass
    
    if post_id:
        # Test GET /api/posts/{post_id}/comments
        response = make_request('GET', f'/posts/{post_id}/comments')
        if response and response.status_code == 200:
            try:
                comments = response.json()
                results.add_result("Comments API - Get Comments", True, f"Retrieved {len(comments)} comments for post")
            except json.JSONDecodeError:
                results.add_result("Comments API - Get Comments", False, "Invalid JSON response", response.text)
        else:
            status = response.status_code if response else "No response"
            results.add_result("Comments API - Get Comments", False, f"HTTP {status}")
        
        # Test POST /api/posts/{post_id}/comments
        comment_data = {
            "post_id": post_id,
            "author_name": "Test User",
            "author_email": "test@example.com",
            "content": "This is a test comment for the blog post."
        }
        
        response = make_request('POST', f'/posts/{post_id}/comments', json=comment_data)
        if response and response.status_code == 200:
            try:
                created_comment = response.json()
                comment_id = created_comment.get('id')
                results.add_result("Comments API - Create Comment", True, f"Created comment with ID: {comment_id}")
            except json.JSONDecodeError:
                results.add_result("Comments API - Create Comment", False, "Invalid JSON response", response.text)
        else:
            status = response.status_code if response else "No response"
            results.add_result("Comments API - Create Comment", False, f"HTTP {status}")
    else:
        results.add_result("Comments API - Get Comments", False, "No post available for testing")
        results.add_result("Comments API - Create Comment", False, "No post available for testing")

def main():
    """Run all backend tests in the specified order"""
    print(f"🚀 Starting Backend API Testing for Dinmay's Blog")
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("="*60)
    
    # Run tests in the order specified in the review request
    test_health_check()
    test_authentication()
    test_blog_posts_crud()
    test_search_posts()
    test_image_upload()
    test_about_api()
    test_comments_api()
    
    # Print final summary
    results.print_summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)