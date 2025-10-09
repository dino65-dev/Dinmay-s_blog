from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from datetime import datetime
import shutil
from pathlib import Path

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("/app/frontend/public/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'}

def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase"""
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    """Check if file has an allowed extension"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file and return its URL
    """
    # Check if file is provided
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check if file has a filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Validate file extension
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Generate unique filename
        file_extension = get_file_extension(file.filename)
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path (relative to frontend public directory)
        file_url = f"/uploads/{unique_filename}"
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "url": file_url,
                "filename": unique_filename,
                "original_filename": file.filename,
                "uploaded_at": datetime.now().isoformat()
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.get("/upload/images")
async def list_uploaded_images():
    """
    List all uploaded images
    """
    try:
        images = []
        if UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.iterdir():
                if file_path.is_file() and get_file_extension(file_path.name) in ALLOWED_EXTENSIONS:
                    images.append({
                        "filename": file_path.name,
                        "url": f"/uploads/{file_path.name}",
                        "size": file_path.stat().st_size,
                        "created_at": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat()
                    })
        
        # Sort by creation time (newest first)
        images.sort(key=lambda x: x['created_at'], reverse=True)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "images": images,
                "count": len(images)
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list images: {str(e)}")
