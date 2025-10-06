#!/usr/bin/env python3
"""
Backend API Tests for Dinmay's Blog Application
Tests authentication, blog posts CRUD, and about page APIs
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend .env
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class BlogAPITester:
    def __init__(self):
        self.auth_token = None
        self.created_posts = []
        self.test_results = {
            'auth_tests': [],
            'blog_posts_tests': [],
            'about_tests': [],
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0
        }

    def log_test(self, category, test_name, passed, details=""):
        """Log test result"""
        result = {
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results[category].append(result)
        self.test_results['total_tests'] += 1
        if passed:
            self.test_results['passed_tests'] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results['failed_tests'] += 1
            print(f"❌ {test_name}: {details}")

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test 1: Login with correct password
        try:
            response = requests.post(f"{API_BASE}/auth/login", 
                json={"password": "admin123"},
                headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.auth_token = data['token']
                    self.log_test('auth_tests', 'Login with correct password', True, 
                                f"Token received: {data['token'][:20]}...")
                else:
                    self.log_test('auth_tests', 'Login with correct password', False, 
                                "No token in response")
            else:
                self.log_test('auth_tests', 'Login with correct password', False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('auth_tests', 'Login with correct password', False, str(e))

        # Test 2: Login with incorrect password
        try:
            response = requests.post(f"{API_BASE}/auth/login", 
                json={"password": "wrongpassword"},
                headers={"Content-Type": "application/json"})
            
            if response.status_code == 401:
                self.log_test('auth_tests', 'Login with incorrect password (should fail)', True, 
                            "Correctly returned 401 Unauthorized")
            else:
                self.log_test('auth_tests', 'Login with incorrect password (should fail)', False, 
                            f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test('auth_tests', 'Login with incorrect password (should fail)', False, str(e))

        # Test 3: Verify valid token
        if self.auth_token:
            try:
                response = requests.post(f"{API_BASE}/auth/verify?token={self.auth_token}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('valid') == True:
                        self.log_test('auth_tests', 'Verify valid token', True, "Token is valid")
                    else:
                        self.log_test('auth_tests', 'Verify valid token', False, 
                                    f"Token marked as invalid: {data}")
                else:
                    self.log_test('auth_tests', 'Verify valid token', False, 
                                f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test('auth_tests', 'Verify valid token', False, str(e))

        # Test 4: Verify invalid token
        try:
            response = requests.post(f"{API_BASE}/auth/verify?token=invalid_token_123")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('valid') == False:
                    self.log_test('auth_tests', 'Verify invalid token (should fail)', True, 
                                "Correctly identified invalid token")
                else:
                    self.log_test('auth_tests', 'Verify invalid token (should fail)', False, 
                                f"Invalid token marked as valid: {data}")
            else:
                self.log_test('auth_tests', 'Verify invalid token (should fail)', False, 
                            f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test('auth_tests', 'Verify invalid token (should fail)', False, str(e))

    def test_blog_posts_crud(self):
        """Test blog posts CRUD operations"""
        print("\n=== BLOG POSTS CRUD TESTS ===")
        
        # Test 1: Create blog posts (requires auth)
        if not self.auth_token:
            self.log_test('blog_posts_tests', 'Create blog posts', False, 
                        "No auth token available")
            return

        # Create test posts with different content types
        test_posts = [
            {
                "title": "My First Markdown Post",
                "slug": f"first-markdown-post-{uuid.uuid4().hex[:8]}",
                "content": "# Hello World\n\nThis is a **markdown** post with some `code`.",
                "excerpt": "A sample markdown blog post",
                "featuredImage": "https://example.com/image1.jpg",
                "contentType": "markdown"
            },
            {
                "title": "HTML Content Post",
                "slug": f"html-content-post-{uuid.uuid4().hex[:8]}",
                "content": "<h1>HTML Post</h1><p>This is an <strong>HTML</strong> post with <em>formatting</em>.</p>",
                "excerpt": "A sample HTML blog post",
                "featuredImage": "https://example.com/image2.jpg",
                "contentType": "html"
            },
            {
                "title": "Technical Blog Post",
                "slug": f"technical-post-{uuid.uuid4().hex[:8]}",
                "content": "# Technical Post\n\n```python\nprint('Hello, World!')\n```\n\nThis post contains code examples.",
                "excerpt": "A technical blog post with code",
                "featuredImage": "",
                "contentType": "markdown"
            }
        ]

        for i, post_data in enumerate(test_posts):
            try:
                response = requests.post(f"{API_BASE}/posts", 
                    json=post_data,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                
                if response.status_code == 200:
                    created_post = response.json()
                    self.created_posts.append(created_post)
                    self.log_test('blog_posts_tests', f'Create blog post {i+1}', True, 
                                f"Post created with ID: {created_post.get('id', 'N/A')}")
                else:
                    self.log_test('blog_posts_tests', f'Create blog post {i+1}', False, 
                                f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test('blog_posts_tests', f'Create blog post {i+1}', False, str(e))

        # Test 2: Create post with duplicate slug (should fail)
        if self.created_posts:
            try:
                duplicate_post = {
                    "title": "Duplicate Slug Post",
                    "slug": self.created_posts[0]['slug'],  # Use existing slug
                    "content": "This should fail due to duplicate slug",
                    "excerpt": "Duplicate test",
                    "contentType": "markdown"
                }
                
                response = requests.post(f"{API_BASE}/posts", 
                    json=duplicate_post,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                
                if response.status_code == 400:
                    self.log_test('blog_posts_tests', 'Create post with duplicate slug (should fail)', True, 
                                "Correctly returned 400 for duplicate slug")
                else:
                    self.log_test('blog_posts_tests', 'Create post with duplicate slug (should fail)', False, 
                                f"Expected 400, got {response.status_code}")
            except Exception as e:
                self.log_test('blog_posts_tests', 'Create post with duplicate slug (should fail)', False, str(e))

        # Test 3: Get all posts (no auth required)
        try:
            response = requests.get(f"{API_BASE}/posts")
            
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and len(posts) >= len(self.created_posts):
                    # Check if posts are sorted by date (newest first)
                    if len(posts) > 1:
                        dates_sorted = all(
                            posts[i]['publishedDate'] >= posts[i+1]['publishedDate'] 
                            for i in range(len(posts)-1)
                        )
                        if dates_sorted:
                            self.log_test('blog_posts_tests', 'Get all posts (sorted by date)', True, 
                                        f"Retrieved {len(posts)} posts, correctly sorted")
                        else:
                            self.log_test('blog_posts_tests', 'Get all posts (sorted by date)', False, 
                                        "Posts not sorted by date")
                    else:
                        self.log_test('blog_posts_tests', 'Get all posts', True, 
                                    f"Retrieved {len(posts)} posts")
                else:
                    self.log_test('blog_posts_tests', 'Get all posts', False, 
                                f"Expected list with at least {len(self.created_posts)} posts, got {len(posts) if isinstance(posts, list) else 'non-list'}")
            else:
                self.log_test('blog_posts_tests', 'Get all posts', False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('blog_posts_tests', 'Get all posts', False, str(e))

        # Test 4: Get single post by slug (no auth required)
        if self.created_posts:
            for i, post in enumerate(self.created_posts):
                try:
                    response = requests.get(f"{API_BASE}/posts/{post['slug']}")
                    
                    if response.status_code == 200:
                        retrieved_post = response.json()
                        if retrieved_post['slug'] == post['slug']:
                            self.log_test('blog_posts_tests', f'Get post by slug {i+1}', True, 
                                        f"Retrieved post: {retrieved_post['title']}")
                        else:
                            self.log_test('blog_posts_tests', f'Get post by slug {i+1}', False, 
                                        "Retrieved post slug doesn't match")
                    else:
                        self.log_test('blog_posts_tests', f'Get post by slug {i+1}', False, 
                                    f"Status: {response.status_code}, Response: {response.text}")
                except Exception as e:
                    self.log_test('blog_posts_tests', f'Get post by slug {i+1}', False, str(e))

        # Test 5: Get post with invalid slug (should return 404)
        try:
            response = requests.get(f"{API_BASE}/posts/non-existent-slug-{uuid.uuid4().hex}")
            
            if response.status_code == 404:
                self.log_test('blog_posts_tests', 'Get post with invalid slug (should fail)', True, 
                            "Correctly returned 404 for non-existent slug")
            else:
                self.log_test('blog_posts_tests', 'Get post with invalid slug (should fail)', False, 
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test('blog_posts_tests', 'Get post with invalid slug (should fail)', False, str(e))

        # Test 6: Delete posts (requires auth)
        if self.created_posts and self.auth_token:
            for i, post in enumerate(self.created_posts):
                try:
                    response = requests.delete(f"{API_BASE}/posts/{post['id']}", 
                        headers={"Authorization": f"Bearer {self.auth_token}"})
                    
                    if response.status_code == 200:
                        self.log_test('blog_posts_tests', f'Delete post {i+1}', True, 
                                    f"Post deleted: {post['title']}")
                    else:
                        self.log_test('blog_posts_tests', f'Delete post {i+1}', False, 
                                    f"Status: {response.status_code}, Response: {response.text}")
                except Exception as e:
                    self.log_test('blog_posts_tests', f'Delete post {i+1}', False, str(e))

        # Test 7: Try to delete non-existent post (should return 404)
        if self.auth_token:
            try:
                fake_id = str(uuid.uuid4())
                response = requests.delete(f"{API_BASE}/posts/{fake_id}", 
                    headers={"Authorization": f"Bearer {self.auth_token}"})
                
                if response.status_code == 404:
                    self.log_test('blog_posts_tests', 'Delete non-existent post (should fail)', True, 
                                "Correctly returned 404 for non-existent post")
                else:
                    self.log_test('blog_posts_tests', 'Delete non-existent post (should fail)', False, 
                                f"Expected 404, got {response.status_code}")
            except Exception as e:
                self.log_test('blog_posts_tests', 'Delete non-existent post (should fail)', False, str(e))

        # Test 8: Try to create post without auth (should fail)
        try:
            test_post = {
                "title": "Unauthorized Post",
                "slug": f"unauthorized-post-{uuid.uuid4().hex[:8]}",
                "content": "This should fail",
                "contentType": "markdown"
            }
            
            response = requests.post(f"{API_BASE}/posts", json=test_post)
            
            if response.status_code == 401:
                self.log_test('blog_posts_tests', 'Create post without auth (should fail)', True, 
                            "Correctly returned 401 Unauthorized")
            else:
                self.log_test('blog_posts_tests', 'Create post without auth (should fail)', False, 
                            f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test('blog_posts_tests', 'Create post without auth (should fail)', False, str(e))

    def test_about_api(self):
        """Test about page API"""
        print("\n=== ABOUT API TESTS ===")
        
        # Test 1: Get about content (no auth required)
        try:
            response = requests.get(f"{API_BASE}/about")
            
            if response.status_code == 200:
                about_data = response.json()
                if 'content' in about_data:
                    self.log_test('about_tests', 'Get about content', True, 
                                f"Content length: {len(about_data['content'])} chars")
                else:
                    self.log_test('about_tests', 'Get about content', False, 
                                "No content field in response")
            else:
                self.log_test('about_tests', 'Get about content', False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('about_tests', 'Get about content', False, str(e))

        # Test 2: Update about content (requires auth)
        if self.auth_token:
            try:
                new_content = {
                    "content": f"# About Dinmay's Blog\n\nThis is the updated about page content. Last updated: {datetime.now().isoformat()}\n\n## Features\n- Blog posts with markdown support\n- Admin authentication\n- CRUD operations"
                }
                
                response = requests.put(f"{API_BASE}/about", 
                    json=new_content,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                
                if response.status_code == 200:
                    updated_data = response.json()
                    if updated_data['content'] == new_content['content']:
                        self.log_test('about_tests', 'Update about content', True, 
                                    "About content updated successfully")
                    else:
                        self.log_test('about_tests', 'Update about content', False, 
                                    "Updated content doesn't match")
                else:
                    self.log_test('about_tests', 'Update about content', False, 
                                f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test('about_tests', 'Update about content', False, str(e))

        # Test 3: Try to update about without auth (should fail)
        try:
            unauthorized_content = {
                "content": "This should fail without authentication"
            }
            
            response = requests.put(f"{API_BASE}/about", json=unauthorized_content)
            
            if response.status_code == 401:
                self.log_test('about_tests', 'Update about without auth (should fail)', True, 
                            "Correctly returned 401 Unauthorized")
            else:
                self.log_test('about_tests', 'Update about without auth (should fail)', False, 
                            f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test('about_tests', 'Update about without auth (should fail)', False, str(e))

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Backend API Tests for Dinmay's Blog")
        print(f"Backend URL: {API_BASE}")
        print("=" * 60)
        
        # Run tests in priority order
        self.test_authentication()
        self.test_blog_posts_crud()
        self.test_about_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"✅ Passed: {self.test_results['passed_tests']}")
        print(f"❌ Failed: {self.test_results['failed_tests']}")
        print(f"Success Rate: {(self.test_results['passed_tests']/self.test_results['total_tests']*100):.1f}%")
        
        # Print failed tests details
        if self.test_results['failed_tests'] > 0:
            print("\n🔍 FAILED TESTS DETAILS:")
            for category in ['auth_tests', 'blog_posts_tests', 'about_tests']:
                failed_in_category = [t for t in self.test_results[category] if not t['passed']]
                if failed_in_category:
                    print(f"\n{category.upper().replace('_', ' ')}:")
                    for test in failed_in_category:
                        print(f"  ❌ {test['test']}: {test['details']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = BlogAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results['failed_tests'] > 0:
        exit(1)
    else:
        print("\n🎉 All tests passed!")
        exit(0)