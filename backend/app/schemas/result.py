from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EntrySimple(BaseModel):
    id: int
    title: str
    remark: Optional[str] = None
    category_id: int

    class Config:
        from_attributes = True

class EntryInfoResult(BaseModel):
    id: int
    category_id: int
    title_id: int
    entrys: List[EntrySimple] = []

    class Config:
        from_attributes = True

class UserEntryResult(BaseModel):
    id: int
    entry_info_id: int
    name: str
    gender: str
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
    created: datetime
    entryship: List[EntrySimple] = []

    class Config:
        from_attributes = True

class ResultResponse(BaseModel):
    id: int
    name: str
    gender: str
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
    created: datetime
    entryship: List[EntrySimple] = []
    entry_info: Optional[EntryInfoResult] = None

    class Config:
        from_attributes = True
