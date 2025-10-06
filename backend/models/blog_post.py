from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class BlogPostBase(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = ""
    featuredImage: Optional[str] = ""
    contentType: str = "markdown"

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featuredImage: Optional[str] = None
    contentType: Optional[str] = None

class BlogPost(BlogPostBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    publishedDate: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
