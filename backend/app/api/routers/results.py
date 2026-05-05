from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.user_entry import UserEntry
from app.models.entry import Entry
from app.models.category import Category
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.result import ResultResponse, ResultInfo, EntrySimple, EntryNested, CategorySimple, ResultGroupsResponse, EntryGroupResponse, CategoryForGroup, EntryForGroup, ResultCompareResponse

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


@router.get("/{user_entry_id}/groups", response_model=ResultGroupsResponse)
def get_result_groups(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录分组症状
    实现前端现有的 entryGroups 分组逻辑
    """
    from sqlalchemy.orm import selectinload
    from typing import Dict, Any

    user_entry = db.query(UserEntry).options(
        selectinload(UserEntry.entries).joinedload(Entry.category),
        selectinload(UserEntry.entries).selectinload(Entry.entrys).joinedload(Entry.category),
    ).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    # 分组逻辑（必须与前端完全一致）
    groups_map: Dict[int, Dict[str, Any]] = {}

    for entry in user_entry.entries:
        if entry.is_delete:
            continue

        # 1. 处理顶级条目 - 按 category 分组，顶级条目 number=None
        cat_id = entry.category_id
        if cat_id not in groups_map:
            groups_map[cat_id] = {
                "category": {
                    "id": entry.category.id,
                    "name": entry.category.name,
                    "link": entry.category.link,
                    "child_link": entry.category.child_link,
                    "protocol": getattr(entry.category, 'protocol', 'https://'),
                    "show_count": getattr(entry.category, 'show_count', 0),
                },
                "entrys": []
            }
        # 顶级条目不设置 number
        groups_map[cat_id]["entrys"].append({
            "id": entry.id,
            "title": entry.title or "",
            "number": None
        })

        # 2. 处理嵌套 entrys - 按嵌套条目的 category 分组，number 累加
        if hasattr(entry, 'entrys') and entry.entrys:
            for nested in entry.entrys:
                if nested.is_delete:
                    continue

                nested_cat_id = nested.category_id
                if nested_cat_id not in groups_map:
                    groups_map[nested_cat_id] = {
                        "category": {
                            "id": nested.category.id,
                            "name": nested.category.name,
                            "link": nested.category.link,
                            "child_link": nested.category.child_link,
                            "protocol": getattr(nested.category, 'protocol', 'https://'),
                            "show_count": getattr(nested.category, 'show_count', 0),
                        },
                        "entrys": []
                    }

                # 检查是否已存在该 entry，number 累加
                existing_entry = None
                for e in groups_map[nested_cat_id]["entrys"]:
                    if e["id"] == nested.id:
                        existing_entry = e
                        break

                if existing_entry:
                    existing_entry["number"] = (existing_entry["number"] or 0) + 1
                else:
                    groups_map[nested_cat_id]["entrys"].append({
                        "id": nested.id,
                        "title": nested.title or "",
                        "number": 1
                    })

    # 3. 转换为响应格式，每组内按 number 降序排序
    groups = []
    for group_data in groups_map.values():
        # 排序：number 为 None 的排最后，其余按 number 降序
        group_data["entrys"].sort(
            key=lambda x: (x["number"] if x["number"] is not None else -1),
            reverse=True
        )
        groups.append(EntryGroupResponse(**group_data))

    return ResultGroupsResponse(groups=groups)


@router.get("/{user_entry_id}/compare", response_model=ResultCompareResponse)
def get_result_compare(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录（Compare 页面用）
    返回基础信息 + 顶级 entry_ids 列表
    """
    from sqlalchemy.orm import selectinload

    user_entry = db.query(UserEntry).options(
        selectinload(UserEntry.entries),
    ).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    # 获取顶级 entryship id 列表（不包含嵌套的 entrys）
    entry_ids = [entry.id for entry in user_entry.entries if not entry.is_delete]

    return ResultCompareResponse(
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
        created=user_entry.created,
        remark=user_entry.remark,
        entry_ids=entry_ids,
    )
