# 前端完全重写实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧前端完整迁移到新框架（React 18 + Vite + Ant Design 5 + React Query + Zustand）

**Architecture:** 基于函数式组件和 Hooks，API 层参考老项目封装，状态管理用 React Query + Zustand，UI 组件全部使用 Ant Design 5

**Tech Stack:** React 18, Vite, TypeScript, Ant Design 5, React Query, Zustand, React Router v6, ECharts

---

## 第一阶段：项目基础配置

### Task 1: 安装依赖

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: 添加依赖**

```json
{
  "dependencies": {
    "@ant-design/icons": "^5.3.0",
    "@tanstack/react-query": "^5.28.0",
    "antd": "^5.15.0",
    "axios": "^1.6.8",
    "echarts": "^5.5.0",
    "echarts-for-react": "^3.0.2",
    "lodash": "^4.17.21",
    "path-to-regexp": "^6.2.2",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/lodash": "^4.17.0",
    "@types/node": "^20.11.0",
    "@types/react-router-dom": "^5.3.3"
  }
}
```

- [ ] **Step 2: 运行安装**

```bash
cd frontend && pnpm install
```

---

### Task 2: 配置 Vite 和 TypeScript

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/tsconfig.json`

- [ ] **Step 1: 配置 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

- [ ] **Step 2: 配置 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 第二阶段：API 层封装

### Task 3: 创建 API 端点定义

**Files:**
- Create: `frontend/src/api/index.ts`

- [ ] **Step 1: 创建 API 端点定义文件**

```typescript
export default {
  // 认证
  login: 'POST /auth/login',
  register: 'POST /auth/register',

  // 用户
  getCurrentUser: 'GET /users/me',
  updateCurrentUser: 'PATCH /users/me',

  // 分类
  getCategories: 'GET /category/',
  getCategory: 'GET /category/{id}',

  // 条目
  getEntries: 'GET /entry/',
  getEntry: 'GET /entry/{id}',

  // 标题
  getTitles: 'GET /title/',
  getTitle: 'GET /title/{id}',
  updateTitle: 'PATCH /title/{id}',

  // 条目信息
  getEntryInfoList: 'GET /entryInfo/',
  getEntryInfoDetail: 'GET /entryInfo/{id}',

  // 用户条目
  getUserEntryList: 'GET /userEntry/',
  getUserEntry: 'GET /userEntry/{id}',
  addUserEntry: 'POST /userEntry/',
  updateUserEntry: 'PATCH /userEntry/{id}',
  deleteUserEntry: 'DELETE /userEntry/{id}',

  // 结果
  getResult: 'GET /result/{id}',
}
```

---

### Task 4: 创建 axios 封装

**Files:**
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: 创建 axios 封装**

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { useAuthStore } from '@/stores/authStore'

const BASE_URL = '/api'

// 创建 axios 实例
const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: false,
})

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
client.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    const msg = (error.response?.data as any)?.detail || error.message
    message.error(msg || '请求失败')
    return Promise.reject(error)
  }
)

// RESTful URL 参数替换
function matchRestfulUrl(url: string, data: Record<string, any>): string {
  let newUrl = url
  try {
    const match = pathToRegexp.parse(newUrl)
    newUrl = pathToRegexp.compile(newUrl)(data)
    for (const item of match) {
      if (item instanceof Object && item.name in data) {
        delete data[item.name]
      }
    }
  } catch (e) {
    newUrl = url
  }
  return newUrl
}

// 请求方法
interface RequestOptions extends AxiosRequestConfig {
  autoMessage?: boolean
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { data, url, method = 'get', autoMessage = true, ...rest } = options

  if (!url) {
    throw new Error('request url none')
  }

  let finalUrl = url
  const cloneData = data ? { ...data } : {}

  // GET 请求处理 query 参数
  if (method.toLowerCase() === 'get' && Object.keys(cloneData).length > 0) {
    finalUrl = `${finalUrl}?${new URLSearchParams(cloneData).toString()}`
  }

  try {
    const response = await client({
      url: finalUrl,
      method,
      data: method.toLowerCase() !== 'get' ? cloneData : undefined,
      ...rest,
    })

    const responseData = response.data

    // 自动成功消息（针对 CRUD 操作）
    if (autoMessage) {
      const action = url.split('/').pop()
      const successActions = ['add', 'create', 'update', 'delete', 'register']
      if (successActions.includes(action || '')) {
        message.success('操作成功')
      }
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export default client
```

---

### Task 5: 创建 React Query 封装

**Files:**
- Create: `frontend/src/api/request.ts`

- [ ] **Step 1: 创建 React Query 封装**

```typescript
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { request } from './client'
import api from './index'

// API 生成器
const gen = <T = any>(
  apiString: string,
  options?: RequestInit
): ((data?: any, config?: RequestInit) => Promise<T>) => {
  return (data?: any, config?: RequestInit) => {
    const [method, url] = apiString.split(' ') as [string, string]
    return request({
      method: method.toLowerCase() as any,
      url,
      data,
      ...options,
      ...config,
    })
  }
}

// 生成 API 函数
const API = {
  login: gen(api.login),
  register: gen(api.register),
  getCurrentUser: gen(api.getCurrentUser),
  updateCurrentUser: gen(api.updateCurrentUser),
  getCategories: gen(api.getCategories),
  getCategory: gen(api.getCategory),
  getEntries: gen(api.getEntries),
  getEntry: gen(api.getEntry),
  getTitles: gen(api.getTitles),
  getTitle: gen(api.getTitle),
  updateTitle: gen(api.updateTitle),
  getEntryInfoList: gen(api.getEntryInfoList),
  getEntryInfoDetail: gen(api.getEntryInfoDetail),
  getUserEntryList: gen(api.getUserEntryList),
  getUserEntry: gen(api.getUserEntry),
  addUserEntry: gen(api.addUserEntry),
  updateUserEntry: gen(api.updateUserEntry),
  deleteUserEntry: gen(api.deleteUserEntry),
  getResult: gen(api.getResult),
}

export { API }

// React Query hooks
export function useLogin() {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) => API.login(data),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { username: string; password: string; email?: string }) =>
      API.register(data),
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => API.getCurrentUser() as Promise<any>,
  })
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: (data: any) => API.updateCurrentUser(data),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => API.getCategories() as Promise<any[]>,
  })
}

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: () => API.getEntries() as Promise<any[]>,
  })
}

export function useEntry(id: number) {
  return useQuery({
    queryKey: ['entry', id],
    queryFn: () => API.getEntry({ id }) as Promise<any>,
    enabled: !!id,
  })
}

export function useEntryInfoList() {
  return useQuery({
    queryKey: ['entryInfoList'],
    queryFn: () => API.getEntryInfoList() as Promise<any[]>,
  })
}

export function useEntryInfoDetail(id: number) {
  return useQuery({
    queryKey: ['entryInfoDetail', id],
    queryFn: () => API.getEntryInfoDetail({ id }) as Promise<any>,
    enabled: !!id,
  })
}

export function useUserEntryList(params?: { entry_info?: number; page?: number; search?: string }) {
  return useQuery({
    queryKey: ['userEntryList', params],
    queryFn: () => API.getUserEntryList(params) as Promise<any>,
  })
}

export function useUserEntry(id: number) {
  return useQuery({
    queryKey: ['userEntry', id],
    queryFn: () => API.getUserEntry({ id }) as Promise<any>,
    enabled: !!id,
  })
}

export function useAddUserEntry() {
  return useMutation({
    mutationFn: (data: any) => API.addUserEntry(data),
  })
}

export function useUpdateUserEntry() {
  return useMutation({
    mutationFn: (data: any) => API.updateUserEntry(data),
  })
}

export function useDeleteUserEntry() {
  return useMutation({
    mutationFn: (id: number) => API.deleteUserEntry({ id }),
  })
}

export function useResult(id: number) {
  return useQuery({
    queryKey: ['result', id],
    queryFn: () => API.getResult({ id }) as Promise<any>,
    enabled: !!id,
  })
}

export function useTitles() {
  return useQuery({
    queryKey: ['titles'],
    queryFn: () => API.getTitles() as Promise<any[]>,
  })
}

export function useTitle(id: number) {
  return useQuery({
    queryKey: ['title', id],
    queryFn: () => API.getTitle({ id }) as Promise<any>,
    enabled: !!id,
  })
}

export function useUpdateTitle() {
  return useMutation({
    mutationFn: (data: any) => API.updateTitle(data),
  })
}
```

---

## 第三阶段：布局和认证

### Task 6: 扩展 Zustand Auth Store

**Files:**
- Modify: `frontend/src/stores/authStore.ts`

- [ ] **Step 1: 扩展 authStore**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email?: string
  is_superuser?: boolean
  is_staff?: boolean
  is_title?: boolean
  is_vip?: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

---

### Task 7: 创建布局组件

**Files:**
- Create: `frontend/src/layouts/AuthLayout.tsx`
- Create: `frontend/src/layouts/DashboardLayout.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建 AuthLayout**

```tsx
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard/home" replace />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f3f5' }}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 创建 DashboardLayout**

```tsx
import { ReactNode } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Header, Sider, Content } = Layout

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuthStore()

  const menuItems = [
    { key: '/dashboard/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/dashboard/user', icon: <UserOutlined />, label: '用户设置' },
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529', padding: '0 24px' }}>
        <div style={{ color: 'white', fontSize: 18 }}>健康管理系统</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'white' }}>{user?.username}</span>
          <Button type="link" onClick={handleLogout} style={{ color: 'white', padding: 0 }}>
            <LogoutOutlined /> 退出
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: '100%' }}
          />
        </Sider>
        <Content style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
```

- [ ] **Step 3: 更新 App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Dashboard/Home'
import FillForm from './pages/Dashboard/FillForm'
import Result from './pages/Dashboard/Result'
import Compare from './pages/Dashboard/Compare'
import User from './pages/Dashboard/User'
import Success from './pages/Dashboard/Success'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/home" element={<Home />} />
          <Route path="/dashboard/f/:id" element={<FillForm />} />
          <Route path="/dashboard/result/:id" element={<Result />} />
          <Route path="/dashboard/compare/:id/:oneId/:twoId" element={<Compare />} />
          <Route path="/dashboard/user" element={<User />} />
          <Route path="/dashboard/success" element={<Success />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
```

---

## 第四阶段：页面实现

### Task 8: 实现登录/注册页面

**Files:**
- Modify: `frontend/src/pages/Login/index.tsx`
- Modify: `frontend/src/pages/Register/index.tsx`

- [ ] **Step 1: 实现登录页面**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useLogin } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { useCurrentUser } from '@/api/request'

export default function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { login } = useAuthStore()
  const { refetch: fetchUser } = useCurrentUser()

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await loginMutation.mutateAsync(values)
      login(response.access_token, response as any)
      await fetchUser()
      message.success('登录成功')
      navigate('/dashboard/home')
    } catch (error) {
      message.error('登录失败')
    }
  }

  return (
    <Card title="健康管理系统 - 登录" style={{ width: 400 }}>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loginMutation.isPending}>
            登录
          </Button>
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          还没有账号？<a href="/register">立即注册</a>
        </div>
      </Form>
    </Card>
  )
}
```

- [ ] **Step 2: 实现注册页面**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRegister } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { useCurrentUser } from '@/api/request'

export default function Register() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const { login } = useAuthStore()
  const { refetch: fetchUser } = useCurrentUser()

  const onFinish = async (values: { username: string; password: string; email?: string }) => {
    try {
      const response = await registerMutation.mutateAsync(values)
      login(response.access_token, response as any)
      await fetchUser()
      message.success('注册成功')
      navigate('/dashboard/home')
    } catch (error) {
      message.error('注册失败')
    }
  }

  return (
    <Card title="健康管理系统 - 注册" style={{ width: 400 }}>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
          <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={registerMutation.isPending}>
            注册
          </Button>
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          已有账号？<a href="/login">立即登录</a>
        </div>
      </Form>
    </Card>
  )
}
```

---

### Task 9: 实现首页

**Files:**
- Create: `frontend/src/pages/Dashboard/Home/index.tsx`

- [ ] **Step 1: 实现首页**

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Tabs, Button, Input, Modal, Form, message, Checkbox, Affix } from 'antd'
import { DeleteOutlined, EyeOutlined, LinkOutlined, EditOutlined } from '@ant-design/icons'
import { useEntryInfoList, useUserEntryList, useDeleteUserEntry } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { ECharts } from 'echarts-for-react'

const { Search } = Input

export default function Home() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [selectedEntryInfo, setSelectedEntryInfo] = useState<string>('')
  const [searchParams, setSearchParams] = useState<{ page?: number; search?: string }>({})
  const [compareMode, setCompareMode] = useState(false)
  const [checkedList, setCheckedList] = useState<string[]>([])

  const { data: entryInfoList = [] } = useEntryInfoList()
  const { data: userEntryList, isLoading } = useUserEntryList({
    entry_info: selectedEntryInfo as any,
    ...searchParams,
  })
  const deleteMutation = useDeleteUserEntry()

  const isStaff = user?.is_staff
  const isSuperUser = user?.is_superuser

  useEffect(() => {
    if (entryInfoList.length > 0 && !selectedEntryInfo) {
      setSelectedEntryInfo(entryInfoList[0].id.toString())
    }
  }, [entryInfoList])

  const handleTabChange = (key: string) => {
    setSelectedEntryInfo(key)
    setCheckedList([])
    setCompareMode(false)
  }

  const handleSearch = (value: string) => {
    setSearchParams({ ...searchParams, search: value, page: 1 })
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success('删除成功')
          queryClient.invalidateQueries({ queryKey: ['userEntryList'] })
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const handleCompare = () => {
    if (checkedList.length === 2) {
      navigate(`/dashboard/compare/${selectedEntryInfo}/${checkedList[0]}/${checkedList[1]}`)
    } else {
      setCompareMode(!compareMode)
      setCheckedList([])
    }
  }

  const handleCheckboxChange = (checked: boolean, id: string) => {
    if (checked) {
      if (checkedList.length < 2) {
        setCheckedList([...checkedList, id])
      }
    } else {
      setCheckedList(checkedList.filter((item) => item !== id))
    }
  }

  const handleNavForm = () => {
    if (entryInfoList.length === 1) {
      navigate(`/dashboard/f/${entryInfoList[0].id}`)
    } else {
      Modal.info({
        title: '选择表单',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {entryInfoList.map((item: any) => (
              <Button key={item.id} type="primary" onClick={() => navigate(`/dashboard/f/${item.id}`)}>
                {item.title?.title_name}
              </Button>
            ))}
          </div>
        ),
      })
    }
  }

  return (
    <div>
      {/* 分享链接区域 */}
      {isStaff && (
        <div style={{ marginBottom: 16 }}>
          {entryInfoList.map((item: any) => (
            <div key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{item.title?.title_name}:</span>
              <a href={`/?id=${item.id}`} target="_blank" rel="noopener noreferrer">
                {`${window.location.origin}/?id=${item.id}`}
              </a>
              <Button
                type="link"
                icon={<LinkOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?id=${item.id}`)
                  message.success('链接已复制')
                }}
              >
                复制
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 填表按钮 */}
      {!isStaff && (
        <Button type="primary" onClick={handleNavForm} style={{ marginBottom: 16 }}>
          点此填表
        </Button>
      )}

      {/* 搜索 */}
      {isStaff && (
        <Search placeholder="搜索姓名或电话" onSearch={handleSearch} style={{ marginBottom: 16 }} />
      )}

      {/* 列表 */}
      {entryInfoList.length > 0 && (
        <Tabs
          activeKey={selectedEntryInfo}
          onChange={handleTabChange}
          type="card"
          items={entryInfoList.map((item: any) => ({
            key: item.id.toString(),
            label: item.title?.title_name,
            children: (
              <List
                loading={isLoading}
                dataSource={userEntryList?.content || []}
                renderItem={(record: any) => (
                  <List.Item
                    actions={[
                      <Button key="detail" type="link" icon={<EyeOutlined />} onClick={() => navigate(`/dashboard/result/${record.id}`)}>
                        查看
                      </Button>,
                      ...(isSuperUser || !isStaff
                        ? [
                            <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
                              删除
                            </Button>,
                          ]
                        : []),
                    ]}
                  >
                    {compareMode && isStaff && (
                      <Checkbox
                        checked={checkedList.includes(record.id.toString())}
                        onChange={(e) => handleCheckboxChange(e.target.checked, record.id.toString())}
                        style={{ marginRight: 8 }}
                      />
                    )}
                    {isStaff ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <a onClick={() => navigate(`/dashboard/result/${record.id}`)}>{record.name}</a>
                        </div>
                        <div>{record.phone}</div>
                        <div>{record.created}</div>
                      </div>
                    ) : (
                      <div>{record.created}</div>
                    )}
                  </List.Item>
                )}
              />
            ),
          }))}
        />
      )}

      {/* 对比按钮 */}
      {isStaff && selectedEntryInfo && (
        <Affix style={{ position: 'fixed', bottom: 24, right: 24 }}>
          <Button type="primary" onClick={handleCompare}>
            {compareMode ? '取消对比' : '对比'}
          </Button>
        </Affix>
      )}
    </div>
  )
}
```

---

### Task 10: 实现填写表单页

**Files:**
- Create: `frontend/src/pages/Dashboard/FillForm/index.tsx`

- [ ] **Step 1: 实现填写表单页**

```tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Spin, Select } from 'antd'
import { useEntryInfoDetail, useAddUserEntry } from '@/api/request'

const { Option } = Select

export default function FillForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { data: entryInfoDetail, isLoading } = useEntryInfoDetail(Number(id))
  const addMutation = useAddUserEntry()

  const onFinish = async (values: any) => {
    try {
      await addMutation.mutateAsync({
        entry_info_id: Number(id),
        ...values,
      })
      message.success('提交成功')
      navigate('/dashboard/success')
    } catch {
      message.error('提交失败')
    }
  }

  return (
    <Card title={entryInfoDetail?.title?.title_name || '健康自检表'}>
      <Spin spinning={isLoading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {entryInfoDetail?.entrys?.map((entry: any) => (
            <Form.Item
              key={entry.id}
              name={`entry_${entry.id}`}
              label={entry.title}
              rules={[{ required: entry.category?.has_user_rule, message: `请填写${entry.title}` }]}
            >
              {entry.category?.link ? (
                <Input.TextArea rows={3} placeholder="请输入" />
              ) : entry.category?.child_link ? (
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {entry.category.child_link.split(',').map((opt: string) => (
                    <Option key={opt} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input placeholder="请输入" />
              )}
            </Form.Item>
          ))}

          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input maxLength={10} />
          </Form.Item>

          <Form.Item name="gender" label="性别" initialValue="1">
            <Select>
              <Option value="1">男</Option>
              <Option value="0">女</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input maxLength={11} />
          </Form.Item>

          <Form.Item name="age" label="年龄">
            <Input />
          </Form.Item>

          <Form.Item name="height" label="身高">
            <Input suffix="cm" />
          </Form.Item>

          <Form.Item name="weight" label="体重">
            <Input suffix="kg" />
          </Form.Item>

          <Form.Item name="waistline" label="腰围">
            <Input suffix="cm" />
          </Form.Item>

          <Form.Item name="systolic_pressure" label="收缩压">
            <Input suffix="mmHg" />
          </Form.Item>

          <Form.Item name="diastolic_pressure" label="舒张压">
            <Input suffix="mmHg" />
          </Form.Item>

          <Form.Item name="blood_sugar" label="血糖">
            <Input suffix="mmol/L" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={addMutation.isPending}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  )
}
```

---

### Task 11: 实现结果查看页

**Files:**
- Create: `frontend/src/pages/Dashboard/Result/index.tsx`
- Create: `frontend/src/pages/Dashboard/Result/components/PieChart.tsx`
- Create: `frontend/src/pages/Dashboard/Result/components/GraphChart.tsx`

- [ ] **Step 1: 实现结果页**

```tsx
import { useParams } from 'react-router-dom'
import { Card, Spin, Descriptions, Modal, Button } from 'antd'
import { useResult } from '@/api/request'
import { PieChart } from './components/PieChart'
import { GraphChart } from './components/GraphChart'

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const { data: result, isLoading } = useResult(Number(id))

  if (isLoading) {
    return <Spin tip="加载中..." />
  }

  if (!result) {
    return <div>未找到结果</div>
  }

  return (
    <div>
      <Card title={result.name ? `${result.name} 的健康报告` : '健康报告'}>
        <Descriptions column={2}>
          <Descriptions.Item label="性别">{result.gender === '1' ? '男' : '女'}</Descriptions.Item>
          <Descriptions.Item label="年龄">{result.age || '-'}</Descriptions.Item>
          <Descriptions.Item label="身高">{result.height ? `${result.height} cm` : '-'}</Descriptions.Item>
          <Descriptions.Item label="体重">{result.weight ? `${result.weight} kg` : '-'}</Descriptions.Item>
          <Descriptions.Item label="腰围">{result.waistline ? `${result.waistline} cm` : '-'}</Descriptions.Item>
          <Descriptions.Item label="血压">{`${result.systolic_pressure || '-'}/${result.diastolic_pressure || '-'} mmHg`}</Descriptions.Item>
          <Descriptions.Item label="血糖">{result.blood_sugar ? `${result.blood_sugar} mmol/L` : '-'}</Descriptions.Item>
          <Descriptions.Item label="手机">{result.phone || '-'}</Descriptions.Item>
        </Descriptions>

        {result.remark && (
          <Descriptions.Item label="备注">{result.remark}</Descriptions.Item>
        )}

        {result.suggestion && (
          <Descriptions.Item label="建议">{result.suggestion}</Descriptions.Item>
        )}
      </Card>

      {/* 图表 */}
      {result.entryship && result.entryship.length > 0 && (
        <Card title="健康分析" style={{ marginTop: 16 }}>
          <PieChart data={result.entryship} />
          <GraphChart data={result.entryship} />
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建饼图组件**

```tsx
import ReactECharts from 'echarts-for-react'

interface PieChartProps {
  data: any[]
}

export function PieChart({ data }: PieChartProps) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%)',
    },
    legend: {
      type: 'scroll',
      data: data.map((item) => item.title),
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: data.map((item) => ({
          name: item.title,
          value: item.number || 0,
        })),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 300 }} />
}
```

- [ ] **Step 3: 创建关系图组件**

```tsx
import ReactECharts from 'echarts-for-react'

interface GraphChartProps {
  data: any[]
}

export function GraphChart({ data }: GraphChartProps) {
  const categories = [...new Set(data.map((item) => item.category?.name))].map((name) => ({ name }))

  const nodes = data.map((item) => ({
    name: item.title,
    category: item.category?.name,
  }))

  const option = {
    tooltip: {},
    legend: {
      type: 'scroll',
      data: categories.map((c) => c.name),
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: 50,
        roam: true,
        label: {
          show: true,
        },
        categories: categories,
        edgeSymbol: ['circle', 'arrow'],
        data: nodes,
        links: data
          .filter((item) => item.category?.has_user_rule)
          .map((item) => ({
            source: item.title,
            target: data[0]?.title || '',
          })),
        lineStyle: {
          curveness: 0.3,
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 400 }} />
}
```

---

### Task 12: 实现结果对比页

**Files:**
- Create: `frontend/src/pages/Dashboard/Compare/index.tsx`

- [ ] **Step 1: 实现结果对比页**

```tsx
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Spin, Descriptions, Table } from 'antd'
import { useResult } from '@/api/request'

export default function Compare() {
  const { id, oneId, twoId } = useParams<{ id: string; oneId: string; twoId: string }>()

  const { data: result1, isLoading: loading1 } = useResult(Number(oneId))
  const { data: result2, isLoading: loading2 } = useResult(Number(twoId))

  if (loading1 || loading2) {
    return <Spin />
  }

  const fields = [
    { key: 'name', label: '姓名' },
    { key: 'gender', label: '性别', render: (v: string) => v === '1' ? '男' : '女' },
    { key: 'age', label: '年龄' },
    { key: 'height', label: '身高' },
    { key: 'weight', label: '体重' },
    { key: 'waistline', label: '腰围' },
    { key: 'systolic_pressure', label: '收缩压' },
    { key: 'diastolic_pressure', label: '舒张压' },
    { key: 'blood_sugar', label: '血糖' },
  ]

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title={result1?.name || '记录1'}>
          <Descriptions column={1}>
            {fields.map((field) => (
              <Descriptions.Item key={field.key} label={field.label}>
                {field.render ? field.render(result1?.[field.key]) : result1?.[field.key] || '-'}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      </Col>
      <Col span={12}>
        <Card title={result2?.name || '记录2'}>
          <Descriptions column={1}>
            {fields.map((field) => (
              <Descriptions.Item key={field.key} label={field.label}>
                {field.render ? field.render(result2?.[field.key]) : result2?.[field.key] || '-'}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      </Col>
    </Row>
  )
}
```

---

### Task 13: 实现用户设置页

**Files:**
- Create: `frontend/src/pages/Dashboard/User/index.tsx`

- [ ] **Step 1: 实现用户设置页**

```tsx
import { useState } from 'react'
import { Card, Form, Input, Button, message, Tabs } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateUser } from '@/api/request'

export default function User() {
  const { user, setUser } = useAuthStore()
  const [form] = Form.useForm()
  const updateMutation = useUpdateUser()

  const onPasswordSubmit = async (values: { password: string }) => {
    try {
      await updateMutation.mutateAsync(values)
      message.success('密码修改成功')
    } catch {
      message.error('密码修改失败')
    }
  }

  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'password',
            label: '修改密码',
            children: (
              <Form form={form} layout="vertical" onFinish={onPasswordSubmit}>
                <Form.Item
                  name="password"
                  label="新密码"
                  rules={[{ required: true, message: '请输入新密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                    确定
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Card>
  )
}
```

---

### Task 14: 实现提交成功页

**Files:**
- Create: `frontend/src/pages/Dashboard/Success/index.tsx`

- [ ] **Step 1: 实现提交成功页**

```tsx
import { useNavigate } from 'react-router-dom'
import { Result, Button, Card } from 'antd'

export default function Success() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <Card>
        <Result
          status="success"
          title="提交成功"
          subTitle="感谢您的填写，您的健康数据已保存"
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/dashboard/home')}>
              返回首页
            </Button>,
            <Button key="again" onClick={() => navigate('/dashboard/home')}>
              继续填表
            </Button>,
          ]}
        />
      </Card>
    </div>
  )
}
```

---

## 实施检查清单

- [ ] Task 1: 安装依赖
- [ ] Task 2: 配置 Vite 和 TypeScript
- [ ] Task 3: 创建 API 端点定义
- [ ] Task 4: 创建 axios 封装
- [ ] Task 5: 创建 React Query 封装
- [ ] Task 6: 扩展 Zustand Auth Store
- [ ] Task 7: 创建布局组件
- [ ] Task 8: 实现登录/注册页面
- [ ] Task 9: 实现首页
- [ ] Task 10: 实现填写表单页
- [ ] Task 11: 实现结果查看页
- [ ] Task 12: 实现结果对比页
- [ ] Task 13: 实现用户设置页
- [ ] Task 14: 实现提交成功页
