from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.user_entry import UserEntry
from app.models.entry import Entry
from app.models.category import Category
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.result import ResultResponse, ResultInfo, EntrySimple, EntryNested, CategorySimple

router = APIRouter(prefix="/result", tags=["结果"])

def build_entry_with_nested(entry: Entry, db: Session) -> dict:
    """构建条目及其嵌套条目"""
    # 获取条目的 category
    category_data = None
    if entry.category:
        category_data = {
            "id": entry.category.id,
            "name": entry.category.name,
            "link": entry.category.link,
            "child_link": entry.category.child_link,
            "protocol": getattr(entry.category, 'protocol', 'https://'),
            "has_user_rule": getattr(entry.category, 'has_user_rule', True),
            "show_count": getattr(entry.category, 'show_count', 0),
        }

    # 获取嵌套的 entrys (通过 Entryship 中间表)
    nested_entrys = []
    if hasattr(entry, 'entrys') and entry.entrys:
        for nested in entry.entrys:
            if nested.is_delete:
                continue
            nested_category_data = None
            if nested.category:
                nested_category_data = {
                    "id": nested.category.id,
                    "name": nested.category.name,
                    "link": nested.category.link,
                    "child_link": nested.category.child_link,
                    "protocol": getattr(nested.category, 'protocol', 'https://'),
                    "has_user_rule": getattr(nested.category, 'has_user_rule', True),
                    "show_count": getattr(nested.category, 'show_count', 0),
                }
            nested_entrys.append({
                "id": nested.id,
                "title": nested.title or "",
                "remark": nested.remark,
                "category_id": nested.category_id,
                "category": nested_category_data,
                "entrys": [],
                # 不设置 number，由前端计算
            })

    return {
        "id": entry.id,
        "title": entry.title or "",
        "remark": entry.remark,
        "category_id": entry.category_id,
        "category": category_data,
        "entrys": nested_entrys,
        # 顶级条目不设置 number，让前端渲染时 undefined > show_count 为 true
    }

@router.get("/{user_entry_id}", response_model=ResultResponse)
def get_result(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录结果，包含关联的条目信息
    老项目: ResultUserEntryViewset.retrieve
    - 需要登录
    - 返回当前用户的记录（通过 entry_info_id 关联）
    """
    from sqlalchemy.orm import selectinload

    user_entry = db.query(UserEntry).options(
        selectinload(UserEntry.entries).joinedload(Entry.category),
        selectinload(UserEntry.entries).selectinload(Entry.entrys).joinedload(Entry.category),
    ).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    # 构建返回数据
    entryship = []
    for entry in user_entry.entries:
        if entry.is_delete:
            continue
        entry_data = build_entry_with_nested(entry, db)
        entryship.append(entry_data)

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


@router.get("/{user_entry_id}/info", response_model=ResultInfo)
def get_result_info(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录基础信息
    """
    user_entry = db.query(UserEntry).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    return ResultInfo(
        id=user_entry.id,
        name=user_entry.name or "",
        gender=user_entry.gender or "1",
        age=user_entry.age,
        height=user_entry.height,
        weight=user_entry.weight,
        waistline=user_entry.waistline,
        systolic_pressure=user_entry.systolic_pressure,
        diastolic_pressure=user_entry.diastolic_pressure,
        blood_sugar=user_entry.blood_sugar,
        phone=user_entry.phone,
        address=user_entry.address,
        created=user_entry.created,
        remark=user_entry.remark,
        suggestion=user_entry.suggestion,
    )
