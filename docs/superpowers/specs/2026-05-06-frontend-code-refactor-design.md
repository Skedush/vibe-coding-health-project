# 前端代码全面优化设计方案

## 目标

对前端代码进行全面重构，提高代码的**规范性、可读性、清晰度、优雅度和巧妙性**，在不改变业务逻辑的前提下，让代码更易于维护和扩展。

## 优化范围

| 文件 | 当前行数 | 优化后目标 |
|------|----------|-----------|
| `client.ts` | 157 | 类型安全 + 消除 any |
| `request.ts` | 161 | 工厂函数简化重复 |
| `authStore.ts` | 34 | Zustand slices 模式 |
| `types/api.ts` | 232 | 补充 util types 和常量 |
| `Home/index.tsx` | 225 | 拆分为 4 个子组件 |
| `FillForm/index.tsx` | 307 | 拆分为 3 个子组件 |
| 新增 `hooks/` | - | usePermission, useEntryList 等 |

## 分步实施计划

### Step 1: 类型安全 (client.ts)

**改进内容：**
- 定义 `ApiErrorResponse` 接口替代 `any`
- 消除 `(error.response?.data as any)` 模式
- 使用类型安全的 URLSearchParams 处理

**改动点：**
```typescript
// 新增接口
interface ApiErrorResponse {
  detail?: string
  message?: string
}

// Before
const msg = (error.response?.data as any)?.detail || error.message

// After
const msg = (error.response?.data as ApiErrorResponse)?.detail || error.message
```

### Step 2: API 层简化 (request.ts)

**改进内容：**
- 创建 `createMutationHook` 工厂函数
- 创建 `createQueryHook` 工厂函数
- 消除重复的 hook 定义模式

**改动点：**
```typescript
// 工厂函数
const createMutationHook = <TData, TVariables>(
  mutationFn: (data: TVariables) => Promise<TData>
) => useMutation<TData, Error, TVariables>({ mutationFn })

const createQueryHook = <TData>(
  queryFn: () => Promise<TData>,
  key: string
) => useQuery<TData, Error>({ queryKey: [key], queryFn })

// Before
export const useLogin = () =>
  useMutation<TokenResponse, Error, LoginData>({
    mutationFn: (data) => API.login(data)
  })

// After
export const useLogin = createMutationHook(API.login)
```

### Step 3: Zustand 重构 (authStore.ts)

**改进内容：**
- 使用 `combine` 中间件分离 state 和 actions
- 简化状态管理

**改动点：**
```typescript
import { combine } from 'zustand/middleware'

export const useAuthStore = create(
  combine(
    { token: null as string | null, user: null as User | null },
    (set) => ({
      login: (token: string, user: User) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token
        }
      },
    }
  )
)
```

### Step 4: 组件拆分 (Home/index.tsx)

**改进内容：**
拆分为以下组件：
- `EntryInfoLinks.tsx` - 链接列表组件
- `EntryList.tsx` - 列表渲染组件
- `CompareButton.tsx` - 对比按钮组件
- `SearchBar.tsx` - 搜索栏组件

**目录结构：**
```
src/pages/Dashboard/Home/
├── index.tsx              # 主组件 (~60行)
└── components/
    ├── EntryInfoLinks.tsx    # 链接列表
    ├── EntryList.tsx        # 列表渲染
    ├── CompareButton.tsx    # 对比按钮
    └── SearchBar.tsx        # 搜索栏
```

### Step 5: 组件拆分 (FillForm/index.tsx)

**改进内容：**
拆分为以下组件：
- `BasicFields.tsx` - 基础信息表单字段
- `SymptomSelector.tsx` - 症状选择器（支持 Tree 和 Checkbox 两种模式）
- `MedicalFields.tsx` - 医学指标表单字段

**目录结构：**
```
src/pages/Dashboard/FillForm/
├── index.tsx              # 主组件 (~100行)
└── components/
    ├── BasicFields.tsx     # 基础信息
    ├── SymptomSelector.tsx # 症状选择
    └── MedicalFields.tsx   # 医学指标
```

### Step 6: 自定义 Hooks

**新增文件：**
- `hooks/usePermission.ts` - 权限判断 hook
- `hooks/useEntryList.ts` - 条目列表 hook
- `hooks/index.ts` - 统一导出

```typescript
// hooks/usePermission.ts
export const usePermission = () => {
  const user = useAuthStore((s) => s.user)
  return {
    isStaff: !!user?.is_staff,
    isSuperUser: !!user?.is_superuser,
    canDelete: !user?.is_staff || !!user?.is_superuser,
  }
}
```

### Step 7: types/api.ts 增强

**改进内容：**
- 新增 `CATEGORY_TYPE` 常量对象
- 补充 `EntryCategory` 联合类型
- 新增 `ApiResult<T>` 工具类型
- 补充 `GraphDataResponse` 类型

```typescript
// 常量
export const CATEGORY_TYPE = {
  TREE_STRUCTURE: 6,
  CHECKBOX_LIST: 3,
} as const

export type EntryCategory = 3 | 6

// 工具类型
export type ApiResult<T> = {
  code?: string
  message?: string
  success?: boolean
  data?: T
}
```

### Step 8: README 更新

**更新内容：**
- 更新目录结构，添加 `hooks/` 目录说明
- 更新技术栈文档（如有变化）

## 风险控制

| 风险点 | 控制措施 |
|--------|----------|
| 逻辑改错 | 每个文件改完后对比原逻辑 |
| 类型错误 | 运行 `pnpm build` 验证 |
| 运行时错误 | 手动功能测试 |
| commit 太碎 | 按 step 单元提交 |

## 提交计划

每个 step 完成后单独提交，commit message 格式：
```
refactor(frontend): step N - 改进描述
```

例如：
```
refactor(frontend): step 1 - improve type safety in client.ts
refactor(frontend): step 2 - simplify API hooks with factory functions
...
```

## 依赖关系

```
Step 1 (client.ts)          → 无依赖
Step 2 (request.ts)         → Step 1 完成
Step 3 (authStore.ts)       → Step 1 完成
Step 4 (Home 拆分)          → Step 6 完成
Step 5 (FillForm 拆分)      → Step 6 完成
Step 6 (hooks)              → Step 1, 2, 3 完成
Step 7 (types/api.ts)       → 无依赖
Step 8 (README)             → 全部完成
```

## 验收标准

1. `pnpm build` 无错误
2. `pnpm lint` 无警告
3. 所有功能页面可正常访问
4. 原有业务逻辑保持不变
5. 代码行数明显减少（尤其是大文件）
