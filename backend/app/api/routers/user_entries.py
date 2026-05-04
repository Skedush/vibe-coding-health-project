from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user_entry import EntryInfo, UserEntry
from app.schemas.user_entry import EntryInfoCreate, EntryInfoResponse, UserEntryCreate, UserEntryResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/entryInfo", tags=["条目信息"])

@router.get("/", response_model=List[EntryInfoResponse])
def list_entry_infos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry_infos = db.query(EntryInfo).filter(EntryInfo.is_delete == False).all()
    return entry_infos

@router.post("/", response_model=EntryInfoResponse)
def create_entry_info(
    entry_info_data: EntryInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry_info = EntryInfo(**entry_info_data.model_dump())
    db.add(entry_info)
    db.commit()
    db.refresh(entry_info)
    return entry_info

@router.get("/{entry_info_id}", response_model=EntryInfoResponse)
def get_entry_info(
    entry_info_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry_info = db.query(EntryInfo).filter(
        EntryInfo.id == entry_info_id,
        EntryInfo.is_delete == False
    ).first()
    if not entry_info:
        raise HTTPException(status_code=404, detail="EntryInfo not found")
    return entry_info

@router.patch("/{entry_info_id}", response_model=EntryInfoResponse)
def update_entry_info(
    entry_info_id: int,
    entry_info_data: EntryInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry_info = db.query(EntryInfo).filter(EntryInfo.id == entry_info_id).first()
    if not entry_info:
        raise HTTPException(status_code=404, detail="EntryInfo not found")
    for field, value in entry_info_data.model_dump(exclude_unset=True).items():
        setattr(entry_info, field, value)
    db.commit()
    db.refresh(entry_info)
    return entry_info

@router.delete("/{entry_info_id}")
def delete_entry_info(
    entry_info_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry_info = db.query(EntryInfo).filter(EntryInfo.id == entry_info_id).first()
    if not entry_info:
        raise HTTPException(status_code=404, detail="EntryInfo not found")
    entry_info.is_delete = True
    db.commit()
    return {"message": "Deleted successfully"}


user_entry_router = APIRouter(prefix="/userEntry", tags=["用户条目"])

@user_entry_router.get("/", response_model=List[UserEntryResponse])
def list_user_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_entries = db.query(UserEntry).filter(UserEntry.is_delete == False).all()
    return user_entries

@user_entry_router.post("/", response_model=UserEntryResponse)
def create_user_entry(
    user_entry_data: UserEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_entry = UserEntry(**user_entry_data.model_dump())
    db.add(user_entry)
    db.commit()
    db.refresh(user_entry)
    return user_entry

@user_entry_router.get("/{user_entry_id}", response_model=UserEntryResponse)
def get_user_entry(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_entry = db.query(UserEntry).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()
    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")
    return user_entry

@user_entry_router.patch("/{user_entry_id}", response_model=UserEntryResponse)
def update_user_entry(
    user_entry_id: int,
    user_entry_data: UserEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_entry = db.query(UserEntry).filter(UserEntry.id == user_entry_id).first()
    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")
    for field, value in user_entry_data.model_dump(exclude_unset=True).items():
        setattr(user_entry, field, value)
    db.commit()
    db.refresh(user_entry)
    return user_entry

@user_entry_router.delete("/{user_entry_id}")
def delete_user_entry(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_entry = db.query(UserEntry).filter(UserEntry.id == user_entry_id).first()
    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")
    user_entry.is_delete = True
    db.commit()
    return {"message": "Deleted successfully"}
