"""
配置模块 - 使用 Pydantic Settings 管理配置
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    """
    应用配置类
    
    所有敏感配置必须通过环境变量设置，默认值仅用于开发环境。
    生产环境中必须通过环境变量覆盖敏感配置。
    """
    
    # 数据库配置
    DATABASE_URL: str
    
    # 安全配置
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    
    # Token 过期时间（分钟）
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # 管理员账号（仅用于初始化，生产环境建议通过数据库管理）
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """
    获取配置实例（单例模式）
    
    检查敏感配置是否已设置，未设置则抛出异常。
    """
    settings = Settings()
    
    # 验证敏感配置
    required_settings = [
        ("DATABASE_URL", settings.DATABASE_URL),
        ("SECRET_KEY", settings.SECRET_KEY),
        ("JWT_SECRET_KEY", settings.JWT_SECRET_KEY),
    ]
    
    missing_settings = [key for key, value in required_settings if not value]
    
    if missing_settings:
        raise ValueError(
            f"以下必需配置未设置，请在环境变量或 .env 文件中配置：{', '.join(missing_settings)}"
        )
    
    return settings


def ensure_env_file():
    """
    确保 .env 文件存在，如果不存在则创建模板
    """
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    
    if not os.path.exists(env_path):
        with open(env_path, "w") as f:
            f.write("""# 数据库配置
DATABASE_URL=mysql+pymysql://root:root@db:3306/health

# 安全配置（生产环境必须修改为安全的值）
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-here-change-in-production

# Token 过期时间（分钟）
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_MINUTES=1440
""")
        print(f"已创建 .env 文件模板: {env_path}")