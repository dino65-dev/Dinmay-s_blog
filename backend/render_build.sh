#!/bin/bash
# Render build script for FastAPI backend

echo "Building Dinmay's Blog Backend..."

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "Backend build complete!"