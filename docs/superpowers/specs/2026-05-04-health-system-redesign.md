# 健康管理系统重建设计方案

## 概述

基于现有项目的业务逻辑，使用最新技术栈进行完全重写。

**目标**：保持功能不变，采用现代技术架构，提升代码质量和可维护性。

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端框架 | FastAPI | 最新稳定版 |
| ORM | SQLAlchemy | 2.x |
| 数据验证 | Pydantic | 2.x |
| 前端框架 | React | 18.x |
| 构建工具 | Vite | 5.x |
| UI 组件库 | Ant Design | 5.x |
| 状态管理 | React Query + Zustand | - |
| 数据库 | MySQL | 5.7 |
| 部署 | Docker | - |
| 包管理 | pnpm workspaces | - |

---

## 目录结构

```
project-new/
├── backend/                      # FastAPI 后端
│   ├── app/
│   │   ├── api/                # API 路由 (routers)
│   │   │   ├── auth.py         # 认证相关
│   │   │   ├── user.py         # 用户相关
│   │   │   ├── category.py    # 分类相关
│   │   │   ├── title.py       # 标题相关
│   │   │   ├── entry.py       # 条目相关
│   │   │   └── user_entry.py  # 用户健康记录
│   │   ├── models/             # SQLAlchemy 模型
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── core/               # 核心配置
│   │   │   ├── config.py      # 配置管理
│   │   │   ├── security.py     # JWT 安全
│   │   │   └── database.py    # 数据库连接
│   │   └── main.py             # 应用入口
│   ├── tests/                   # 测试
│   ├── requirements.txt
│   ├── Dockerfile.dev
│   └── pyproject.toml
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── api/               # API 请求
│   │   ├── components/         # 组件
│   │   ├── pages/             # 页面
│   │   ├── stores/            # Zustand 状态
│   │   ├── hooks/             # React Query hooks
│   │   ├── types/             # 类型定义
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile.dev
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## API 设计

保持与现有项目一致的 API 端点：

### 认证
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | /login | JWT 登录 |
| POST | /register | 用户注册 |
| POST | /refresh | 刷新 token |

### 用户
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /user/ | 获取用户列表 |
| GET | /user/{id}/ | 获取单个用户 |
| PATCH | /user/{id}/ | 更新用户 |

### 分类
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /category/ | 分类列表 |
| POST | /category/ | 创建分类 |
| GET | /category/{id}/ | 获取分类详情 |
| PATCH | /category/{id}/ | 更新分类 |

### 标题
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /title/ | 标题列表 |
| POST | /title/ | 创建标题 |
| GET | /title/{id}/ | 获取标题详情 |
| PATCH | /title/{id}/ | 更新标题 |

### 条目
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /entry/ | 条目列表 |
| POST | /entry/ | 创建条目 |
| GET | /entry/{id}/ | 获取条目详情 |

### 用户健康记录
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /entryInfo/ | 用户条目信息列表 |
| POST | /entryInfo/ | 创建用户条目信息 |
| GET | /entryInfo/{id}/ | 获取详情 |
| PATCH | /entryInfo/{id}/ | 更新 |
| DELETE | /entryInfo/{id}/ | 删除 |

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /userEntry/ | 健康记录列表 |
| POST | /userEntry/ | 创建健康记录 |
| GET | /userEntry/{id}/ | 获取健康记录详情 |
| PATCH | /userEntry/{id}/ | 更新 |
| DELETE | /userEntry/{id}/ | 删除 |

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /result/{id}/ | 获取对比结果 |

---

## 数据模型

### User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| username | str | 用户名 |
| email | str | 邮箱 |
| password | str | 密码哈希 |
| phone | str | 手机号 |
| gender | str | 性别 |
| is_active | bool | 是否激活 |
| is_title | bool | 标题权限 |
| is_vip | bool | VIP |
| is_delete | bool | 软删除 |

### Category
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | str | 分类名称 |
| link | str | 链接 |
| protocol | str | 协议 |
| has_user_rule | bool | 是否加用户规则 |
| child_link | str | 子链接 |

### Title
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user | FK | 用户 |
| title_name | str | 标题名称 |

### Entry
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| category | FK | 分类 |
| title | str | 条目标题 |
| remark | str | 内容 |
| sort | int | 排序 |

### EntryInfo
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user | FK | 用户 |
| category | FK | 分类 |
| title | FK | 标题 |

### UserEntry
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| entry_info | FK | 条目信息 |
| name | str | 姓名 |
| gender | str | 性别 |
| height | float | 身高 |
| weight | float | 体重 |
| age | int | 年龄 |
| address | str | 地址 |
| waistline | float | 腰围 |
| systolic_pressure | float | 收缩压 |
| diastolic_pressure | float | 舒张压 |
| blood_sugar | float | 血糖 |
| remark | text | 备注 |
| suggestion | text | 建议 |
| phone | str | 手机号 |

### UserEntryOfEntry (中间表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user_entry | FK | 健康记录 |
| entry | FK | 条目 |

---

## 项目特点

### 后端
- **类型安全** — Pydantic 自动验证请求/响应
- **自动文档** — FastAPI 自动生成 OpenAPI/Swagger
- **JWT 认证** — token 8小时有效，refresh 24小时
- **统一响应格式** — `{code, message, success, data}`

### 前端
- **Vite HMR** — 极速热更新
- **React Query** — 数据获取和缓存
- **Zustand** — 轻量状态管理
- **TypeScript** — 类型安全
- **Ant Design 5** — 最新 UI 组件库

### 开发环境
- **Docker Compose** — 一键启动所有服务
- **Volume 挂载** — 代码修改自动热更新
- **端口映射** — 后端 8000，前端 3001

---

## 环境变量

### 后端
```
DATABASE_URL=mysql://user:password@db:3306/health
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

### 前端
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 实施计划

### 第一阶段：项目初始化
1. 创建目录结构
2. 配置 pnpm workspace
3. 配置 Docker 和 docker-compose
4. 搭建 FastAPI 基础框架
5. 搭建 React + Vite 基础框架

### 第二阶段：后端核心
1. 数据库模型
2. 认证 API (login, register, refresh)
3. CRUD API 实现
4. 权限控制

### 第三阶段：前端核心
1. API 请求层
2. 登录/注册页面
3. 主页和仪表盘
4. 表单填写页面
5. 结果查看页面

### 第四阶段：完善功能
1. 结果对比功能
2. 分享功能
3. 用户设置页面
4. 样式和主题

---

## 验收标准

- [ ] 所有 API 端点与现有项目功能一致
- [ ] Docker 环境一键启动，热更新正常
- [ ] 用户注册、登录、登出正常
- [ ] 健康记录创建、查看、编辑、删除正常
- [ ] 结果查看和对比正常
- [ ] 代码规范，类型安全
- [ ] 有基本测试覆盖
