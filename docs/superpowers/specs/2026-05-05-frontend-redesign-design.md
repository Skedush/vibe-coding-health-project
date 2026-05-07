# 前端完全重写设计文档

> **Goal:** 将旧前端（health-web-static）完整迁移到新框架（React 18 + Vite + Ant Design 5）

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + Vite + TypeScript | 现代化前端框架 |
| UI 库 | Ant Design 5 | 替换老前端 65+ 自定义组件 |
| 数据获取 | React Query | 服务端状态管理、缓存 |
| UI 状态 | Zustand | 轻量级状态管理 |
| 路由 | React Router v6 | 路由管理 |
| 图表 | ECharts | 与老项目保持一致 |
| HTTP 客户端 | axios | API 请求封装 |

## 目录结构

```
frontend/src/
├── api/
│   ├── index.ts      # API 端点定义（参考老项目 services/api.ts）
│   ├── client.ts     # axios 封装（参考老项目 utils/request.ts）
│   └── request.ts    # React Query 请求封装
├── components/       # Ant Design 公共组件
├── hooks/           # 自定义 Hooks
├── layouts/         # 布局组件
├── pages/           # 页面组件（函数式组件）
│   ├── Login/
│   ├── Register/
│   └── Dashboard/
│       ├── Home/        # 首页
│       ├── FillForm/    # 填写表单
│       ├── Result/      # 结果查看
│       ├── Compare/     # 结果对比
│       ├── User/        # 用户设置
│       └── Success/     # 提交成功
├── stores/           # Zustand stores
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 页面路由

| 路径 | 组件 | 功能 |
|------|------|------|
| `/login` | Login | 用户登录 |
| `/register` | Register | 用户注册 |
| `/dashboard/home` | Home | 首页（记录列表、搜索、删除、对比） |
| `/dashboard/f/:id` | FillForm | 填写表单（动态表单） |
| `/dashboard/result/:id` | Result | 结果查看（饼图+关系图） |
| `/dashboard/compare/:id/:oneId/:twoId` | Compare | 结果对比 |
| `/dashboard/user` | User | 用户设置（修改密码、编辑副标题） |
| `/dashboard/success` | Success | 提交成功 |

## API 层设计

### API 端点定义（api/index.ts）

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

### 请求封装（api/client.ts）

参考老项目 `utils/request.ts`：
- axios 封装
- JWT token 自动注入
- RESTful URL 参数替换
- 统一错误处理
- 取消请求支持

### React Query 封装（api/request.ts）

- 数据获取、缓存、自动刷新
- CRUD 操作的自动消息提示（成功/失败）
- 登录失效自动跳转

## 状态管理

### React Query（服务端状态）
- 用户数据
- 条目列表
- 用户记录列表
- 结果数据

### Zustand（UI 状态）
- 认证状态（token、用户信息）
- 表单状态
- UI 状态（loading、modal 等）

## 组件设计

所有 UI 组件使用 Ant Design 5：

| 老组件 | Ant Design 对应 |
|--------|----------------|
| FormSimple | Ant Design Form |
| ModalForm | Ant Design Modal + Form |
| List | Ant Design List |
| Confirm | Ant Design Modal.confirm |
| Button | Ant Design Button |
| Input | Ant Design Input |
| Select | Ant Design Select |
| Tabs | Ant Design Tabs |
| SearchForm | Ant Design Form + Input |

## 图表实现

### 饼图（Pie）
- 使用 `echarts-for-react`
- 展示各分类的数量占比

### 关系图（Graph）
- 使用 `echarts-for-react`
- 展示条目之间的关联关系

## 与老项目差异

| 方面 | 老项目 | 新项目 |
|------|--------|--------|
| 框架 | UmiJS 2 | Vite |
| 组件 | 65+ 自定义组件 | Ant Design 5 |
| 状态管理 | Dva | React Query + Zustand |
| 语言 | JavaScript | TypeScript |
| 组件类型 | Class 组件 | 函数式组件 |

## 实现顺序

1. 项目基础配置（Vite、ESLint、主题）
2. API 层封装
3. 布局组件（Login、Register、Dashboard）
4. 认证相关（登录、注册、Token 管理）
5. 首页功能（列表、搜索、删除、对比）
6. 填写表单页
7. 结果查看页（图表）
8. 结果对比页
9. 用户设置页
10. 提交成功页
