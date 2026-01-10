from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import JSONResponse, RedirectResponse
import os
import uuid
from pathlib import Path
import cloudinary
import cloudinary.uploader
from utils.auth import get_optional_token
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)

# Fallback: Create local uploads directory for backward compatibility
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def is_cloudinary_configured() -> bool:
    """Check if Cloudinary is properly configured"""
    return all([
        os.environ.get('CLOUDINARY_CLOUD_NAME'),
        os.environ.get('CLOUDINARY_API_KEY'),
        os.environ.get('CLOUDINARY_API_SECRET')
    ])

@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    token: str = Depends(get_optional_token)
):
    """
    Upload an image file to Cloudinary (or local fallback).
    Images are auto-optimized for fast loading and low bandwidth.
    Supports: jpg, jpeg, png, gif, webp, svg, avif, bmp
    Max size: 10MB
    """
    # Check file extension
    if not file.filename or not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content with size check
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    ext = Path(file.filename).suffix.lower()
    unique_id = str(uuid.uuid4())
    
    # Try Cloudinary upload first
    if is_cloudinary_configured():
        try:
            # Upload to Cloudinary with auto-optimization
            result = cloudinary.uploader.upload(
                contents,
                folder="dinmay-blog",
                public_id=unique_id,
                resource_type="auto",
                # Auto-optimize for fast loading
                transformation=[
                    {"quality": "auto:good", "fetch_format": "auto"}
                ],
                # Enable eager transformations for responsive images
                eager=[
                    {"width": 400, "height": 300, "crop": "fill", "quality": "auto:low"},
                    {"width": 800, "height": 600, "crop": "fill", "quality": "auto:good"},
                    {"width": 1200, "height": 800, "crop": "fill", "quality": "auto:good"}
                ],
                eager_async=True
            )
            
            logger.info(f"Image uploaded to Cloudinary: {result['public_id']}")
            
            return {
                "success": True,
                "filename": result['public_id'],
                "url": result['secure_url'],
                "optimized_url": cloudinary.CloudinaryImage(result['public_id']).build_url(
                    quality="auto",
                    fetch_format="auto"
                ),
                "thumbnail_url": cloudinary.CloudinaryImage(result['public_id']).build_url(
                    width=400,
                    height=300,
                    crop="fill",
                    quality="auto:low",
                    fetch_format="auto"
                ),
                "size": len(contents),
                "type": ext[1:] if ext else "unknown",
                "storage": "cloudinary"
            }
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {str(e)}, falling back to local storage")
    
    # Fallback to local storage
    unique_filename = f"{unique_id}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    return {
        "success": True,
        "filename": unique_filename,
        "url": f"/api/uploads/{unique_filename}",
        "size": len(contents),
        "type": ext[1:] if ext else "unknown",
        "storage": "local"
    }

@router.post("/upload/chunk")
async def upload_chunk(
    file: UploadFile = File(...),
    chunk_number: int = 0,
    total_chunks: int = 1,
    file_id: str = None
):
    """
    Upload file in chunks for large files.
    Use this for files > 5MB.
    """
    import shutil
    
    # Generate or use existing file_id
    if chunk_number == 0:
        file_id = str(uuid.uuid4())
    elif not file_id:
        raise HTTPException(status_code=400, detail="file_id required for chunks after first")
    
    # Create temp directory for chunks
    chunk_dir = UPLOAD_DIR / "chunks" / file_id
    chunk_dir.mkdir(parents=True, exist_ok=True)
    
    # Save chunk
    chunk_path = chunk_dir / f"{chunk_number}.part"
    contents = await file.read()
    
    with open(chunk_path, "wb") as f:
        f.write(contents)
    
    # If all chunks received, combine them
    if chunk_number == total_chunks - 1:
        # Get original filename extension
        ext = Path(file.filename).suffix.lower() if file.filename else '.jpg'
        if ext not in ALLOWED_EXTENSIONS:
            ext = '.jpg'
        
        final_filename = f"{file_id}{ext}"
        final_path = UPLOAD_DIR / final_filename
        
        # Combine all chunks
        with open(final_path, "wb") as outfile:
            for i in range(total_chunks):
                chunk_file = chunk_dir / f"{i}.part"
                if chunk_file.exists():
                    with open(chunk_file, "rb") as infile:
                        outfile.write(infile.read())
        
        # Clean up chunks
        shutil.rmtree(chunk_dir)
        
        # Upload combined file to Cloudinary if configured
        if is_cloudinary_configured():
            try:
                with open(final_path, "rb") as f:
                    result = cloudinary.uploader.upload(
                        f,
                        folder="dinmay-blog",
                        public_id=file_id,
                        resource_type="auto",
                        transformation=[
                            {"quality": "auto:good", "fetch_format": "auto"}
                        ]
                    )
                # Remove local file after successful Cloudinary upload
                os.remove(final_path)
                
                return {
                    "success": True,
                    "complete": True,
                    "filename": result['public_id'],
                    "url": result['secure_url'],
                    "storage": "cloudinary"
                }
            except Exception as e:
                logger.error(f"Cloudinary upload failed for chunked file: {str(e)}")
        
        return {
            "success": True,
            "complete": True,
            "filename": final_filename,
            "url": f"/api/uploads/{final_filename}",
            "storage": "local"
        }
    
    return {
        "success": True,
        "complete": False,
        "file_id": file_id,
        "chunk_received": chunk_number
    }

@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """
    Serve uploaded files (local storage fallback).
    For Cloudinary images, redirect to CDN.
    """
    from fastapi.responses import FileResponse
    
    # Check if it's a Cloudinary public_id (contains folder path)
    if "/" in filename or not Path(filename).suffix:
        # Redirect to Cloudinary CDN
        cloudinary_url = cloudinary.CloudinaryImage(filename).build_url(
            quality="auto",
            fetch_format="auto"
        )
        return RedirectResponse(url=cloudinary_url, status_code=302)
    
    # Local file serving
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type
    ext = Path(filename).suffix.lower()
    media_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.avif': 'image/avif',
        '.bmp': 'image/bmp'
    }
    media_type = media_types.get(ext, 'application/octet-stream')
    
    return FileResponse(
        file_path, 
        media_type=media_type,
        headers={
            "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
            "Access-Control-Allow-Origin": "*"
        }
    )

@router.delete("/uploads/{filename}")
async def delete_uploaded_file(filename: str, token: str = Depends(get_optional_token)):
    """
    Delete an uploaded file. Requires authentication.
    Works for both Cloudinary and local files.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Try Cloudinary deletion first
    if is_cloudinary_configured():
        try:
            # Handle both formats: just ID or folder/ID
            public_id = filename if "/" in filename else f"dinmay-blog/{filename.rsplit('.', 1)[0]}"
            result = cloudinary.uploader.destroy(public_id)
            if result.get('result') == 'ok':
                return {"success": True, "message": f"File {filename} deleted from Cloudinary"}
        except Exception as e:
            logger.error(f"Cloudinary deletion failed: {str(e)}")
    
    # Fallback to local deletion
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"success": True, "message": f"File {filename} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

@router.get("/upload/status")
async def get_upload_status():
    """
    Get current upload configuration status.
    """
    return {
        "cloudinary_configured": is_cloudinary_configured(),
        "cloud_name": os.environ.get('CLOUDINARY_CLOUD_NAME', 'not configured'),
        "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024),
        "allowed_extensions": list(ALLOWED_EXTENSIONS)
    }
