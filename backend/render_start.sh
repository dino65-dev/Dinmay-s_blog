#!/bin/bash
# Render startup script for FastAPI backend

echo "Starting Dinmay's Blog Backend on Render..."

# Set Python path
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src/backend"

# Start uvicorn with production settings
uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001} --workers 2