from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from app.models.user import User
from app.models.category import Category
from app.models.entry import Entry, Title
from app.models.user_entry import EntryInfo, UserEntry
from app.core.config import get_settings
from app.core.database import SessionLocal
import bcrypt

settings = get_settings()


class AdminAuth(AuthenticationBackend):
    """管理后台认证 - 使用数据库用户"""

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        db = SessionLocal()
        try:
            user = db.query(User).filter(
                User.username == username,
                User.is_superuser == True,
                User.is_active == True
            ).first()
            if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                request.session.update({"username": username})
                return True
        finally:
            db.close()
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        username = request.session.get("username")
        if not username:
            return False
        return True


def register_admin(app, engine):
    """注册 SQLAdmin 管理后台"""
    admin = Admin(
        app=app,
        engine=engine,
        title="健康管理系统 - 管理后台",
        authentication_backend=AdminAuth(secret_key=settings.SECRET_KEY),
    )

    # 用户管理
    class UserAdmin(ModelView, model=User):
        column_list = [User.id, User.username, User.email, User.is_active, User.is_vip, User.is_staff, User.date_joined]
        column_labels = {
            User.id: "ID",
            User.username: "用户名",
            User.email: "邮箱",
            User.phone: "手机号",
            User.gender: "性别",
            User.is_active: "已激活",
            User.is_superuser: "超级管理员",
            User.is_staff: "企业用户",
            User.is_vip: "VIP",
            User.is_title: "有标题",
            User.is_delete: "已删除",
            User.date_joined: "注册时间",
        }
        can_delete = False
        column_searchable_list = [User.username, User.email, User.phone]

    # 分类管理
    class CategoryAdmin(ModelView, model=Category):
        column_list = [Category.id, Category.name, Category.link, Category.protocol, Category.has_user_rule, Category.show_count]
        column_labels = {
            Category.id: "ID",
            Category.name: "分类名称",
            Category.link: "链接",
            Category.protocol: "协议",
            Category.has_user_rule: "有用户规则",
            Category.child_link: "子链接",
            Category.show_count: "展示数量",
            Category.is_delete: "已删除",
        }
        column_searchable_list = [Category.name]

    # 条目管理
    class EntryAdmin(ModelView, model=Entry):
        column_list = [Entry.id, Entry.category_id, Entry.title, Entry.remark, Entry.sort]
        column_labels = {
            Entry.id: "ID",
            Entry.category_id: "分类ID",
            Entry.title: "标题",
            Entry.remark: "备注",
            Entry.sort: "排序",
            Entry.is_delete: "已删除",
        }
        column_searchable_list = [Entry.title]
        foreign_key_list = [Entry.category_id]

    # 标题管理
    class TitleAdmin(ModelView, model=Title):
        column_list = [Title.id, Title.user_id, Title.title_name, Title.created]
        column_labels = {
            Title.id: "ID",
            Title.user_id: "用户ID",
            Title.title_name: "标题名称",
            Title.is_delete: "已删除",
        }
        column_searchable_list = [Title.title_name]

    # 条目信息管理
    class EntryInfoAdmin(ModelView, model=EntryInfo):
        column_list = [EntryInfo.id, EntryInfo.user_id, EntryInfo.category_id, EntryInfo.title_id]
        column_labels = {
            EntryInfo.id: "ID",
            EntryInfo.user_id: "用户ID",
            EntryInfo.category_id: "分类ID",
            EntryInfo.title_id: "标题ID",
            EntryInfo.is_delete: "已删除",
        }
        foreign_key_list = [EntryInfo.category_id, EntryInfo.title_id]

    # 用户健康记录管理
    class UserEntryAdmin(ModelView, model=UserEntry):
        column_list = [UserEntry.id, UserEntry.entry_info_id, UserEntry.name, UserEntry.gender, UserEntry.phone, UserEntry.created]
        column_labels = {
            UserEntry.id: "ID",
            UserEntry.entry_info_id: "条目信息ID",
            UserEntry.name: "姓名",
            UserEntry.gender: "性别",
            UserEntry.height: "身高",
            UserEntry.weight: "体重",
            UserEntry.age: "年龄",
            UserEntry.phone: "手机号",
            UserEntry.suggestion: "建议",
            UserEntry.is_delete: "已删除",
        }
        column_searchable_list = [UserEntry.name, UserEntry.phone]
        can_delete = False

    # 注册所有视图
    admin.add_view(UserAdmin)
    admin.add_view(CategoryAdmin)
    admin.add_view(EntryAdmin)
    admin.add_view(TitleAdmin)
    admin.add_view(EntryInfoAdmin)
    admin.add_view(UserEntryAdmin)

    return admin
