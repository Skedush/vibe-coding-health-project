from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategorySimple(BaseModel):
    id: int
    name: str
    has_user_rule: Optional[bool] = True

    class Config:
        from_attributes = True

class TitleSimple(BaseModel):
    title_name: str

    class Config:
        from_attributes = True

class EntrySimple(BaseModel):
    id: int
    title: str
    category_id: int

    class Config:
        from_attributes = True

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
    category_name: Optional[str] = None
    title_name: Optional[str] = None
    category: Optional[CategorySimple] = None
    title: Optional[TitleSimple] = None
    entrys: Optional[List[EntrySimple]] = None

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
    entry_ids: Optional[List[int]] = None

class UserEntryCreate(UserEntryBase):
    pass

class UserEntryUpdate(BaseModel):
    entry_info_id: Optional[int] = None
    name: Optional[str] = None
    gender: Optional[str] = None
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
    entry_ids: Optional[List[int]] = None

class UserEntryResponse(UserEntryBase):
    id: int
    is_delete: bool = False
    created: datetime
    updated: datetime

    class Config:
        from_attributes = True
