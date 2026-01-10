from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
import os
import uuid
from pathlib import Path
import shutil
from utils.auth import get_optional_token

router = APIRouter()

# Create uploads directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    token: str = Depends(get_optional_token)
):
    """
    Upload an image file and return the URL.
    Supports: jpg, jpeg, png, gif, webp, svg, avif, bmp
    Max size: 10MB
    """
    # Check file extension
    if not file.filename or not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Read file content with size check
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return the URL
    return {
        "success": True,
        "filename": unique_filename,
        "url": f"/api/uploads/{unique_filename}",
        "size": len(contents),
        "type": ext[1:] if ext else "unknown"
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
        
        return {
            "success": True,
            "complete": True,
            "filename": final_filename,
            "url": f"/api/uploads/{final_filename}"
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
    Serve uploaded files.
    """
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
    """
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"success": True, "message": f"File {filename} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
