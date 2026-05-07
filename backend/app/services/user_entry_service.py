"""
UserEntry Service - 处理用户条目相关业务逻辑
"""
from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from app.models.user_entry import EntryInfo, UserEntry, UserEntryOfEntry
from app.models.entry import Entry
from app.models.user import User
from app.schemas.user_entry import (
    EntryInfoResponse,
    UserEntryResponse,
)


class UserEntryService:
    """用户条目服务"""

    @staticmethod
    def format_entry_info_response(entry_info: EntryInfo, entrys: Optional[List[Entry]] = None) -> EntryInfoResponse:
        """
        格式化 EntryInfo 响应
        
        Args:
            entry_info: EntryInfo 对象
            entrys: 可选的 Entry 列表
        
        Returns:
            EntryInfoResponse: 格式化后的响应
        """
        response_data = {
            "id": entry_info.id,
            "user_id": entry_info.user_id,
            "category_id": entry_info.category_id,
            "title_id": entry_info.title_id,
            "is_delete": entry_info.is_delete,
            "created": entry_info.created,
            "updated": entry_info.updated,
            "category_name": entry_info.category.name if entry_info.category else None,
            "title_name": entry_info.title.title_name if entry_info.title else None,
        }

        if entrys is not None:
            response_data["category"] = {
                "id": entry_info.category.id,
                "name": entry_info.category.name,
                "has_user_rule": entry_info.category.has_user_rule,
            } if entry_info.category else None
            response_data["title"] = {
                "title_name": entry_info.title.title_name,
            } if entry_info.title else None
            response_data["entrys"] = [
                {
                    "id": e.id,
                    "title": e.title,
                    "category_id": e.category_id,
                } for e in entrys
            ] if entrys else []

        return EntryInfoResponse(**response_data)

    @staticmethod
    def get_entry_info_by_id(db: Session, entry_info_id: int) -> EntryInfo:
        """
        根据ID获取条目信息
        
        Args:
            db: 数据库会话
            entry_info_id: 条目信息ID
        
        Returns:
            EntryInfo: 条目信息对象
        
        Raises:
            ValueError: 如果未找到
        """
        entry_info = db.query(EntryInfo).filter(
            EntryInfo.id == entry_info_id,
            EntryInfo.is_delete == False
        ).first()

        if not entry_info:
            raise ValueError("EntryInfo not found")

        return entry_info

    @staticmethod
    def get_entry_info_with_entries(db: Session, entry_info_id: int) -> EntryInfo:
        """
        获取条目信息及其关联的条目
        
        Args:
            db: 数据库会话
            entry_info_id: 条目信息ID
        
        Returns:
            EntryInfo: 条目信息对象（包含预加载的关联数据）
        
        Raises:
            ValueError: 如果未找到
        """
        entry_info = db.query(EntryInfo).options(
            selectinload(EntryInfo.category),
            selectinload(EntryInfo.title),
        ).filter(
            EntryInfo.id == entry_info_id,
            EntryInfo.is_delete == False
        ).first()

        if not entry_info:
            raise ValueError("EntryInfo not found")

        return entry_info

    @staticmethod
    def list_user_entries(
        db: Session,
        current_user: User,
        entry_info: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[UserEntry]:
        """
        获取用户条目列表
        
        Args:
            db: 数据库会话
            current_user: 当前用户
            entry_info: 可选的条目信息ID过滤
            search: 可选的搜索关键词
        
        Returns:
            List[UserEntry]: 用户条目列表
        """
        query = db.query(UserEntry).filter(UserEntry.is_delete == False)

        # 普通用户只能看到与自己entry_info关联的记录
        if not current_user.is_staff:
            query = query.join(EntryInfo).filter(EntryInfo.user_id == current_user.id)

        # 按entry_info过滤（仅staff用户有效）
        if entry_info and current_user.is_staff:
            query = query.filter(UserEntry.entry_info_id == entry_info)

        # 搜索过滤（name, phone, remark）
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (UserEntry.name.like(search_filter)) |
                (UserEntry.phone.like(search_filter)) |
                (UserEntry.remark.like(search_filter))
            )

        return query.all()

    @staticmethod
    def create_user_entry(db: Session, user_entry_dict: dict, entry_ids: Optional[List[int]] = None) -> UserEntry:
        """
        创建用户条目
        
        Args:
            db: 数据库会话
            user_entry_dict: 用户条目数据
            entry_ids: 可选的条目ID列表
        
        Returns:
            UserEntry: 创建的用户条目
        """
        user_entry = UserEntry(**user_entry_dict)
        db.add(user_entry)
        db.commit()
        db.refresh(user_entry)

        # 如果有 entry_ids，创建中间表记录
        if entry_ids:
            for entry_id in entry_ids:
                db.execute(
                    UserEntryOfEntry.insert().values(
                        user_entry_id=user_entry.id,
                        entry_id=entry_id
                    )
                )
            db.commit()

        return user_entry

    @staticmethod
    def get_user_entry(db: Session, user_entry_id: int) -> UserEntry:
        """
        获取用户条目详情
        
        Args:
            db: 数据库会话
            user_entry_id: 用户条目ID
        
        Returns:
            UserEntry: 用户条目对象
        
        Raises:
            ValueError: 如果未找到
        """
        user_entry = db.query(UserEntry).filter(
            UserEntry.id == user_entry_id,
            UserEntry.is_delete == False
        ).first()

        if not user_entry:
            raise ValueError("UserEntry not found")

        return user_entry

    @staticmethod
    def update_user_entry(db: Session, user_entry: UserEntry, update_data: dict) -> UserEntry:
        """
        更新用户条目
        
        Args:
            db: 数据库会话
            user_entry: 用户条目对象
            update_data: 更新数据
        
        Returns:
            UserEntry: 更新后的用户条目
        """
        for field, value in update_data.items():
            setattr(user_entry, field, value)
        db.commit()
        db.refresh(user_entry)
        return user_entry

    @staticmethod
    def soft_delete_user_entry(db: Session, user_entry: UserEntry) -> None:
        """
        软删除用户条目
        
        Args:
            db: 数据库会话
            user_entry: 用户条目对象
        """
        user_entry.is_delete = True
        db.commit()

    @staticmethod
    def get_entry_info_list_by_user(db: Session, user_id: int) -> List[EntryInfo]:
        """
        获取用户的条目信息列表
        
        Args:
            db: 数据库会话
            user_id: 用户ID
        
        Returns:
            List[EntryInfo]: 条目信息列表
        """
        return db.query(EntryInfo).filter(
            EntryInfo.user_id == user_id,
            EntryInfo.is_delete == False
        ).options(
            selectinload(EntryInfo.category),
            selectinload(EntryInfo.title),
        ).all()

    @staticmethod
    def create_entry_info(db: Session, entry_info_data: dict) -> EntryInfo:
        """
        创建条目信息
        
        Args:
            db: 数据库会话
            entry_info_data: 条目信息数据
        
        Returns:
            EntryInfo: 创建的条目信息
        """
        entry_info = EntryInfo(**entry_info_data)
        db.add(entry_info)
        db.commit()
        db.refresh(entry_info)
        return entry_info

    @staticmethod
    def update_entry_info(db: Session, entry_info: EntryInfo, update_data: dict) -> EntryInfo:
        """
        更新条目信息
        
        Args:
            db: 数据库会话
            entry_info: 条目信息对象
            update_data: 更新数据
        
        Returns:
            EntryInfo: 更新后的条目信息
        """
        for field, value in update_data.items():
            setattr(entry_info, field, value)
        db.commit()
        db.refresh(entry_info)
        return entry_info

    @staticmethod
    def soft_delete_entry_info(db: Session, entry_info: EntryInfo) -> None:
        """
        软删除条目信息
        
        Args:
            db: 数据库会话
            entry_info: 条目信息对象
        """
        entry_info.is_delete = True
        db.commit()