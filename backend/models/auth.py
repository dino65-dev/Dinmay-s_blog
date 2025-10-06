from pydantic import BaseModel

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str

class TokenData(BaseModel):
    exp: int
