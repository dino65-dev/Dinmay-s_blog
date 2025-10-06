from fastapi import APIRouter, HTTPException
from models.auth import LoginRequest, LoginResponse
from utils.auth import verify_password, create_access_token

router = APIRouter()

@router.post("/auth/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """Admin login endpoint"""
    if not verify_password(login_request.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token = create_access_token(data={"sub": "admin"})
    return LoginResponse(token=access_token, message="Login successful")

@router.post("/auth/verify")
async def verify_token_endpoint(token: str):
    """Verify if a token is valid"""
    try:
        from utils.auth import verify_token
        from fastapi.security import HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        verify_token(credentials)
        return {"valid": True}
    except:
        return {"valid": False}
