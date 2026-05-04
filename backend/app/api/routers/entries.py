from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entry import Entry
from app.schemas.entry import EntryCreate, EntryResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/entry", tags=["条目"])

@router.get("/", response_model=List[EntryResponse])
def list_entries(
    db: Session = Depends(get_db)
):
    """获取条目列表（公开）"""
    entries = db.query(Entry).filter(Entry.is_delete == False).all()
    return entries

@router.post("/", response_model=EntryResponse)
def create_entry(
    entry_data: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建条目（需认证）"""
    entry = Entry(**entry_data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    """获取条目详情（公开）"""
    entry = db.query(Entry).filter(
        Entry.id == entry_id,
        Entry.is_delete == False
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.patch("/{entry_id}", response_model=EntryResponse)
def update_entry(
    entry_id: int,
    entry_data: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新条目（需认证）"""
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for field, value in entry_data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除条目（需认证）"""
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.is_delete = True
    db.commit()
    return {"message": "Deleted successfully"}
