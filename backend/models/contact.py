from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class ContactMessageBase(BaseModel):
    firstName: str
    email: str
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessage(ContactMessageBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False
