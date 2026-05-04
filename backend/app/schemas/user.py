from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = "1"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_title: bool
    is_vip: bool
    date_joined: datetime

    class Config:
        from_attributes = True
