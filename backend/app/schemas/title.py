from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TitleBase(BaseModel):
    title_name: str

class TitleCreate(TitleBase):
    pass

class TitleUpdate(BaseModel):
    title_name: Optional[str] = None

class TitleResponse(TitleBase):
    id: int
    user_id: int
    created: datetime
    updated: datetime
    is_delete: bool

    class Config:
        from_attributes = True
