from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import JSONResponse
from app.core.database import engine, Base
from app.core.config import get_settings
from app.api.routers import (
    auth_router, users_router, categories_router, entries_router,
    titles_router, user_entry_info_router, user_entry_router, results_router
)
import os

settings = get_settings()

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="健康管理系统 API",
    description="物业管理健康评估系统 - 基于 FastAPI + React",
    version="1.0.0",
    docs_url=None,  # 禁用默认 docs
    redoc_url=None,  # 禁用默认 redoc
    openapi_url="/api/openapi.json",  # 自定义 OpenAPI JSON 路径
)

# 注册路由
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(entries_router)
app.include_router(titles_router)
app.include_router(user_entry_info_router)
app.include_router(user_entry_router)
app.include_router(results_router)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件 (管理后台页面)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 自定义文档路由
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="健康管理系统 API - Swagger",
        swagger_js_url="https://cdn.bootcdn.net/ajax/libs/swagger-ui/5.10.5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.bootcdn.net/ajax/libs/swagger-ui/5.10.5/swagger-ui.min.css",
    )

@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title="健康管理系统 API - ReDoc",
        redoc_js_url="https://cdn.bootcdn.net/ajax/libs/redoc/2.1.4/redoc.min.js",
    )

@app.get("/api", include_in_schema=False)
async def get_openapi():
    return JSONResponse(content=app.openapi())

@app.get("/")
def root():
    return {"message": "健康管理系统 API", "docs": "/docs", "redoc": "/redoc"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/admin")
def admin():
    from fastapi.responses import FileResponse
    admin_path = os.path.join(os.path.dirname(__file__), "static", "admin.html")
    if os.path.exists(admin_path):
        return FileResponse(admin_path)
    return {"message": "Admin page not found"}
