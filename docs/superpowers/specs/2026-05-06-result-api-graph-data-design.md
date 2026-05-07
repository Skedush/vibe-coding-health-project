# Result API 图表数据后端化设计

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 GraphChart 的数据转换逻辑从前端移到后端，前端直接使用后端返回的图表数据结构

**Architecture:** 在现有 `/result/{id}/groups` 响应中新增 `graph` 字段，包含图表专用的 `nodes`、`links`、`categories` 结构。前端 GraphChart 优先使用 `graph` 字段，降级兼容旧的 `groups` 转换逻辑。

**Tech Stack:** FastAPI + SQLAlchemy (backend), React + ECharts (frontend)

---

## 背景

现有流程：
1. 后端 `/result/{id}/groups` 返回 `groups` 数组
2. 前端 GraphChart 接收 `groups`，内部转换为 `nodes/links/categories`
3. SymptomCard 也使用 `groups` 数组

问题：前端需要理解图表数据结构，不符合"后端返回视图专用数据"原则。

---

## 设计方案

### 1. 后端响应格式扩展

**现有返回：**
```json
{
  "groups": [
    {
      "category": { "id": 1, "name": "病因", "show_count": 0 },
      "entrys": [
        { "id": 101, "title": "头痛", "remark": "http://...", "number": 3 }
      ]
    }
  ]
}
```

**改造后返回：**
```json
{
  "groups": [...],
  "graph": {
    "nodes": [
      { "id": "101", "name": "头痛", "category": 0, "value": 3, "symbolSize": 30 }
    ],
    "links": [
      { "source": "101", "target": "102", "label": { "show": false }, "ignoreForceLayout": true }
    ],
    "categories": [
      { "id": 1, "name": "病因", "show_count": 0 }
    ]
  }
}
```

### 2. 前端 GraphChart 改造

```typescript
interface GraphChartProps {
  data: EntryGroup[] | null
  graphData?: {  // 新增
    nodes: any[]
    links: any[]
    categories: any[]
  } | null
}

// 优先使用 graphData，否则降级转换
const chartData = graphData || transformGroupsToGraph(data)
```

### 3. 后端转换逻辑

参考前端现有转换逻辑（`GraphChart.tsx:23-53`）：

```python
# nodes 生成规则
symbolSize = entry.number > 80 ? 100 : entry.number < 10 ? 10 : entry.number || 30
# 显示规则：number > show_count 或 number 为 None

# links 生成规则
# 遍历 entry.entrys，建立 entry.id -> subEntry.id 的关系

# categories 生成规则
# 直接使用 group.category
```

---

## 涉及文件

### 后端
- `backend/app/api/routers/results.py` — 在 `get_result_groups` 中增加 graph 数据构建
- `backend/app/schemas/result.py` — 新增 `GraphDataResponse` schema

### 前端
- `frontend/src/pages/Dashboard/Result/components/GraphChart.tsx` — 增加 graphData prop，降级兼容
- `frontend/src/pages/Dashboard/Result/index.tsx` — 传递 graphData 给 GraphChart
- `frontend/src/types/api.ts` — 新增 `GraphData` 类型

---

## 兼容性处理

1. **后端**：始终返回 `graph` 字段，不做版本判断
2. **前端**：
   - 新版 GraphChart 优先用 `graphData`
   - 如果 `graphData` 为空，使用旧的 groups 转换逻辑（临时兼容，最终应移除）

---

## 实施步骤

1. 后端：新增 `GraphDataResponse` schema
2. 后端：在 `get_result_groups` 中实现 graph 数据转换
3. 前端：更新类型定义
4. 前端：GraphChart 支持新格式
5. 前端：Result 页面传递 graphData
6. 测试验证
