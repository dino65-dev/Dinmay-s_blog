from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SiteSettings(BaseModel):
    blog_title: str = "Dinmay's Blog"
    blog_description: str = "A personal blog about technology, AI, and more"
    author_name: str = "Dinmay"
    author_bio: str = ""
    author_avatar: str = ""
    social_twitter: str = ""
    social_github: str = ""
    social_linkedin: str = ""
    footer_text: str = "© 2025 Dinmay's Blog. All Rights Reserved"
    updated_at: Optional[datetime] = None


class SiteSettingsUpdate(BaseModel):
    blog_title: Optional[str] = None
    blog_description: Optional[str] = None
    author_name: Optional[str] = None
    author_bio: Optional[str] = None
    author_avatar: Optional[str] = None
    social_twitter: Optional[str] = None
    social_github: Optional[str] = None
    social_linkedin: Optional[str] = None
    footer_text: Optional[str] = None
