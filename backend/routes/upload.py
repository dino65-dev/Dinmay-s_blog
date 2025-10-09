from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import cloudinary
import cloudinary.uploader
from datetime import datetime
from pathlib import Path
import io

router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes

def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase"""
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    """Check if file has an allowed extension"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file to Cloudinary and return its URL
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
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size allowed: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    try:
        # Upload to Cloudinary
        # Create a file-like object from bytes
        file_like = io.BytesIO(file_content)
        
        # Upload to Cloudinary with folder organization
        result = cloudinary.uploader.upload(
            file_like,
            folder="dinmay_blog",  # Organize in folder
            resource_type="image",
            use_filename=True,
            unique_filename=True
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "url": result['secure_url'],  # Direct HTTPS URL from Cloudinary CDN
                "public_id": result['public_id'],
                "filename": result.get('original_filename', file.filename),
                "original_filename": file.filename,
                "width": result.get('width'),
                "height": result.get('height'),
                "format": result.get('format'),
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
                        "url": f"/api/static/uploads/{file_path.name}",
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
