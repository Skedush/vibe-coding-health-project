"""
Result Service - 处理健康记录结果相关业务逻辑
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session, selectinload, joinedload
from app.models.user_entry import UserEntry
from app.models.entry import Entry
from app.schemas.result import (
    ResultInfo,
    ResultGroupsResponse,
    EntryGroupResponse,
    GraphDataResponse,
    ResultCompareResponse,
)


class ResultService:
    """健康记录结果服务"""

    @staticmethod
    def get_result_info(db: Session, user_entry_id: int) -> ResultInfo:
        """
        获取用户健康记录基础信息
        
        Args:
            db: 数据库会话
            user_entry_id: 用户条目ID
        
        Returns:
            ResultInfo: 健康记录基础信息
        """
        user_entry = db.query(UserEntry).filter(
            UserEntry.id == user_entry_id,
            UserEntry.is_delete == False
        ).first()

        if not user_entry:
            raise ValueError("UserEntry not found")

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

    @staticmethod
    def get_result_groups(db: Session, user_entry_id: int) -> ResultGroupsResponse:
        """
        获取用户健康记录分组症状
        
        Args:
            db: 数据库会话
            user_entry_id: 用户条目ID
        
        Returns:
            ResultGroupsResponse: 分组结果和图表数据
        """
        user_entry = db.query(UserEntry).options(
            selectinload(UserEntry.entries).joinedload(Entry.category),
            selectinload(UserEntry.entries).selectinload(Entry.entrys).joinedload(Entry.category),
        ).filter(
            UserEntry.id == user_entry_id,
            UserEntry.is_delete == False
        ).first()

        if not user_entry:
            raise ValueError("UserEntry not found")

        # 分组逻辑（必须与前端完全一致）
        groups_map: Dict[int, Dict[str, Any]] = {}

        for entry in user_entry.entries:
            if entry.is_delete:
                continue

            # 1. 处理顶级条目 - 按 category 分组，顶级条目 number=None
            cat_id = entry.category_id
            ResultService._ensure_category_group(groups_map, entry.category, cat_id)
            
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
                    ResultService._ensure_category_group(groups_map, nested.category, nested_cat_id)
                    
                    # 使用字典索引优化查找
                    ResultService._update_entry_number(groups_map[nested_cat_id]["entrys"], nested)

        # 3. 转换为响应格式，每组内按 number 降序排序
        groups = []
        for group_data in groups_map.values():
            group_data["entrys"].sort(
                key=lambda x: (x["number"] if x["number"] is not None else -1),
                reverse=True
            )
            groups.append(EntryGroupResponse(**group_data))

        # 4. 构建力导向图数据
        graph_data = ResultService._build_graph_data(groups_map, user_entry.entries)

        return ResultGroupsResponse(groups=groups, graph=graph_data)

    @staticmethod
    def _ensure_category_group(
        groups_map: Dict[int, Dict[str, Any]],
        category,
        cat_id: int
    ) -> None:
        """确保分类组存在，如果不存在则创建"""
        if cat_id not in groups_map:
            groups_map[cat_id] = {
                "category": {
                    "id": category.id,
                    "name": category.name,
                    "link": category.link,
                    "child_link": category.child_link,
                    "protocol": getattr(category, 'protocol', 'https://'),
                    "show_count": getattr(category, 'show_count', 0),
                },
                "entrys": []
            }

    @staticmethod
    def _update_entry_number(entrys: List[Dict[str, Any]], entry) -> None:
        """更新条目的 number 计数，使用字典索引优化"""
        # 使用生成器表达式快速查找
        existing_entry = next((e for e in entrys if e["id"] == entry.id), None)
        
        if existing_entry:
            existing_entry["number"] = (existing_entry["number"] or 0) + 1
        else:
            entrys.append({
                "id": entry.id,
                "title": entry.title or "",
                "remark": entry.remark,
                "number": 1
            })

    @staticmethod
    def _build_graph_data(
        groups_map: Dict[int, Dict[str, Any]],
        entries: List[Entry]
    ) -> GraphDataResponse:
        """构建力导向图数据"""
        graph_nodes = []
        graph_links = []
        graph_categories = []
        valid_node_ids = set()

        for group_index, group_data in enumerate(groups_map.values()):
            category = group_data["category"]
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
                    symbol_size = ResultService._calculate_symbol_size(number)

                    graph_nodes.append({
                        "id": str(entry["id"]),
                        "name": entry["title"],
                        "category": group_index,
                        "value": entry["number"] or "",
                        "symbolSize": symbol_size,
                    })
                    valid_node_ids.add(entry["id"])

        # 构建 links - 从原始 entries 获取嵌套关系
        for entry in entries:
            if entry.is_delete:
                continue
            if hasattr(entry, 'entrys') and entry.entrys:
                for nested in entry.entrys:
                    if nested.is_delete:
                        continue
                    if entry.id in valid_node_ids and nested.id in valid_node_ids:
                        graph_links.append({
                            "source": str(entry.id),
                            "target": str(nested.id),
                            "label": {"show": False},
                            "ignoreForceLayout": True,
                        })

        return GraphDataResponse(
            nodes=graph_nodes,
            links=graph_links,
            categories=graph_categories,
        )

    @staticmethod
    def _calculate_symbol_size(number: int) -> int:
        """计算节点符号大小"""
        if number > 80:
            return 100
        elif number < 10:
            return 10
        else:
            return number or 30

    @staticmethod
    def get_result_compare(db: Session, user_entry_id: int) -> ResultCompareResponse:
        """
        获取用户健康记录（Compare 页面用）
        
        Args:
            db: 数据库会话
            user_entry_id: 用户条目ID
        
        Returns:
            ResultCompareResponse: 基础信息 + 顶级 entry_ids 列表
        """
        user_entry = db.query(UserEntry).options(
            selectinload(UserEntry.entries),
        ).filter(
            UserEntry.id == user_entry_id,
            UserEntry.is_delete == False
        ).first()

        if not user_entry:
            raise ValueError("UserEntry not found")

        # 获取顶级 entry id 列表（不包含嵌套的 entrys）
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