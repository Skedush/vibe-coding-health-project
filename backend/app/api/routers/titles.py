from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entry import Title
from app.schemas.title import TitleCreate, TitleResponse, TitleUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/title", tags=["标题"])

@router.get("/", response_model=List[TitleResponse])
def list_titles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取标题列表
    老项目: TitleViewset.list
    - superuser: 返回全部
    - 普通用户: 只返回自己的
    """
    if current_user.is_superuser:
        titles = db.query(Title).filter(Title.is_delete == False).all()
    else:
        titles = db.query(Title).filter(
            Title.user_id == current_user.id,
            Title.is_delete == False
        ).all()
    return titles

@router.post("/", response_model=TitleResponse)
def create_title(
    title_data: TitleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建标题（需认证）
    老项目: TitleViewset.create
    """
    title = Title(
        user_id=current_user.id,
        title_name=title_data.title_name
    )
    db.add(title)
    db.commit()
    db.refresh(title)
    return title

@router.get("/{title_id}", response_model=TitleResponse)
def get_title(
    title_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取标题详情（需认证）
    老项目: TitleViewset.retrieve
    """
    title = db.query(Title).filter(
        Title.id == title_id,
        Title.is_delete == False
    ).first()
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    return title

@router.patch("/{title_id}", response_model=TitleResponse)
def update_title(
    title_id: int,
    title_data: TitleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新标题（需认证）
    老项目: TitleViewset.update
    """
    title = db.query(Title).filter(
        Title.id == title_id,
        Title.user_id == current_user.id
    ).first()
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    if title_data.title_name is not None:
        title.title_name = title_data.title_name
    db.commit()
    db.refresh(title)
    return title

@router.delete("/{title_id}")
def delete_title(
    title_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除标题（需认证）
    老项目: TitleViewset.destroy
    """
    title = db.query(Title).filter(
        Title.id == title_id,
        Title.user_id == current_user.id
    ).first()
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    title.is_delete = True
    db.commit()
    return {"message": "Deleted successfully"}
