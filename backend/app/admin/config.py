from fastapi_admin.models import Admin
from tortoise import Tortoise
from app.models import User, Category, Entry, Title, EntryInfo, UserEntry

async def admin_init():
    """初始化 FastAPI-Admin"""
    await Tortoise.init(
        db_url='mysql://root:root@db:3306/health',
        modules={'models': ['app.models']}
    )
    await Tortoise.generate_schemas()

    # 可以在这里创建初始管理员账号
