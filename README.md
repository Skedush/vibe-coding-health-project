# 健康管理系统 (Health Management System)

物业助手健康管理系统 - 从旧版 Django + UmiJS 重构为 **FastAPI + React** 的新版本。

## 目录

- [架构概览](#架构概览)
- [技术栈](#技术栈)
- [功能模块](#功能模块)
- [目录结构](#目录结构)
- [本地开发](#本地开发)
- [生产部署 (Docker)](#生产部署-docker)
- [云服务器部署](#云服务器部署)
- [数据库迁移](#数据库迁移)
- [环境变量配置](#环境变量配置)
- [API 文档](#api-文档)
- [管理后台](#管理后台)
- [常见问题](#常见问题)

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Nginx (可选反向代理)                      │
│                   端口: 80/443                               │
└─────────────────────────┬─────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Frontend │   │  Backend  │   │   MySQL   │
    │  (React)  │   │ (FastAPI) │   │   5.7    │
    │  :3001    │◄──►  :8000    │◄──►  :3306   │
    └──────────┘   └──────────┘   └──────────┘
```

**架构特点：**
- **前后分离**：前端 React，后端 FastAPI，通过 REST API 通信
- **JWT 认证**：无状态认证，支持 Token 刷新
- **SQLAdmin**：内置可视化管理后台
- **Docker 容器化**：开发生产环境一致

---

## 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.11 | 运行时 |
| FastAPI | 0.115.0 | Web 框架 |
| SQLAlchemy | 2.0.35 | ORM |
| Pydantic | 2.9.2 | 数据验证 |
| MySQL | 5.7 | 数据库 |
| Uvicorn | 0.30.6 | ASGI 服务器 |
| SQLAdmin | 0.24.0 | 管理后台 |
| python-jose | 3.3.0 | JWT 认证 |
| passlib + bcrypt | - | 密码加密 |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.5.3 | 类型安全 |
| Vite | 5.4.0 | 构建工具 |
| Ant Design | 5.20.0 | UI 组件库 |
| TailwindCSS | 3.4.0 | 样式框架 |
| React Query | 5.51.0 | 数据请求 |
| Zustand | 4.5.4 | 状态管理 |
| React Router | 6.26.0 | 路由 |
| ECharts | 5.5.0 | 图表 |
| Axios | 1.7.2 | HTTP 客户端 |

---

## 功能模块

### 1. 用户认证
- 用户注册 / 登录
- JWT Token 认证 (Access Token 8小时 / Refresh Token 24小时)
- 密码修改

### 2. 首页 (Dashboard Home)
- 展示用户的健康记录列表
- 查看记录详情链接
- 复制分享链接
- 权限控制 (普通用户 vs 员工)

### 3. 健康表单 (FillForm)
- 基础信息：姓名、手机、地址、性别
- 医学指标：年龄、身高、体重、腰围、血压、血糖
- 症状选择：
  - **树形结构** (category_id=6)：层级复选框
  - **扁平列表** (category_id=3)：普通复选框
- 表单验证：至少选择 3 个症状
- 提交后生成健康记录

### 4. 健康结果 (Result)
- 基础信息展示
- 备注与意见
- 分组症状展示 (按 category 分组)
- **饼图**：点击查看各分类统计
- **力导向图**：展示症状关联关系
- 生成分享图片 (dom-to-image)

### 5. 结果对比 (Compare)
- 两份健康记录对比
- 医学指标对比
- 症状差异分析

### 6. 管理后台 (SQLAdmin)
- 用户管理 (CRUD)
- 分类管理
- 条目管理
- 标题管理
- 条目信息管理
- 用户健康记录管理

---

## 目录结构

```
project-new/
├── backend/                      # 后端项目
│   ├── app/
│   │   ├── main.py              # FastAPI 入口
│   │   ├── admin.py             # SQLAdmin 管理后台注册
│   │   ├── api/
│   │   │   ├── routers/         # API 路由
│   │   │   │   ├── auth.py      # 认证 (login, register, refresh)
│   │   │   │   ├── users.py     # 用户管理
│   │   │   │   ├── categories.py # 分类管理
│   │   │   │   ├── entries.py   # 条目管理
│   │   │   │   ├── titles.py    # 标题管理
│   │   │   │   ├── user_entries.py # 用户条目
│   │   │   │   └── results.py   # 健康结果
│   │   │   └── deps.py          # 依赖注入
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic Settings 配置
│   │   │   ├── database.py      # SQLAlchemy 数据库连接
│   │   │   └── security.py     # JWT 工具函数
│   │   ├── models/              # SQLAlchemy ORM 模型
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   ├── entry.py
│   │   │   └── user_entry.py
│   │   └── schemas/             # Pydantic 请求/响应模型
│   ├── requirements.txt         # Python 依赖
│   ├── Dockerfile.dev           # 开发 Docker 配置
│   └── pyproject.toml
├── frontend/                     # 前端项目
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts        # Axios 实例
│   │   │   ├── request.ts       # 请求函数 + React Query hooks
│   │   │   └── index.ts         # API 端点定义
│   │   ├── components/          # 公共组件
│   │   ├── hooks/              # 自定义 hooks
│   │   ├── pages/              # 页面组件
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── Dashboard/
│   │   │       ├── Home/        # 首页
│   │   │       ├── FillForm/   # 填写表单
│   │   │       ├── Result/     # 查看结果
│   │   │       ├── Compare/    # 对比结果
│   │   │       ├── User/       # 用户设置
│   │   │       └── Success/    # 提交成功
│   │   ├── routes/             # 路由配置
│   │   ├── stores/             # Zustand 状态管理
│   │   ├── types/              # TypeScript 类型定义
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile.dev
│   └── tailwind.config.js
└── docker-compose.yml           # Docker Compose 配置
```

---

## 本地开发

### 前置条件

- Docker & Docker Compose
- Node.js 18+ (如需本地运行前端)
- Python 3.11+ (如需本地运行后端)

### 快速启动

```bash
# 1. 克隆项目
git clone <repo-url>
cd project-new

# 2. 启动所有服务
docker-compose up -d

# 3. 访问服务
# 前端: http://localhost:3001
# 后端 API: http://localhost:8000
# API 文档: http://localhost:8000/docs
# 管理后台: http://localhost:8000/admin
```

### 查看日志

```bash
# 后端日志
docker-compose logs -f backend

# 前端日志
docker-compose logs -f frontend

# 数据库日志
docker-compose logs -f db
```

### 停止服务

```bash
docker-compose down

# 删除数据卷 (清空数据库)
docker-compose down -v
```

---

## 生产部署 (Docker)

### 1. 服务器准备

推荐配置：
- **CPU**: 2 核+
- **内存**: 4GB+
- **硬盘**: 50GB+
- **系统**: Ubuntu 22.04 LTS

### 2. 安装 Docker

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sudo sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo apt install docker-compose -y
```

### 3. 创建生产环境配置

在项目根目录创建 `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: health
    volumes:
      - mysql_data:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    networks:
      - health_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod  # 创建生产 Dockerfile
    restart: always
    environment:
      DATABASE_URL: mysql+pymysql://root:${MYSQL_ROOT_PASSWORD}@db:3306/health
      SECRET_KEY: ${SECRET_KEY}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      ACCESS_TOKEN_EXPIRE_MINUTES: 480
      REFRESH_TOKEN_EXPIRE_MINUTES: 1440
    depends_on:
      db:
        condition: service_healthy
    networks:
      - health_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod  # 创建生产 Dockerfile
    restart: always
    depends_on:
      - backend
    networks:
      - health_network

volumes:
  mysql_data:

networks:
  health_network:
    driver: bridge
```

### 4. 创建生产环境 .env 文件

```bash
# 在项目根目录创建 .env.prod
MYSQL_ROOT_PASSWORD=your-secure-mysql-password
SECRET_KEY=your-very-long-random-secret-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
```

### 5. 创建生产 Dockerfile

**backend/Dockerfile.prod:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 不使用 --reload，生产环境更稳定
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile.prod:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install -g pnpm && pnpm install

COPY . .

# 构建生产版本
RUN pnpm build

# 使用 nginx 提供静态文件
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 前端路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端文档代理
    location /docs {
        proxy_pass http://backend:8000;
    }

    location /redoc {
        proxy_pass http://backend:8000;
    }

    location /admin {
        proxy_pass http://backend:8000;
    }
}
```

### 6. 部署命令

```bash
# 1. 上传代码到服务器
scp -r project-new user@your-server:/path/to/

# 2. SSH 登录服务器
ssh user@your-server

# 3. 进入项目目录
cd /path/to/project-new

# 4. 设置环境变量
cp .env.example .env.prod
nano .env.prod  # 编辑配置

# 5. 构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 6. 查看状态
docker-compose -f docker-compose.prod.yml ps

# 7. 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 云服务器部署

### 使用 Nginx 反向代理 (推荐)

即使容器内部使用了端口映射，在生产环境建议使用 Nginx 作为反向代理：

1. **域名解析**：将你的域名 A 记录指向服务器 IP
2. **SSL 证书** (可选但强烈推荐)：
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```
3. **Nginx 配置**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
       }

       location /docs {
           proxy_pass http://127.0.0.1:8000;
       }

       location /admin {
           proxy_pass http://127.0.0.1:8000;
       }
   }
   ```

### 防火墙配置

```bash
# 开放端口
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### 使用 PM2 保持后台运行 (备选)

如果不想用 Docker，可以用 PM2:

```bash
# 后端
cd backend
pnpm add -g pm2
pm2 start uvicorn --name "health-backend" -- app.main:app --host 0.0.0.0 --port 8000

# 前端
cd frontend
pm2 start pnpm --name "health-frontend" -- dev -- --host
```

---

## 数据库迁移

### 方式一：自动创建 (开发/测试)

项目配置了 `Base.metadata.create_all(bind=engine)`，启动时会自动创建所有表。

```python
# backend/app/main.py 第 19 行
Base.metadata.create_all(bind=engine)
```

**注意**: 这只创建新表，不会更新已有表结构。

### 方式二：Alembic 迁移 (推荐用于生产)

Alembic 是 SQLAlchemy 官方推荐的迁移工具。

#### 1. 安装 Alembic

```bash
pip install alembic
```

#### 2. 初始化 Alembic

```bash
cd backend
alembic init alembic
```

#### 3. 配置 alembic.ini

```ini
# sqlalchemy.url = driver://user:pass@localhost/dbname
sqlalchemy.url = mysql+pymysql://root:root@localhost:3306/health
```

#### 4. 创建迁移脚本

```bash
# 自动生成迁移
alembic revision --autogenerate -m "add user table"

# 手动创建
alembic revision -m "add user table"
```

#### 5. 执行迁移

```bash
# 升级
alembic upgrade head

# 降级
alembic downgrade -1

# 查看状态
alembic current
alembic history
```

### 方式三：手动 SQL 迁移

对于生产环境，建议手动编写 SQL 确保安全：

```sql
-- 示例：添加新字段
ALTER TABLE h_user ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);

-- 示例：创建索引
CREATE INDEX idx_user_phone ON h_user(phone);
```

### 数据库备份与恢复

```bash
# 备份
docker exec project-new-db-1 mysqldump -uroot -proot health > backup_$(date +%Y%m%d).sql

# 恢复
docker exec -i project-new-db-1 mysql -uroot -proot health < backup_20240101.sql
```

---

## 环境变量配置

### 后端 (.env)

```bash
# 数据库
DATABASE_URL=mysql+pymysql://root:root@db:3306/health

# 安全配置 (生产必须修改!)
SECRET_KEY=your-secret-key-min-32-characters-long
JWT_SECRET_KEY=your-jwt-secret-key-min-32-characters-long

# Token 过期时间
ACCESS_TOKEN_EXPIRE_MINUTES=480   # 8小时
REFRESH_TOKEN_EXPIRE_MINUTES=1440  # 24小时

```

### 前端 (.env.development)

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 前端生产环境 (.env.production)

```bash
VITE_API_BASE_URL=https://your-domain.com
```

---

## API 文档

启动服务后访问:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要接口

| 方法 | 路径 | 描述 | 鉴权 |
|------|------|------|------|
| POST | /auth/login | 登录 | 否 |
| POST | /auth/register | 注册 | 否 |
| POST | /auth/refresh | 刷新 Token | 否 |
| GET | /users/me | 获取当前用户 | 是 |
| PATCH | /users/me | 更新当前用户 | 是 |
| GET | /category/ | 获取所有分类 | 否 |
| GET | /entry/ | 获取所有条目 | 否 |
| GET | /entryInfo/ | 获取条目信息列表 | 是 |
| GET | /entryInfo/{id} | 获取条目信息详情 | 否 |
| POST | /userEntry/ | 创建用户条目 | 否 |
| GET | /userEntry/ | 获取用户条目列表 | 是 |
| GET | /result/{id} | 获取健康结果 | 是 |
| GET | /result/{id}/info | 获取结果详细信息 | 是 |
| GET | /result/{id}/groups | 获取结果分组 | 是 |
| GET | /result/{id}/compare | 获取结果对比 | 是 |

---

## 管理后台

访问 http://localhost:8000/admin

### 登录凭证

使用数据库中 `is_superuser=True` 且 `is_active=True` 的用户账号登录。

### 默认管理员

如果数据库为空，程序不会自动创建管理员。可通过以下方式创建：

```python
# 在 backend 目录执行
python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    username='admin',
    password=get_password_hash('admin123'),
    is_superuser=True,
    is_active=True
)
db.add(admin)
db.commit()
db.close()
print('Admin created')
"
```

---

## 数据模型

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │  Category   │       │    Entry    │
│  (h_user)   │       │ (h_category)│       │  (h_entry)  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ id          │◄──────│ id          │
│ username    │       │ name        │       │ category_id │
│ password    │       │ link        │       │ title       │
│ is_superuser│       │ has_user_   │       │ remark      │
│ is_staff    │       │   rule      │       └─────────────┘
│ is_active   │       └─────────────┘              │
│ is_vip      │                                  │
└─────────────┘       ┌─────────────┐      ┌─────┴─────────┐
        │             │   Title     │      │   Entryship   │
        │             │ (h_title)   │      │(h_entry_ship) │
        │             ├─────────────┤      ├───────────────┤
        │             │ id          │      │ from_entry_id │
        │             │ user_id     │      │ to_entry_id   │
        │             │ title_name  │      │ category_id   │
        │             └─────────────┘      └───────────────┘
        │
        ▼
┌─────────────────────┐       ┌─────────────────────┐
│     EntryInfo       │       │     UserEntry       │
│   (h_entry_info)    │       │  (h_user_entry)     │
├─────────────────────┤       ├─────────────────────┤
│ id                  │       │ id                  │
│ user_id             │◄──────│ entry_info_id       │
│ category_id          │       │ name                │
│ title_id            │       │ gender              │
└─────────────────────┘       │ age, height, weight │
        │                     │ waistline           │
        ▼                     │ systolic_pressure   │
┌─────────────────────┐       │ diastolic_pressure │
│  UserEntryOfEntry   │       │ blood_sugar        │
│ (h_userentry_entry) │       │ remark             │
├─────────────────────┤       │ suggestion         │
│ user_entry_id       │       │ entry_ids (M2M)    │
│ entry_id            │       └─────────────────────┘
└─────────────────────┘
```

---

## 常见问题

### 1. 数据库连接失败

```bash
# 检查数据库是否正常运行
docker-compose ps db

# 检查日志
docker-compose logs db

# 验证连接
docker exec project-new-db-1 mysql -uroot -proot -e "SHOW DATABASES;"
```

### 2. 前端无法访问 API

检查 CORS 配置：
```python
# backend/app/main.py
allow_origins=["http://localhost:3001", "http://localhost:80"]
```

### 3. Token 过期

Access Token 8小时后过期，前端会自动处理刷新。如有问题，清除浏览器缓存重新登录。

### 4. 管理后台登录失败

确认用户 `is_superuser=True` 且 `is_active=True`。

### 5. 迁移数据库表结构

开发环境直接重启容器即可。生产环境建议使用 Alembic。

---

## 开发规范

### Git 提交

使用 Commitizen:
```bash
git cz  # 代替 git commit
```

提交信息规范:
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

### 代码风格

- **后端**: Python PEP 8
- **前端**: ESLint + Prettier + Stylelint

```bash
# 前端代码检查
cd frontend
pnpm lint
pnpm lint:fix
pnpm format
```
