from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class CommentBase(BaseModel):
    post_id: str
    author_name: str
    author_email: EmailStr
    content: str
    parent_id: Optional[str] = None  # For nested replies

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "post_id": "post-123",
                "parent_id": None,
                "author_name": "John Doe",
                "author_email": "john@example.com",
                "content": "Great article!",
                "created_at": "2025-01-01T00:00:00"
            }
        }
