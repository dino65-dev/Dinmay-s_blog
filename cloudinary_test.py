#!/usr/bin/env python3
"""
Cloudinary Image Upload Integration Tests for Dinmay's Blog
Tests the Cloudinary integration for permanent image storage
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

print(f"Testing Cloudinary integration at: {API_BASE}")

class CloudinaryTester:
    def __init__(self):
        self.auth_token = None
        self.uploaded_images = []
        self.test_results = {
            'cloudinary_tests': [],
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0
        }

    def log_test(self, test_name, passed, details=""):
        """Log test result"""
        result = {
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results['cloudinary_tests'].append(result)
        self.test_results['total_tests'] += 1
        if passed:
            self.test_results['passed_tests'] += 1
            print(f"✅ {test_name}")
            if details:
                print(f"   {details}")
        else:
            self.test_results['failed_tests'] += 1
            print(f"❌ {test_name}: {details}")

    def authenticate(self):
        """Get authentication token"""
        print("\n=== AUTHENTICATION ===")
        try:
            response = requests.post(f"{API_BASE}/auth/login", 
                json={"password": "tapuhero@123"},
                headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.auth_token = data['token']
                    self.log_test('Admin authentication', True, 
                                f"Successfully authenticated with admin password")
                    return True
                else:
                    self.log_test('Admin authentication', False, "No token in response")
                    return False
            else:
                self.log_test('Admin authentication', False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test('Admin authentication', False, str(e))
            return False

    def test_cloudinary_upload_png(self):
        """Test uploading PNG image to Cloudinary"""
        try:
            with open('/tmp/test_images/test_image.png', 'rb') as f:
                files = {'file': ('test_image.png', f, 'image/png')}
                response = requests.post(f"{API_BASE}/upload/image", files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check required fields
                    required_fields = ['success', 'url', 'public_id', 'width', 'height', 'format']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test('Upload PNG - Response format', False, 
                                    f"Missing fields: {missing_fields}")
                        return
                    
                    # Check if URL is Cloudinary CDN URL
                    if not data['url'].startswith('https://res.cloudinary.com/'):
                        self.log_test('Upload PNG - Cloudinary URL', False, 
                                    f"URL is not Cloudinary CDN: {data['url']}")
                        return
                    
                    # Check if success is True
                    if data['success'] != True:
                        self.log_test('Upload PNG - Success flag', False, 
                                    f"Success flag is {data['success']}, expected True")
                        return
                    
                    # Store for later tests
                    self.uploaded_images.append(data)
                    
                    self.log_test('Upload PNG to Cloudinary', True, 
                                f"URL: {data['url'][:50]}... | Public ID: {data['public_id']} | Size: {data['width']}x{data['height']} | Format: {data['format']}")
                else:
                    self.log_test('Upload PNG to Cloudinary', False, 
                                f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('Upload PNG to Cloudinary', False, str(e))

    def test_cloudinary_upload_jpg(self):
        """Test uploading JPG image to Cloudinary"""
        try:
            with open('/tmp/test_images/test_image.jpg', 'rb') as f:
                files = {'file': ('test_image.jpg', f, 'image/jpeg')}
                response = requests.post(f"{API_BASE}/upload/image", files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Verify Cloudinary URL and metadata
                    if (data.get('success') == True and 
                        data['url'].startswith('https://res.cloudinary.com/') and
                        'public_id' in data and
                        'width' in data and 'height' in data and 'format' in data):
                        
                        self.uploaded_images.append(data)
                        self.log_test('Upload JPG to Cloudinary', True, 
                                    f"URL: {data['url'][:50]}... | Public ID: {data['public_id']} | Size: {data['width']}x{data['height']} | Format: {data['format']}")
                    else:
                        self.log_test('Upload JPG to Cloudinary', False, 
                                    f"Invalid response format or missing Cloudinary URL: {data}")
                else:
                    self.log_test('Upload JPG to Cloudinary', False, 
                                f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('Upload JPG to Cloudinary', False, str(e))

    def test_cloudinary_upload_webp(self):
        """Test uploading WEBP image to Cloudinary"""
        try:
            with open('/tmp/test_images/test_image.webp', 'rb') as f:
                files = {'file': ('test_image.webp', f, 'image/webp')}
                response = requests.post(f"{API_BASE}/upload/image", files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Verify Cloudinary URL and metadata
                    if (data.get('success') == True and 
                        data['url'].startswith('https://res.cloudinary.com/') and
                        'public_id' in data and
                        'width' in data and 'height' in data and 'format' in data):
                        
                        self.uploaded_images.append(data)
                        self.log_test('Upload WEBP to Cloudinary', True, 
                                    f"URL: {data['url'][:50]}... | Public ID: {data['public_id']} | Size: {data['width']}x{data['height']} | Format: {data['format']}")
                    else:
                        self.log_test('Upload WEBP to Cloudinary', False, 
                                    f"Invalid response format or missing Cloudinary URL: {data}")
                else:
                    self.log_test('Upload WEBP to Cloudinary', False, 
                                f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('Upload WEBP to Cloudinary', False, str(e))

    def test_cloudinary_url_accessibility(self):
        """Test that uploaded Cloudinary URLs are accessible"""
        if not self.uploaded_images:
            self.log_test('Cloudinary URL accessibility', False, "No uploaded images to test")
            return
        
        for i, image_data in enumerate(self.uploaded_images):
            try:
                url = image_data['url']
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    # Check if it's actually an image by checking content type
                    content_type = response.headers.get('content-type', '')
                    if content_type.startswith('image/'):
                        self.log_test(f'Cloudinary URL {i+1} accessibility', True, 
                                    f"URL accessible: {url[:50]}... | Content-Type: {content_type}")
                    else:
                        self.log_test(f'Cloudinary URL {i+1} accessibility', False, 
                                    f"URL accessible but not an image: {content_type}")
                else:
                    self.log_test(f'Cloudinary URL {i+1} accessibility', False, 
                                f"URL not accessible: {response.status_code}")
            except Exception as e:
                self.log_test(f'Cloudinary URL {i+1} accessibility', False, str(e))

    def test_list_cloudinary_images(self):
        """Test GET /api/upload/images returns uploaded images from Cloudinary"""
        try:
            response = requests.get(f"{API_BASE}/upload/images")
            
            if response.status_code == 200:
                data = response.json()
                
                if (data.get('success') == True and 
                    'images' in data and 
                    'count' in data and
                    isinstance(data['images'], list)):
                    
                    # Check if our uploaded images are in the list
                    found_images = 0
                    for uploaded_img in self.uploaded_images:
                        for listed_img in data['images']:
                            if listed_img.get('public_id') == uploaded_img.get('public_id'):
                                found_images += 1
                                break
                    
                    if found_images == len(self.uploaded_images):
                        self.log_test('List Cloudinary images', True, 
                                    f"Found {data['count']} total images, including all {found_images} uploaded test images")
                    else:
                        self.log_test('List Cloudinary images', False, 
                                    f"Missing uploaded images. Found {found_images}/{len(self.uploaded_images)} test images")
                    
                    # Verify all images have Cloudinary URLs
                    cloudinary_urls = 0
                    for img in data['images']:
                        if img.get('url', '').startswith('https://res.cloudinary.com/'):
                            cloudinary_urls += 1
                    
                    if cloudinary_urls == len(data['images']):
                        self.log_test('All listed images use Cloudinary URLs', True, 
                                    f"All {cloudinary_urls} images have Cloudinary CDN URLs")
                    else:
                        self.log_test('All listed images use Cloudinary URLs', False, 
                                    f"Only {cloudinary_urls}/{len(data['images'])} images have Cloudinary URLs")
                else:
                    self.log_test('List Cloudinary images', False, 
                                f"Invalid response format: {data}")
            else:
                self.log_test('List Cloudinary images', False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('List Cloudinary images', False, str(e))

    def test_invalid_file_upload(self):
        """Test uploading invalid file type (should fail)"""
        try:
            with open('/tmp/test_images/test_file.txt', 'rb') as f:
                files = {'file': ('test_file.txt', f, 'text/plain')}
                response = requests.post(f"{API_BASE}/upload/image", files=files)
                
                if response.status_code == 400:
                    self.log_test('Upload invalid file type (should fail)', True, 
                                "Correctly rejected non-image file with 400 error")
                else:
                    self.log_test('Upload invalid file type (should fail)', False, 
                                f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test('Upload invalid file type (should fail)', False, str(e))

    def test_large_file_upload(self):
        """Test uploading file exceeding size limit (should fail)"""
        try:
            with open('/tmp/test_images/large_image.png', 'rb') as f:
                files = {'file': ('large_image.png', f, 'image/png')}
                response = requests.post(f"{API_BASE}/upload/image", files=files)
                
                if response.status_code == 400:
                    response_data = response.json()
                    if "File too large" in response_data.get('detail', ''):
                        self.log_test('Upload large file (should fail)', True, 
                                    "Correctly rejected large file with size limit error")
                    else:
                        self.log_test('Upload large file (should fail)', False, 
                                    f"Wrong error message: {response_data.get('detail', '')}")
                else:
                    self.log_test('Upload large file (should fail)', False, 
                                f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test('Upload large file (should fail)', False, str(e))

    def test_cloudinary_folder_organization(self):
        """Test that images are uploaded to dinmay_blog folder in Cloudinary"""
        if not self.uploaded_images:
            self.log_test('Cloudinary folder organization', False, "No uploaded images to test")
            return
        
        folder_organized = 0
        for image_data in self.uploaded_images:
            public_id = image_data.get('public_id', '')
            if public_id.startswith('dinmay_blog/'):
                folder_organized += 1
        
        if folder_organized == len(self.uploaded_images):
            self.log_test('Cloudinary folder organization', True, 
                        f"All {folder_organized} images organized in dinmay_blog folder")
        else:
            self.log_test('Cloudinary folder organization', False, 
                        f"Only {folder_organized}/{len(self.uploaded_images)} images in dinmay_blog folder")

    def test_blog_post_integration(self):
        """Test creating blog post with Cloudinary image"""
        if not self.uploaded_images or not self.auth_token:
            self.log_test('Blog post integration with Cloudinary image', False, 
                        "No uploaded images or auth token available")
            return
        
        try:
            # Use the first uploaded image
            cloudinary_url = self.uploaded_images[0]['url']
            
            test_post = {
                "title": "Blog Post with Cloudinary Image",
                "slug": f"cloudinary-post-{uuid.uuid4().hex[:8]}",
                "content": "# Post with Cloudinary Featured Image\n\nThis post uses a Cloudinary-hosted image.",
                "excerpt": "A test post with Cloudinary featured image",
                "featuredImage": cloudinary_url,
                "contentType": "markdown"
            }
            
            response = requests.post(f"{API_BASE}/posts", 
                json=test_post,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.auth_token}"
                })
            
            if response.status_code == 200:
                created_post = response.json()
                if created_post.get('featuredImage') == cloudinary_url:
                    self.log_test('Blog post integration with Cloudinary image', True, 
                                f"Post created with Cloudinary image: {cloudinary_url[:50]}...")
                    
                    # Clean up the test post
                    cleanup_response = requests.delete(f"{API_BASE}/posts/{created_post['id']}", 
                        headers={"Authorization": f"Bearer {self.auth_token}"})
                    if cleanup_response.status_code == 200:
                        self.log_test('Clean up integration test post', True, 
                                    "Test post cleaned up successfully")
                else:
                    self.log_test('Blog post integration with Cloudinary image', False, 
                                f"Featured image URL mismatch. Expected: {cloudinary_url}, Got: {created_post.get('featuredImage')}")
            else:
                self.log_test('Blog post integration with Cloudinary image', False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test('Blog post integration with Cloudinary image', False, str(e))

    def run_cloudinary_tests(self):
        """Run all Cloudinary integration tests"""
        print("🌤️  Starting Cloudinary Image Upload Integration Tests")
        print(f"Backend URL: {API_BASE}")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return self.test_results
        
        print("\n=== CLOUDINARY UPLOAD TESTS ===")
        
        # Test image uploads
        self.test_cloudinary_upload_png()
        self.test_cloudinary_upload_jpg()
        self.test_cloudinary_upload_webp()
        
        # Test URL accessibility
        self.test_cloudinary_url_accessibility()
        
        # Test listing images
        self.test_list_cloudinary_images()
        
        # Test error cases
        self.test_invalid_file_upload()
        self.test_large_file_upload()
        
        # Test Cloudinary-specific features
        self.test_cloudinary_folder_organization()
        
        # Test integration
        self.test_blog_post_integration()
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 CLOUDINARY INTEGRATION TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"✅ Passed: {self.test_results['passed_tests']}")
        print(f"❌ Failed: {self.test_results['failed_tests']}")
        
        if self.test_results['total_tests'] > 0:
            success_rate = (self.test_results['passed_tests']/self.test_results['total_tests']*100)
            print(f"Success Rate: {success_rate:.1f}%")
        
        # Print failed tests details
        if self.test_results['failed_tests'] > 0:
            print("\n🔍 FAILED TESTS DETAILS:")
            failed_tests = [t for t in self.test_results['cloudinary_tests'] if not t['passed']]
            for test in failed_tests:
                print(f"  ❌ {test['test']}: {test['details']}")
        
        # Print uploaded images summary
        if self.uploaded_images:
            print(f"\n📸 Successfully uploaded {len(self.uploaded_images)} test images to Cloudinary:")
            for i, img in enumerate(self.uploaded_images):
                print(f"  {i+1}. {img['public_id']} - {img['url'][:60]}...")
        
        return self.test_results

if __name__ == "__main__":
    tester = CloudinaryTester()
    results = tester.run_cloudinary_tests()
    
    # Exit with error code if tests failed
    if results['failed_tests'] > 0:
        print(f"\n❌ {results['failed_tests']} test(s) failed!")
        exit(1)
    else:
        print("\n🎉 All Cloudinary integration tests passed!")
        exit(0)