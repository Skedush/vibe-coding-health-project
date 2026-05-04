from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.core.config import get_settings
from app.api.routers import auth_router, users_router

settings = get_settings()

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="健康管理系统 API",
    description="物业管理健康评估系统",
    version="1.0.0"
)

# 注册路由
app.include_router(auth_router)
app.include_router(users_router)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "健康管理系统 API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
