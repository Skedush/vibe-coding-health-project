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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(Entry).filter(Entry.is_delete == False).all()
    return entries

@router.post("/", response_model=EntryResponse)
def create_entry(
    entry_data: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = Entry(**entry_data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id,
        Entry.is_delete == False
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry
