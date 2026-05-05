from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ========== 基础信息 ==========

class ResultInfo(BaseModel):
    """基础信息（BasicInfo 用）"""
    id: int
    name: str
    gender: str
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    waistline: Optional[str] = None
    systolic_pressure: Optional[str] = None
    diastolic_pressure: Optional[str] = None
    blood_sugar: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created: datetime
    remark: Optional[str] = None
    suggestion: Optional[str] = None

    class Config:
        from_attributes = True


# ========== 分组症状 ==========

class CategoryForGroup(BaseModel):
    """分组用的 category 简化版"""
    id: int
    name: str
    link: Optional[str] = None
    child_link: Optional[str] = None
    protocol: Optional[str] = "https://"
    show_count: Optional[int] = 0

    class Config:
        from_attributes = True


class EntryForGroup(BaseModel):
    """分组用的 entry 简化版"""
    id: int
    title: str
    number: Optional[int] = None  # None 表示顶级条目，不参与过滤

    class Config:
        from_attributes = True


class EntryGroupResponse(BaseModel):
    """单个分组"""
    category: CategoryForGroup
    entrys: List[EntryForGroup]

    class Config:
        from_attributes = True


class ResultGroupsResponse(BaseModel):
    """分组症状列表"""
    groups: List[EntryGroupResponse]

    class Config:
        from_attributes = True


# ========== Compare 用 ==========

class ResultCompareResponse(BaseModel):
    """Compare 页面用"""
    id: int
    name: str
    gender: str
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    waistline: Optional[str] = None
    systolic_pressure: Optional[str] = None
    diastolic_pressure: Optional[str] = None
    blood_sugar: Optional[str] = None
    phone: Optional[str] = None
    created: datetime
    remark: Optional[str] = None
    entry_ids: List[int]  # 顶级 entryship id 列表

    class Config:
        from_attributes = True
