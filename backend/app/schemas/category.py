from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    link: Optional[str] = None
    protocol: Optional[str] = "https://"
    has_user_rule: Optional[bool] = True
    child_link: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    show_count: int
    is_delete: bool = False
    created: datetime
    updated: datetime

    class Config:
        from_attributes = True
