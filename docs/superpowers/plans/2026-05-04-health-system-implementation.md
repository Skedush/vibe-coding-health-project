# 健康管理系统重建 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 FastAPI + React 18 + Vite + Ant Design 5 重建健康管理系统

**Architecture:** Monorepo 结构，使用 pnpm workspaces 管理前后端。前后端分离开发，Docker 容器化部署。

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic, React 18, Vite, Ant Design 5, MySQL 5.7, Docker, pnpm

---

## 项目初始化

### Task 1: 创建项目目录结构

**Files:**
- Create: `project-new/pnpm-workspace.yaml`
- Create: `project-new/docker-compose.yml`
- Create: `project-new/README.md`

- [ ] **Step 1: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'backend'
  - 'frontend'
  - 'docs'
```

- [ ] **Step 2: 创建 docker-compose.yml**

```yaml
version: '3.8'
services:
  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: health
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  mysql_data:
```

- [ ] **Step 3: 创建 README.md**

```markdown
# 健康管理系统 (Health Management System)

## 技术栈

- 后端: FastAPI + SQLAlchemy + Pydantic
- 前端: React 18 + Vite + Ant Design 5
- 数据库: MySQL 5.7
- 包管理: pnpm workspaces

## 开发

```bash
# 启动所有服务
docker-compose up -d

# 后端: http://localhost:8000
# 前端: http://localhost:3001
# API 文档: http://localhost:8000/docs
```
```

---

## 后端初始化

### Task 2: 创建 FastAPI 后端基础结构

**Files:**
- Create: `project-new/backend/app/main.py`
- Create: `project-new/backend/app/core/config.py`
- Create: `project-new/backend/app/core/database.py`
- Create: `project-new/backend/app/core/security.py`
- Create: `project-new/backend/requirements.txt`
- Create: `project-new/backend/Dockerfile.dev`
- Create: `project-new/backend/pyproject.toml`

- [ ] **Step 1: 创建目录结构和 requirements.txt**

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
pymysql==1.1.1
cryptography==43.0.1
pydantic==2.9.2
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
```

- [ ] **Step 2: 创建 app/core/config.py**

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:root@db:3306/health"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

- [ ] **Step 3: 创建 app/core/database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 4: 创建 app/core/security.py**

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
```

- [ ] **Step 5: 创建 app/main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.core.config import get_settings

settings = get_settings()

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="健康管理系统 API",
    description="物业管理健康评估系统",
    version="1.0.0"
)

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
```

- [ ] **Step 6: 创建 Dockerfile.dev**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

### Task 3: 创建数据模型

**Files:**
- Create: `project-new/backend/app/models/__init__.py`
- Create: `project-new/backend/app/models/user.py`
- Create: `project-new/backend/app/models/category.py`
- Create: `project-new/backend/app/models/entry.py`
- Create: `project-new/backend/app/models/user_entry.py`

- [ ] **Step 1: 创建 app/models/__init__.py**

```python
from app.models.user import User
from app.models.category import Category
from app.models.entry import Entry
from app.models.user_entry import EntryInfo, UserEntry, UserEntryOfEntry

__all__ = ["User", "Category", "Entry", "EntryInfo", "UserEntry", "UserEntryOfEntry"]
```

- [ ] **Step 2: 创建 app/models/user.py**

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "h_user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    email = Column(String(254), unique=True, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(11))
    gender = Column(String(2), default="1")
    is_active = Column(Boolean, default=False)
    is_title = Column(Boolean, default=False)
    is_vip = Column(Boolean, default=False)
    is_delete = Column(Boolean, default=False)
    date_joined = Column(DateTime, default=datetime.utcnow)
    date_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    titles = relationship("Title", back_populates="user")
    entry_infos = relationship("EntryInfo", back_populates="user")
```

- [ ] **Step 3: 创建 app/models/category.py**

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Category(Base):
    __tablename__ = "h_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    link = Column(String(100))
    protocol = Column(String(100), default="https://")
    has_user_rule = Column(Boolean, default=True)
    child_link = Column(String(100))
    show_count = Column(Integer, default=0)
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    entries = relationship("Entry", back_populates="category")
```

- [ ] **Step 4: 创建 app/models/entry.py**

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, ManyToMany, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Entry(Base):
    __tablename__ = "h_entry"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("h_category.id"))
    title = Column(String(255))
    remark = Column(String(255))
    sort = Column(Integer, default=999)
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    category = relationship("Category", back_populates="entries")

class Title(Base):
    __tablename__ = "h_title"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("h_user.id"))
    title_name = Column(String(20))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    user = relationship("User", back_populates="titles")
```

- [ ] **Step 5: 创建 app/models/user_entry.py**

```python
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, ManyToMany, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class EntryInfo(Base):
    __tablename__ = "h_entry_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("h_user.id"))
    category_id = Column(Integer, ForeignKey("h_category.id"))
    title_id = Column(Integer, ForeignKey("h_title.id"))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    user = relationship("User", back_populates="entry_infos")

class UserEntry(Base):
    __tablename__ = "h_user_entry"

    id = Column(Integer, primary_key=True, index=True)
    entry_info_id = Column(Integer, ForeignKey("h_entry_info.id"))
    name = Column(String(20))
    gender = Column(String(2), default="1")
    height = Column(String(10))  # 改为 float 更合理
    weight = Column(String(10))
    age = Column(String(10))
    address = Column(String(255))
    waistline = Column(String(10))
    systolic_pressure = Column(String(20))
    diastolic_pressure = Column(String(20))
    blood_sugar = Column(String(20))
    remark = Column(Text)
    suggestion = Column(Text)
    phone = Column(String(11))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

class UserEntryOfEntry(Base):
    __tablename__ = "h_userentry_entry"

    id = Column(Integer, primary_key=True, index=True)
    user_entry_id = Column(Integer, ForeignKey("h_user_entry.id"))
    entry_id = Column(Integer, ForeignKey("h_entry.id"))
```

---

### Task 4: 创建 API Schemas

**Files:**
- Create: `project-new/backend/app/schemas/__init__.py`
- Create: `project-new/backend/app/schemas/user.py`
- Create: `project-new/backend/app/schemas/category.py`
- Create: `project-new/backend/app/schemas/entry.py`
- Create: `project-new/backend/app/schemas/user_entry.py`
- Create: `project-new/backend/app/schemas/token.py`

- [ ] **Step 1: 创建 app/schemas/__init__.py**

```python
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.token import Token, TokenRefresh
from app.schemas.category import CategoryCreate, CategoryResponse
from app.schemas.entry import EntryCreate, EntryResponse
from app.schemas.user_entry import EntryInfoCreate, EntryInfoResponse, UserEntryCreate, UserEntryResponse

__all__ = [
    "UserCreate", "UserResponse", "UserUpdate",
    "Token", "TokenRefresh",
    "CategoryCreate", "CategoryResponse",
    "EntryCreate", "EntryResponse",
    "EntryInfoCreate", "EntryInfoResponse",
    "UserEntryCreate", "UserEntryResponse",
]
```

- [ ] **Step 2: 创建 app/schemas/user.py**

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = "1"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_title: bool
    is_vip: bool
    date_joined: datetime

    class Config:
        from_attributes = True
```

- [ ] **Step 3: 创建 app/schemas/token.py**

```python
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str
```

---

### Task 5: 创建认证 API

**Files:**
- Create: `project-new/backend/app/api/deps.py`
- Create: `project-new/backend/app/api/routers/__init__.py`
- Create: `project-new/backend/app/api/routers/auth.py`
- Create: `project-new/backend/app/api/routers/users.py`

- [ ] **Step 1: 创建 app/api/deps.py**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password
from app.core.config import get_settings
from app.models.user import User

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
```

- [ ] **Step 2: 创建 app/api/routers/auth.py**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.config import get_settings
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["认证"])
settings = get_settings()

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # 检查用户名是否存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    from app.core.security import get_password_hash
    user = User(
        username=user_data.username,
        email=user_data.email,
        phone=user_data.phone,
        password=get_password_hash(user_data.password),
        is_active=True  # 注册时直接激活
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
```

- [ ] **Step 3: 更新 app/main.py 添加路由**

```python
from app.api.routers import auth, users

app.include_router(auth.router)
app.include_router(users.router)
```

---

### Task 6: 创建 CRUD API 路由

**Files:**
- Create: `project-new/backend/app/api/routers/categories.py`
- Create: `project-new/backend/app/api/routers/entries.py`
- Create: `project-new/backend/app/api/routers/user_entries.py`

- [ ] **Step 1: 创建 categories.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/category", tags=["分类"])

@router.get("/", response_model=List[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Category).filter(Category.is_delete == False).all()
    return categories

@router.post("/", response_model=CategoryResponse)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = Category(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.is_delete == False
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
```

---

## 前端初始化

### Task 7: 创建 React + Vite 前端基础结构

**Files:**
- Create: `project-new/frontend/package.json`
- Create: `project-new/frontend/vite.config.ts`
- Create: `project-new/frontend/tsconfig.json`
- Create: `project-new/frontend/Dockerfile.dev`
- Create: `project-new/frontend/index.html`
- Create: `project-new/frontend/src/main.tsx`
- Create: `project-new/frontend/src/App.tsx`
- Create: `project-new/frontend/src/api/request.ts`
- Create: `project-new/frontend/src/stores/authStore.ts`
- Create: `project-new/frontend/src/pages/Login.tsx`
- Create: `project-new/frontend/src/pages/Register.tsx`
- Create: `project-new/frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "health-management-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "antd": "^5.20.0",
    "@ant-design/icons": "^5.4.0",
    "axios": "^1.7.2",
    "zustand": "^4.5.4",
    "@tanstack/react-query": "^5.51.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

- [ ] **Step 3: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider locale={zhCN}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 4: 创建 src/App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard/*"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default App
```

- [ ] **Step 5: 创建 src/stores/authStore.ts**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  userInfo: any | null
  isAuthenticated: boolean
  setAuth: (token: string, userInfo: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isAuthenticated: false,
      setAuth: (token, userInfo) =>
        set({ token, userInfo, isAuthenticated: true }),
      logout: () =>
        set({ token: null, userInfo: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

- [ ] **Step 6: 创建 Dockerfile.dev**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3001

CMD ["pnpm", "dev", "--host"]
```

---

### Task 8: 创建 API 请求层

**Files:**
- Create: `project-new/frontend/src/api/request.ts`
- Create: `project-new/frontend/src/api/auth.ts`
- Create: `project-new/frontend/src/api/userEntry.ts`

- [ ] **Step 1: 创建 src/api/request.ts**

```typescript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.success === false) {
      return Promise.reject(data)
    }
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
```

- [ ] **Step 2: 创建 src/api/auth.ts**

```typescript
import request from './request'

interface LoginData {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const login = (data: LoginData) =>
  request.post<LoginResponse>('/auth/login', data)

export const register = (data: any) =>
  request.post('/auth/register', data)
```

- [ ] **Step 3: 创建 src/pages/Login.tsx**

```tsx
import { Form, Input, Button, message, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await login(values)
      setAuth(res.access_token, {})
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error('登录失败')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card title="健康管理系统登录">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/register')}>
            注册账号
          </Button>
        </Form>
      </Card>
    </div>
  )
}
```

---

## 验收测试

### Task 9: 验证完整功能

- [ ] **Step 1: 启动 Docker 服务**

```bash
cd /Users/lii/Desktop/brother/project-new
docker-compose up -d --build
```

- [ ] **Step 2: 验证后端 API**

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试注册
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@test.com"}'

# 测试登录
curl -X POST http://localhost:8000/auth/login \
  -d "username=test&password=test123"
```

- [ ] **Step 3: 验证前端**

打开浏览器访问 http://localhost:3001，验证：
- 用户注册功能
- 用户登录功能
- 登录后跳转到 Dashboard

---

## 实施完成标准

- [ ] Docker 服务正常启动
- [ ] 后端 API 正常响应
- [ ] 前端页面正常渲染
- [ ] 用户注册/登录功能正常
- [ ] Token 正确存储和使用
