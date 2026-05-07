# 前端优化重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化前端代码质量、样式统一、响应式适配，将 Result 页面拆分为小组件

**Architecture:**
- Phase 1: 代码清理（删除死代码、移除调试日志）
- Phase 2: 样式整改（统一 Tailwind + 三分屏布局）
- Phase 3: 响应式适配（移动端适配）
- Phase 4: Result 页面拆分（最后执行）

**Tech Stack:** React, Tailwind CSS, Ant Design, TypeScript

---

## Phase 1: 代码清理

### Task 1: 删除未使用的 API 文件

**Files:**
- Delete: `frontend/src/api/auth.ts`
- Delete: `frontend/src/api/userEntry.ts`

- [ ] **Step 1: 删除 auth.ts**

```bash
rm /Users/lii/Desktop/brother/project-new/frontend/src/api/auth.ts
```

- [ ] **Step 2: 删除 userEntry.ts**

```bash
rm /Users/lii/Desktop/brother/project-new/frontend/src/api/userEntry.ts
```

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "chore: remove unused API files (auth.ts, userEntry.ts)"
```

---

### Task 2: 移除调试用的 console.log

**Files:**
- Modify: `frontend/src/pages/Dashboard/Home/index.tsx:16`
- Modify: `frontend/src/pages/Dashboard/Result/components/GraphChart.tsx:14`
- Modify: `frontend/src/pages/Dashboard/Result/components/GraphChart.tsx:115-116`

- [ ] **Step 1: 移除 Home/index.tsx 中的 console.log**

找到并删除第 16 行：`console.log(user)`

- [ ] **Step 2: 移除 GraphChart.tsx 中的 console.log**

找到并删除：
- 第 14 行：`console.log('GraphChart data:', data)`
- 第 115-116 行：
```tsx
console.log('legend data:', categories.map((c: any) => c.name))
console.log('nodes:', nodes.length, 'links:', links.length)
```

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "chore: remove debug console.log statements"
```

---

### Task 3: 简化 client.ts 的 URL 替换逻辑

**Files:**
- Modify: `frontend/src/api/client.ts:74-91`

- [ ] **Step 1: 简化 matchRestfulUrl 函数**

将原有的 parse + compile 两步操作简化为直接使用 compile：

```typescript
// 简化后的 matchRestfulUrl 函数
function matchRestfulUrl(url: string, data: Record<string, any>): string {
  try {
    const compiled = compile(url)
    const finalUrl = compiled(data)

    // 删除已替换的参数
    const tokens = parse(url)
    for (const token of tokens) {
      if (typeof token === 'object' && token.name) {
        delete data[token.name]
      }
    }

    return finalUrl
  } catch (e) {
    return url
  }
}
```

**注意**：这个简化不改变功能，只移除冗余代码。

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "refactor: simplify matchRestfulUrl in client.ts"
```

---

## Phase 2: 样式整改

### Task 4: 创建响应式布局容器组件

**Files:**
- Create: `frontend/src/components/PageContainer.tsx`

- [ ] **Step 1: 创建 PageContainer 组件**

```tsx
interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-4xl px-4 py-6 ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/PageContainer.tsx && git commit -m "feat: add PageContainer component for responsive layout"
```

---

### Task 5: 整改 Login 页面样式

**Files:**
- Modify: `frontend/src/pages/Login/index.tsx`

- [ ] **Step 1: 更新 Login 页面样式**

将 `w-96` 改为响应式宽度，添加移动端适配：

```tsx
// 修改 Card 样式
<Card className="w-full max-w-md shadow-lg">

// 修改容器样式
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "style: update Login page responsive styles"
```

---

### Task 6: 整改 Register 页面样式

**Files:**
- Modify: `frontend/src/pages/Register/index.tsx`

- [ ] **Step 1: 更新 Register 页面样式**

与 Login 相同，添加响应式宽度：

```tsx
// 修改 Card 样式
<Card className="w-full max-w-md shadow-lg">

// 修改容器样式
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "style: update Register page responsive styles"
```

---

### Task 7: 整改 Home 页面样式

**Files:**
- Modify: `frontend/src/pages/Dashboard/Home/index.tsx`

- [ ] **Step 1: 用 PageContainer 包裹内容**

在 return 的最外层 div 添加 PageContainer：

```tsx
import { PageContainer } from '@/components/PageContainer'

// return 部分
return (
  <PageContainer>
    <div>
      {/* 现有的内容 */}
    </div>
  </PageContainer>
)
```

- [ ] **Step 2: 替换 Affix 的固定定位**

将 `fixed bottom-6 right-6` 改为适合移动端的定位：

```tsx
<Affix className="fixed bottom-4 right-4 md:bottom-6 md:right-6">
```

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "style: update Home page with PageContainer and responsive styles"
```

---

### Task 8: 整改 FillForm 页面样式

**Files:**
- Modify: `frontend/src/pages/Dashboard/FillForm/index.tsx`

- [ ] **Step 1: 用 PageContainer 包裹内容**

```tsx
import { PageContainer } from '@/components/PageContainer'

// return 部分 - Card 移除内联样式
return (
  <PageContainer>
    <Card title={<PageTitle title={title} />}>
      {/* 现有内容 */}
    </Card>
  </PageContainer>
)
```

- [ ] **Step 2: 提取 PageTitle 组件**

创建 `frontend/src/components/PageTitle.tsx`：

```tsx
interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{title}</div>
      {subtitle && <div className="text-base text-gray-500 mt-2">{subtitle}</div>}
    </div>
  )
}
```

- [ ] **Step 3: 移除内联样式，转换为 Tailwind**

查找并替换以下内联样式：
- `style={{ textAlign: 'center', padding: '50px' }}` → `className="text-center py-12"`
- `style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}` → `className="flex flex-wrap gap-4"`
- `style={{ flex: '1 1 45%' }}` → `className="flex-1 min-w-[45%]"`
- `style={{ display: 'flex', gap: '8px' }}` → `className="flex gap-2"`

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "style: update FillForm page with PageContainer and Tailwind"
```

---

### Task 9: 整改 Compare 页面样式

**Files:**
- Modify: `frontend/src/pages/Dashboard/Compare/index.tsx`

- [ ] **Step 1: 用 PageContainer 包裹内容**

```tsx
import { PageContainer } from '@/components/PageContainer'

return (
  <PageContainer>
    {/* 内容 */}
  </PageContainer>
)
```

- [ ] **Step 2: 调整对比卡片的响应式布局**

将 `<Col span={12}>` 改为移动端单列：

```tsx
// 原来
<Col span={12}>

// 改为
<Col xs={24} md={12}>
```

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "style: update Compare page with PageContainer and responsive styles"
```

---

### Task 10: 整改 User 页面样式

**Files:**
- Modify: `frontend/src/pages/Dashboard/User/index.tsx`

- [ ] **Step 1: 用 PageContainer 包裹内容**

```tsx
import { PageContainer } from '@/components/PageContainer'

return (
  <PageContainer>
    <Card>
      {/* 内容 */}
    </Card>
  </PageContainer>
)
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "style: update User page with PageContainer"
```

---

### Task 11: 整改 Success 页面样式

**Files:**
- Modify: `frontend/src/pages/Dashboard/Success/index.tsx`

- [ ] **Step 1: 用 PageContainer 包裹内容**

```tsx
import { PageContainer } from '@/components/PageContainer'

return (
  <PageContainer>
    <Card className="text-center">
      <Result ... />
    </Card>
  </PageContainer>
)
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "style: update Success page with PageContainer"
```

---

## Phase 3: 响应式适配

### Task 12: 全局样式检查和调整

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: 添加全局响应式基础样式**

确保 Tailwind 的响应式断点正常工作：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 确保移动端触摸友好 */
@media (max-width: 640px) {
  .ant-btn {
    height: 36px;
    padding: 0 12px;
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "style: add global responsive base styles"
```

---

### Task 13: DashboardLayout 响应式调整

**Files:**
- Modify: `frontend/src/layouts/DashboardLayout.tsx`

- [ ] **Step 1: 添加移动端侧边栏折叠**

在移动端隐藏或折叠侧边栏菜单：

```tsx
// 添加 state
const [collapsed, setCollapsed] = useState(false)

// 响应式 Sider
<Sider
  width={200}
  className="bg-white hidden md:block" // 移动端隐藏
  collapsed={collapsed}
  onCollapse={setCollapsed}
>

// Header 中添加移动端菜单按钮
<div className="flex items-center gap-2">
  <Button
    type="text"
    className="md:hidden"
    onClick={() => setCollapsed(!collapsed)}
    icon={<MenuOutlined />}
  />
  <span className="text-white">{user?.username}</span>
  ...
</div>
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "style: add responsive sidebar to DashboardLayout"
```

---

## Phase 4: Result 页面拆分

### Task 14: 创建 Result 子组件 - BasicInfo

**Files:**
- Create: `frontend/src/pages/Dashboard/Result/components/BasicInfo.tsx`

- [ ] **Step 1: 创建 BasicInfo 组件**

```tsx
import { Card, Descriptions } from 'antd'
import type { HealthResult } from '@/types/api'

interface BasicInfoProps {
  result: HealthResult
  isStaff?: boolean
}

export function BasicInfo({ result, isStaff }: BasicInfoProps) {
  if (!isStaff) return null

  return (
    <Card title="自检结果" size="small">
      <div className="text-sm text-gray-600 mb-4">
        提交时间：{result.created ? new Date(result.created).toLocaleString() : '-'}
      </div>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="姓名"><b>{result.name}</b></Descriptions.Item>
        <Descriptions.Item label="手机">{result.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="年龄">{result.age || '-'}</Descriptions.Item>
        <Descriptions.Item label="性别">{result.gender === '1' ? '男' : '女'}</Descriptions.Item>
        <Descriptions.Item label="身高">{result.height || '-'}</Descriptions.Item>
        <Descriptions.Item label="体重">{result.weight || '-'}</Descriptions.Item>
        <Descriptions.Item label="腰围">{result.waistline || '-'}</Descriptions.Item>
        <Descriptions.Item label="血糖">{result.blood_sugar || '-'}</Descriptions.Item>
        <Descriptions.Item label="收缩压">{result.systolic_pressure || '-'}</Descriptions.Item>
        <Descriptions.Item label="舒张压">{result.diastolic_pressure || '-'}</Descriptions.Item>
      </Descriptions>
      {result.address && <div className="mt-2">地址：{result.address}</div>}
    </Card>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Dashboard/Result/components/BasicInfo.tsx && git commit -m "feat(Result): extract BasicInfo component"
```

---

### Task 15: 创建 Result 子组件 - SuggestionForm

**Files:**
- Create: `frontend/src/pages/Dashboard/Result/components/SuggestionForm.tsx`

- [ ] **Step 1: 创建 SuggestionForm 组件**

```tsx
import { Card, Form, Input, Button } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { API } from '@/api/request'
import type { HealthResult } from '@/types/api'

const { TextArea } = Input

interface SuggestionFormProps {
  result: HealthResult
  onSuccess: () => void
}

export function SuggestionForm({ result, onSuccess }: SuggestionFormProps) {
  const [form] = Form.useForm()
  const updateMutation = useMutation({
    mutationFn: (data: { suggestion: string }) =>
      API.updateUserEntry({ id: result.id, ...data }),
  })

  const onFinish = async (values: { suggestion: string }) => {
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newSuggestion = `${timeStr}:\n${values.suggestion}${result.suggestion ? '\n\n' + result.suggestion : ''}`

    await updateMutation.mutateAsync({ suggestion: newSuggestion })
    form.resetFields()
    onSuccess()
  }

  return (
    <Card title="调理方案" size="small">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="suggestion"
          rules={[{ required: true, message: '请填写参考意见！' }]}
        >
          <TextArea
            rows={3}
            maxLength={1024}
            placeholder="调理方案及备注（可多次提交升级补充方案）"
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={updateMutation.isPending}
        >
          提交意见
        </Button>
      </Form>
    </Card>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Dashboard/Result/components/SuggestionForm.tsx && git commit -m "feat(Result): extract SuggestionForm component"
```

---

### Task 16: 创建 Result 子组件 - SymptomCard

**Files:**
- Create: `frontend/src/pages/Dashboard/Result/components/SymptomCard.tsx`

- [ ] **Step 1: 创建 SymptomCard 组件**

```tsx
import { Card, Button } from 'antd'
import type { Entryship, CategorySimple } from '@/types/api'

interface SymptomCardProps {
  group: {
    category: CategorySimple
    entrys: Entryship[]
  }
  index: number
  onPieClick?: () => void
  onGraphClick?: () => void
}

export function SymptomCard({ group, index, onPieClick, onGraphClick }: SymptomCardProps) {
  const { category, entrys } = group

  const navEntry = (entry: Entryship) => {
    const { remark, title } = entry
    if (remark) {
      try {
        const url = new URL(remark)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          window.open(remark)
        }
      } catch {}
    } else if (category.child_link) {
      const protocol = category.protocol || 'https://'
      window.open(`${protocol}${category.child_link}${encodeURIComponent(title)}`)
    }
  }

  return (
    <Card
      size="small"
      className="mb-4"
      title={
        <div className="flex justify-between items-center">
          <span
            className="cursor-pointer"
            onClick={() => {
              if (category.link) {
                const protocol = category.protocol || 'https://'
                window.open(`${protocol}${category.link}`)
              }
            }}
          >
            {category.name}
            {category.name === '病因' && (
              <span className="text-xs text-gray-400 ml-2">(仅供参考，不具医学效力)</span>
            )}
          </span>
          <Button type="link" size="small" onClick={index === 0 ? onGraphClick : onPieClick}>
            {index === 0 ? '雷达图' : '饼图'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap">
        {entrys
          .filter((e) => {
            if (e.number === undefined) return true
            return (e.number ?? 0) > (category.show_count ?? 0)
          })
          .map((entry) => (
            <div
              key={entry.id}
              className="w-1/2 text-center py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => navEntry(entry)}
            >
              <span>{entry.title}</span>
              {entry.number !== undefined && (
                <span className="font-bold text-red-500 ml-2">{entry.number}</span>
              )}
            </div>
          ))}
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Dashboard/Result/components/SymptomCard.tsx && git commit -m "feat(Result): extract SymptomCard component"
```

---

### Task 17: 重构 Result 主页面

**Files:**
- Modify: `frontend/src/pages/Dashboard/Result/index.tsx`

- [ ] **Step 1: 重构 Result 主页面**

```tsx
import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, Modal, Button, message } from 'antd'
import { useResult } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { PageContainer } from '@/components/PageContainer'
import { BasicInfo } from './components/BasicInfo'
import { SuggestionForm } from './components/SuggestionForm'
import { SymptomCard } from './components/SymptomCard'
import { PieChart } from './components/PieChart'
import { GraphChart } from './components/GraphChart'
import type { Entryship, CategorySimple } from '@/types/api'
import domtoimage from 'dom-to-image'

interface EntryGroup {
  category: CategorySimple
  entrys: Entryship[]
}

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: result, isLoading, refetch } = useResult(Number(id))
  const resultRef = useRef<HTMLDivElement>(null)

  const [pieModalVisible, setPieModalVisible] = useState(false)
  const [graphModalVisible, setGraphModalVisible] = useState(false)
  const [imgModalVisible, setImgModalVisible] = useState(false)
  const [selectedPieData, setSelectedPieData] = useState<EntryGroup | null>(null)
  const [picture, setPicture] = useState('')

  // 将 entryship 数据按 category 分组
  const entryGroups: EntryGroup[] = []
  if (result?.entryship) {
    result.entryship.forEach((item) => {
      const existingGroup = entryGroups.find((g) => g.category.id === item.category?.id)
      if (existingGroup) {
        existingGroup.entrys.push(item)
      } else if (item.category) {
        entryGroups.push({ category: item.category, entrys: [item] })
      }

      if (item.entrys) {
        item.entrys.forEach((subItem) => {
          const existingSubGroup = entryGroups.find((g) => g.category.id === subItem.category?.id)
          if (existingSubGroup) {
            const existingEntry = existingSubGroup.entrys.find((e) => e.id === subItem.id)
            if (existingEntry) {
              existingEntry.number = (existingEntry.number || 0) + 1
            } else {
              existingSubGroup.entrys.push({ ...subItem, number: 1 })
            }
          } else if (subItem.category) {
            entryGroups.push({ category: subItem.category, entrys: [{ ...subItem, number: 1 }] })
          }
        })
      }
    })

    entryGroups.forEach((group) => {
      group.entrys.sort((a, b) => (b.number || 0) - (a.number || 0))
    })
  }

  const showPieModal = (group: EntryGroup) => {
    setSelectedPieData(group)
    setPieModalVisible(true)
  }

  const showGraphModal = () => setGraphModalVisible(true)

  const domToImage = async () => {
    if (!resultRef.current) return
    try {
      const shareBtn = document.querySelector('.share-btn') as HTMLElement
      if (shareBtn) shareBtn.style.display = 'none'
      const dataUrl = await domtoimage.toJpeg(resultRef.current, { quality: 1 })
      if (shareBtn) shareBtn.style.display = ''
      setPicture(dataUrl)
      setImgModalVisible(true)
    } catch {
      message.error('生成分享图片失败')
    }
  }

  const isStaff = user?.is_staff

  if (isLoading) return <Spin tip="分析中，稍等5-10秒..." />
  if (!result) return <div>未找到结果</div>

  return (
    <PageContainer>
      <div ref={resultRef}>
        <BasicInfo result={result} isStaff={isStaff} />

        {(result.remark || result.suggestion) && (
          <Card title="备注与意见" size="small" className="mt-4">
            {result.remark && (
              <div className="mb-2">
                <b>备注：</b>{result.remark}
              </div>
            )}
            {result.suggestion && (
              <div className="text-green-600 font-bold whitespace-pre-wrap">
                <b>参考意见：</b>{result.suggestion}
              </div>
            )}
          </Card>
        )}

        <SuggestionForm result={result} onSuccess={refetch} />

        {entryGroups.length > 0 && (
          <Card title="健康分析" size="small" className="mt-4">
            {entryGroups.map((group, index) => (
              <SymptomCard
                key={group.category.id}
                group={group}
                index={index}
                onPieClick={() => showPieModal(group)}
                onGraphClick={showGraphModal}
              />
            ))}
          </Card>
        )}

        <div className="text-center mt-4 share-btn">
          <Button onClick={domToImage}>分享</Button>
        </div>
      </div>

      <Modal
        title={`${selectedPieData?.category.name || ''}统计`}
        open={pieModalVisible}
        onCancel={() => setPieModalVisible(false)}
        footer={null}
        width="80%"
        centered
      >
        {selectedPieData && <PieChart data={selectedPieData.entrys} />}
      </Modal>

      <Modal
        title="总关系图"
        open={graphModalVisible}
        onCancel={() => setGraphModalVisible(false)}
        footer={null}
        width="90%"
        bodyStyle={{ height: '70vh' }}
        centered
      >
        <GraphChart data={entryGroups} />
      </Modal>

      <Modal
        title="分享图片查看"
        open={imgModalVisible}
        onCancel={() => setImgModalVisible(false)}
        footer={null}
        width="80%"
        centered
      >
        {picture && <img src={picture} alt="分享图片" className="w-full" />}
      </Modal>
    </PageContainer>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "refactor(Result): split into smaller components"
```

---

## 实施检查清单

### Phase 1: 代码清理
- [ ] Task 1: 删除未使用的 API 文件
- [ ] Task 2: 移除调试用的 console.log
- [ ] Task 3: 简化 client.ts 的 URL 替换逻辑

### Phase 2: 样式整改
- [ ] Task 4: 创建 PageContainer 组件
- [ ] Task 5: 整改 Login 页面样式
- [ ] Task 6: 整改 Register 页面样式
- [ ] Task 7: 整改 Home 页面样式
- [ ] Task 8: 整改 FillForm 页面样式
- [ ] Task 9: 整改 Compare 页面样式
- [ ] Task 10: 整改 User 页面样式
- [ ] Task 11: 整改 Success 页面样式

### Phase 3: 响应式适配
- [ ] Task 12: 全局样式检查和调整
- [ ] Task 13: DashboardLayout 响应式调整

### Phase 4: Result 页面拆分
- [ ] Task 14: 创建 BasicInfo 组件
- [ ] Task 15: 创建 SuggestionForm 组件
- [ ] Task 16: 创建 SymptomCard 组件
- [ ] Task 17: 重构 Result 主页面

---

## 注意事项

1. **逻辑正确性优先**：样式改动不应影响任何业务逻辑
2. **每步提交**：便于回滚和问题定位
3. **移动端测试**：每个页面在移动端都需要验证
4. **三分屏布局**：`max-w-4xl` + 水平居中实现 PC 端三分屏效果
