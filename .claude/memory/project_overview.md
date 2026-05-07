---
name: project_overview
description: 项目概述、技术栈、目录结构
type: reference
---

# 项目概述 - project-new

## 基本信息

- **项目路径**: `/Users/lii/Desktop/brother/project-new`
- **项目类型**: 健康管理系统 (Health Management System) - 新版重构
- **技术栈**: FastAPI + React + MySQL

## 技术栈

### 后端
- FastAPI 0.115.0 + SQLAlchemy 2.0.35
- MySQL 5.7 + PyMySQL
- JWT 认证 (python-jose) + Passlib
- SQLAdmin 管理后台
- Pydantic 2.9.2

### 前端
- React 18.3.1 + TypeScript 5.5.3
- Vite 5.4.0 + TailwindCSS 3.4.0
- Ant Design 5.20.0
- React Query 5.51.0 + Zustand 4.5.4
- React Router DOM 6.26.0
- Axios + ECharts

## 目录结构

```
project-new/
├── backend/           # FastAPI 后端
│   ├── app/
│   │   ├── main.py    # 入口
│   │   ├── api/routers/  # 路由
│   │   ├── core/      # 配置
│   │   ├── models/    # ORM 模型
│   │   └── schemas/   # Pydantic 模型
│   └── requirements.txt
├── frontend/          # React 前端
│   ├── src/
│   │   ├── api/       # API 客户端
│   │   ├── pages/     # 页面
│   │   ├── routes/    # 路由
│   │   └── stores/     # Zustand 状态
│   └── package.json
└── docker-compose.yml
```

## 与旧版 (project) 的区别

| 项目 | 旧版 (brother/project) | 新版 (project-new) |
|------|----------------------|-------------------|
| 后端框架 | Django 3.0.8 + DRF | FastAPI |
| 前端框架 | UmiJS 2 + Ant Design 3 | React 18 + Vite |
| 状态管理 | Dva | Zustand + React Query |
| 样式 | Less | TailwindCSS |
| 构建工具 | Webpack | Vite |
| 数据库 ORM | Django ORM | SQLAlchemy |
