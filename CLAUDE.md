# CLAUDE.md

物业助手健康管理系统 (Health Management System) - 新版

## 项目概述

这是一个从旧版 Django + UmiJS 重构为 **FastAPI + React** 的新版本健康管理系统。

- **后端**: FastAPI + SQLAlchemy 2.0 + MySQL 5.7 + JWT 认证 + SQLAdmin 管理后台
- **前端**: React 18 + TypeScript + Vite + TailwindCSS + Ant Design + React Query + Zustand
- **部署**: Docker Compose (MySQL + Backend + Frontend)

## 技术栈详情

### 后端 (Python)

```
FastAPI==0.115.0
uvicorn[standard]==0.30.6
SQLAlchemy==2.0.35
PyMySQL==1.1.1
Pydantic==2.9.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
SQLAdmin>=0.3.0
```

### 前端 (Node.js/pnpm)

```
React 18.3.1
TypeScript 5.5.3
Vite 5.4.0
TailwindCSS 3.4.0
Ant Design 5.20.0
@tanstack/react-query 5.51.0
Zustand 4.5.4
React Router DOM 6.26.0
Axios 1.7.2
ECharts 5.5.0
```

## 目录结构

```
project-new/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 入口文件
│   │   ├── admin.py             # SQLAdmin 管理后台注册
│   │   ├── api/
│   │   │   ├── routers/         # API 路由模块
│   │   │   │   ├── auth.py      # 认证 (login, register, refresh)
│   │   │   │   ├── users.py     # 用户管理
│   │   │   │   ├── categories.py # 分类管理
│   │   │   │   ├── entries.py   # 条目管理
│   │   │   │   ├── titles.py    # 标题管理
│   │   │   │   ├── user_entries.py  # 用户条目
│   │   │   │   └── results.py   # 健康结果
│   │   │   └── deps.py          # 依赖注入
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic Settings 配置
│   │   │   ├── database.py      # SQLAlchemy 数据库连接
│   │   │   └── security.py      # JWT 工具函数
│   │   ├── models/              # SQLAlchemy ORM 模型
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   ├── entry.py
│   │   │   └── user_entry.py
│   │   ├── schemas/             # Pydantic 请求/响应模型
│   │   └── static/             # 静态文件 (admin.html)
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile.dev
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts        # Axios 实例配置
│   │   │   ├── request.ts       # 请求函数 + React Query hooks
│   │   │   └── index.ts         # API 端点定义
│   │   ├── components/
│   │   │   └── AuthGuard.tsx    # 路由守卫组件
│   │   ├── pages/
│   │   │   ├── Login/           # 登录页
│   │   │   ├── Register/        # 注册页
│   │   │   └── Dashboard/
│   │   │       ├── Home/        # 首页
│   │   │       ├── FillForm/    # 填写表单
│   │   │       ├── Result/      # 查看结果
│   │   │       ├── Compare/      # 对比结果
│   │   │       ├── User/        # 用户设置
│   │   │       └── Success/     # 提交成功
│   │   ├── routes/
│   │   │   └── index.tsx        # 路由配置
│   │   ├── stores/
│   │   │   ├── authStore.ts     # 认证状态 (Zustand)
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── api.ts           # TypeScript 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile.dev
└── docker-compose.yml
```

## 常用命令

### 后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API 文档
# Swagger: http://localhost:8000/docs
# ReDoc:   http://localhost:8000/redoc
# Admin:   http://localhost:8000/admin
```

### 前端

```bash
cd frontend

# 安装依赖 (使用 pnpm)
pnpm install

# 开发模式 (端口 3001)
pnpm dev

# 生产构建
pnpm build

# 代码检查
pnpm lint
pnpm lint:fix
pnpm format
```

### Docker

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# 停止服务
docker-compose down
```

## API 端点

### 认证
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/login | 登录 |
| POST | /auth/register | 注册 |

### 用户
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /users/me | 获取当前用户 |
| PATCH | /users/me | 更新当前用户 |

### 分类
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /category/ | 获取所有分类 |
| GET | /category/:id | 获取单个分类 |

### 条目
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /entry/ | 获取所有条目 |
| GET | /entry/:id | 获取单个条目 |

### 标题
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /title/ | 获取所有标题 |
| GET | /title/:id | 获取单个标题 |
| PATCH | /title/:id | 更新标题 |

### 条目信息
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /entryInfo/ | 获取所有条目信息 |
| GET | /entryInfo/:id | 获取条目信息详情 |

### 用户条目
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /userEntry/ | 获取用户条目列表 |
| GET | /userEntry/:id | 获取用户条目详情 |
| POST | /userEntry/ | 创建用户条目 |
| PATCH | /userEntry/:id | 更新用户条目 |
| DELETE | /userEntry/:id | 删除用户条目 |

### 健康结果
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /result/:id | 获取健康结果 |
| GET | /result/:id/info | 获取结果详细信息 |
| GET | /result/:id/groups | 获取结果分组 |
| GET | /result/:id/compare | 获取结果对比 |

## 前端路由

| 路径 | 组件 | 描述 | 鉴权 |
|------|------|------|------|
| / | → /dashboard/home | 首页重定向 | - |
| /login | Login | 登录页 | 否 |
| /register | Register | 注册页 | 否 |
| /dashboard/home | Home | 首页 | 是 |
| /dashboard/f/:id | FillForm | 填写表单 | 否 |
| /dashboard/result/:id | Result | 查看结果 | 是 |
| /dashboard/compare/:id/:oneId/:twoId | Compare | 对比结果 | 是 |
| /dashboard/user | User | 用户设置 | 是 |
| /dashboard/success | Success | 提交成功 | 是 |

## 数据模型

```
User (用户)
  ├── is_superuser (超级用户)
  ├── is_staff (员工)
  ├── is_active (激活)
  ├── is_title (有头衔)
  └── is_vip (VIP)

Category (分类)
  ├── name
  ├── link
  ├── child_link
  └── has_user_rule

Entry (条目)
  ├── title
  └── category_id → Category

Title (标题)
  └── title_name

EntryInfo (条目信息)
  ├── user_id → User
  ├── category_id → Category
  ├── title_id → Title
  └── entrys → Entry[]

UserEntry (用户健康记录)
  ├── entry_info_id → EntryInfo
  ├── name, gender, age, height, weight
  ├── waistline (腰围)
  ├── systolic_pressure, diastolic_pressure (血压)
  ├── blood_sugar (血糖)
  ├── phone, remark, suggestion
  └── entry_ids (关联条目ID列表)
```

## 环境配置

### 后端 (.env)
```
DATABASE_URL=mysql+pymysql://root:root@db:3306/health
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480  # 8小时
REFRESH_TOKEN_EXPIRE_MINUTES=1440  # 24小时
```

### 前端 (.env.development)
```
VITE_API_BASE_URL=http://localhost:8000
```

## JWT 认证

- 登录返回 `access_token` 和 `refresh_token`
- Token 有效期: 8 小时
- Refresh 有效期: 24 小时
- 前端在请求头注入: `Authorization: Bearer <token>`

## 数据库

- MySQL 5.7
- 默认数据库名: `health`
- 默认用户: `root`
- 默认密码: `root`

## 开发规范

### 代码风格
- 前端: ESLint + Prettier + Stylelint
- 后端: Python PEP 8 (建议使用 Black 格式化)

### Git 提交
使用 Commitizen:
```bash
git cz  # 代替 git commit
```

### 提交信息规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具
