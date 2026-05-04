from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EntryBase(BaseModel):
    category_id: int
    title: Optional[str] = None
    remark: Optional[str] = None
    sort: Optional[int] = 999

class EntryCreate(EntryBase):
    pass

class EntryResponse(EntryBase):
    id: int
    created: datetime
    updated: datetime

    class Config:
        from_attributes = True
