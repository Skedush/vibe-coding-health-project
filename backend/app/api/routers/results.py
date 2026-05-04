from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.user_entry import UserEntry
from app.models.entry import Entry
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.result import ResultResponse, EntrySimple

router = APIRouter(prefix="/result", tags=["结果"])

@router.get("/{user_entry_id}", response_model=ResultResponse)
def get_result(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录结果，包含关联的条目信息
    旧项目: ResultUserEntryViewset.retrieve
    """
    user_entry = db.query(UserEntry).options(
        joinedload(UserEntry.entries)
    ).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    # 构建返回数据
    entryship = []
    for entry in user_entry.entries:
        entryship.append(EntrySimple(
            id=entry.id,
            title=entry.title or "",
            remark=entry.remark,
            category_id=entry.category_id
        ))

    result = ResultResponse(
        id=user_entry.id,
        entry_info_id=user_entry.entry_info_id,
        name=user_entry.name or "",
        gender=user_entry.gender or "1",
        height=user_entry.height,
        weight=user_entry.weight,
        age=user_entry.age,
        address=user_entry.address,
        waistline=user_entry.waistline,
        systolic_pressure=user_entry.systolic_pressure,
        diastolic_pressure=user_entry.diastolic_pressure,
        blood_sugar=user_entry.blood_sugar,
        remark=user_entry.remark,
        suggestion=user_entry.suggestion,
        phone=user_entry.phone,
        created=user_entry.created,
        entryship=entryship,
        entry_info=None
    )

    return result
