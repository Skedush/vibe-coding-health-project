"""
结果路由 - 健康记录结果相关接口
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.result_service import ResultService

router = APIRouter(prefix="/result", tags=["结果"])


@router.get("/{user_entry_id}/info", response_model=ResultService.get_result_info.__annotations__['return'])
def get_result_info(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录基础信息
    """
    try:
        return ResultService.get_result_info(db, user_entry_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{user_entry_id}/groups", response_model=ResultService.get_result_groups.__annotations__['return'])
def get_result_groups(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录分组症状
    实现前端现有的 entryGroups 分组逻辑
    """
    try:
        return ResultService.get_result_groups(db, user_entry_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{user_entry_id}/compare", response_model=ResultService.get_result_compare.__annotations__['return'])
def get_result_compare(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录（Compare 页面用）
    返回基础信息 + 顶级 entry_ids 列表
    """
    try:
        return ResultService.get_result_compare(db, user_entry_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))