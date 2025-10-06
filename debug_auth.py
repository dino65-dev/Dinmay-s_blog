#!/usr/bin/env python3
import os
import sys
sys.path.append('/app/backend')

from dotenv import load_dotenv
from pathlib import Path

# Load environment like the server does
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

print("Environment variables:")
print(f"ADMIN_PASSWORD: {repr(os.getenv('ADMIN_PASSWORD'))}")
print(f"SECRET_KEY: {repr(os.getenv('SECRET_KEY'))}")

# Test the auth utility
from utils.auth import verify_password, ADMIN_PASSWORD

print(f"\nAuth utility ADMIN_PASSWORD: {repr(ADMIN_PASSWORD)}")
print(f"Testing password 'tapuhero@123': {verify_password('tapuhero@123')}")
print(f"Testing password 'admin123': {verify_password('admin123')}")