#!/bin/bash
# Render build script for React frontend

echo "Building Dinmay's Blog Frontend..."

# Install dependencies
yarn install --frozen-lockfile

# Build the React app
yarn build

echo "Frontend build complete!"
echo "Build output in: ./build"