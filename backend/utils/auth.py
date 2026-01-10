import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, Security, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

def verify_password(plain_password: str) -> bool:
    # Load admin password dynamically to ensure .env is loaded
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    return plain_password == admin_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_optional_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Get token from Authorization header if present.
    Returns None if no token provided (useful for optional auth).
    """
    if not authorization:
        return None
    
    try:
        # Parse "Bearer <token>" format
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        # Verify token is valid
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return token
    except (ValueError, JWTError):
        return None

