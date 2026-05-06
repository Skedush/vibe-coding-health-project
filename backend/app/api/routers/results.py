from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.user_entry import UserEntry
from app.models.entry import Entry
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.result import ResultInfo, ResultGroupsResponse, EntryGroupResponse, CategoryForGroup, EntryForGroup, ResultCompareResponse, GraphDataResponse

router = APIRouter(prefix="/result", tags=["结果"])


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
            "remark": entry.remark,
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
                        "remark": nested.remark,
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

    # 4. 构建力导向图数据
    graph_nodes = []
    graph_categories = []

    for group_index, group_data in enumerate(groups_map.values()):
        category = group_data["category"]
        # 添加 category
        graph_categories.append({
            "id": category["id"],
            "name": category["name"],
            "show_count": category.get("show_count", 0) or 0,
        })

        for entry in group_data["entrys"]:
            show_count = category.get("show_count", 0) or 0
            # 显示规则：number > show_count 或 number 为 None
            if (entry["number"] is None) or ((entry["number"] or 0) > show_count):
                number = entry["number"] or 0
                # symbolSize 计算逻辑
                if number > 80:
                    symbol_size = 100
                elif number < 10:
                    symbol_size = 10
                else:
                    symbol_size = number or 30

                graph_nodes.append({
                    "id": str(entry["id"]),
                    "name": entry["title"],
                    "category": group_index,
                    "value": entry["number"] or "",
                    "symbolSize": symbol_size,
                })

    graph_data = GraphDataResponse(
        nodes=graph_nodes,
        links=[],  # links 暂不处理，非关键数据
        categories=graph_categories,
    )

    return ResultGroupsResponse(groups=groups, graph=graph_data)


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
