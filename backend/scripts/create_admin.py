#!/usr/bin/env python3
"""创建超级管理员用户"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User
import bcrypt


def create_admin(username: str, password: str, email: str = None):
    """使用 bcrypt 直接创建管理员"""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"用户 {username} 已存在")
            return

        # bcrypt 加密密码
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        admin = User(
            username=username,
            email=email or f"{username}@admin.com",
            password=hashed,
            is_staff=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"超级管理员 {username} 创建成功！")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python create_admin.py <用户名> <密码> [邮箱]")
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]
    email = sys.argv[3] if len(sys.argv) > 3 else None

    create_admin(username, password, email)
