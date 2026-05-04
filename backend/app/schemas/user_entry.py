from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EntryInfoBase(BaseModel):
    user_id: int
    category_id: int
    title_id: int

class EntryInfoCreate(EntryInfoBase):
    pass

class EntryInfoResponse(EntryInfoBase):
    id: int
    is_delete: bool = False
    created: datetime
    updated: datetime

    class Config:
        from_attributes = True


class UserEntryBase(BaseModel):
    entry_info_id: int
    name: Optional[str] = None
    gender: Optional[str] = "1"
    height: Optional[str] = None
    weight: Optional[str] = None
    age: Optional[str] = None
    address: Optional[str] = None
    waistline: Optional[str] = None
    systolic_pressure: Optional[str] = None
    diastolic_pressure: Optional[str] = None
    blood_sugar: Optional[str] = None
    remark: Optional[str] = None
    suggestion: Optional[str] = None
    phone: Optional[str] = None

class UserEntryCreate(UserEntryBase):
    pass

class UserEntryResponse(UserEntryBase):
    id: int
    is_delete: bool = False
    created: datetime
    updated: datetime

    class Config:
        from_attributes = True
