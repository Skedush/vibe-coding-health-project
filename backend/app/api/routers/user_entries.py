"""
用户条目路由 - 条目信息和用户条目相关接口
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.entry import Entry
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user_entry import EntryInfoCreate, EntryInfoResponse, UserEntryCreate, UserEntryUpdate, UserEntryResponse
from app.services.user_entry_service import UserEntryService

router = APIRouter(prefix="/entryInfo", tags=["条目信息"])


@router.get("/", response_model=List[EntryInfoResponse])
def list_entry_infos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取当前用户的条目信息列表
    老项目: EntryInfoViewset.list - 按 user 过滤
    """
    entry_infos = UserEntryService.get_entry_info_list_by_user(db, current_user.id)
    return [UserEntryService.format_entry_info_response(ei) for ei in entry_infos]


@router.post("/", response_model=EntryInfoResponse)
def create_entry_info(
    entry_info_data: EntryInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建条目信息（需认证）
    老项目: EntryInfoViewset.create
    """
    entry_info = UserEntryService.create_entry_info(db, {**entry_info_data.model_dump(), "user_id": current_user.id})
    return UserEntryService.format_entry_info_response(entry_info)


@router.get("/{entry_info_id}", response_model=EntryInfoResponse)
def get_entry_info(
    entry_info_id: int,
    db: Session = Depends(get_db)
):
    """
    获取条目信息详情（公开，任何人可看）
    老项目: EntryInfoViewset.retrieve - 不过滤用户
    """
    try:
        entry_info = UserEntryService.get_entry_info_with_entries(db, entry_info_id)
        
        # 获取该 category 下的所有 Entry
        entrys = db.query(Entry).filter(
            Entry.category_id == entry_info.category_id,
            Entry.is_delete == False
        ).all()
        
        return UserEntryService.format_entry_info_response(entry_info, entrys)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{entry_info_id}", response_model=EntryInfoResponse)
def update_entry_info(
    entry_info_id: int,
    entry_info_data: EntryInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新条目信息（需认证）
    老项目: EntryInfoViewset.update
    """
    try:
        entry_info = UserEntryService.get_entry_info_by_id(db, entry_info_id)
        if entry_info.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="无权限操作")
        
        entry_info = UserEntryService.update_entry_info(db, entry_info, entry_info_data.model_dump(exclude_unset=True))
        return UserEntryService.format_entry_info_response(entry_info)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{entry_info_id}")
def delete_entry_info(
    entry_info_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除条目信息（需认证）
    老项目: EntryInfoViewset.destroy
    """
    try:
        entry_info = UserEntryService.get_entry_info_by_id(db, entry_info_id)
        if entry_info.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="无权限操作")
        
        UserEntryService.soft_delete_entry_info(db, entry_info)
        return {"message": "Deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


user_entry_router = APIRouter(prefix="/userEntry", tags=["用户条目"])


@user_entry_router.get("/", response_model=List[UserEntryResponse])
def list_user_entries(
    entry_info: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户条目列表
    老项目: UserEntryViewset.list
    - staff用户: 返回全部（可按entry_info过滤）
    - 普通用户: 只返回与自己entry_info关联的记录
    """
    return UserEntryService.list_user_entries(db, current_user, entry_info, search)


@user_entry_router.post("/", response_model=UserEntryResponse)
def create_user_entry(
    user_entry_data: UserEntryCreate,
    db: Session = Depends(get_db)
):
    """
    创建用户条目（公开，无需登录）
    老项目: UserEntryViewset.create - AllowAny
    """
    entry_ids = user_entry_data.entry_ids
    user_entry_dict = user_entry_data.model_dump(exclude={"entry_ids"}, exclude_unset=True)
    return UserEntryService.create_user_entry(db, user_entry_dict, entry_ids)


@user_entry_router.get("/{user_entry_id}", response_model=UserEntryResponse)
def get_user_entry(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户条目详情（需登录）
    老项目: UserEntryViewset.retrieve
    """
    try:
        return UserEntryService.get_user_entry(db, user_entry_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@user_entry_router.patch("/{user_entry_id}", response_model=UserEntryResponse)
def update_user_entry(
    user_entry_id: int,
    user_entry_data: UserEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新用户条目（需登录）
    老项目: UserEntryViewset.update
    """
    try:
        user_entry = UserEntryService.get_user_entry(db, user_entry_id)
        return UserEntryService.update_user_entry(db, user_entry, user_entry_data.model_dump(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@user_entry_router.delete("/{user_entry_id}")
def delete_user_entry(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除用户条目（需登录）
    老项目: UserEntryViewset.destroy
    """
    try:
        user_entry = UserEntryService.get_user_entry(db, user_entry_id)
        UserEntryService.soft_delete_user_entry(db, user_entry)
        return {"message": "Deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))