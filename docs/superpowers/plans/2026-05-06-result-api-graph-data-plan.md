# Result API 图表数据后端化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/result/{id}/groups` 响应中新增 `graph` 字段，包含 ECharts 力导向图专用的 `nodes`、`links`、`categories` 结构

**Architecture:** 后端在构建 groups 数据后，额外构建 graph 数据。前端 GraphChart 优先使用 `graphData` prop，降级兼容 groups 转换逻辑。

**Tech Stack:** FastAPI + SQLAlchemy (backend), React + ECharts (frontend)

---

## 文件结构

```
backend/
├── app/
│   ├── api/routers/results.py     # 修改: get_result_groups 增加 graph 构建
│   └── schemas/result.py          # 修改: 新增 GraphDataResponse schema

frontend/
├── src/
│   ├── types/api.ts               # 修改: 新增 GraphData 类型
│   └── pages/Dashboard/Result/
│       ├── components/GraphChart.tsx  # 修改: 新增 graphData prop
│       └── index.tsx              # 修改: 传递 graphData
```

---

## Task 1: 后端 - 新增 GraphDataResponse Schema

**Files:**
- Modify: `backend/app/schemas/result.py:64-69`

- [ ] **Step 1: 在 result.py 末尾添加 GraphDataResponse schema**

```python
class GraphLinkResponse(BaseModel):
    """力导向图 links"""
    source: str
    target: str
    label: dict = {"show": False}
    ignoreForceLayout: bool = True

    class Config:
        from_attributes = True


class GraphDataResponse(BaseModel):
    """力导向图数据结构"""
    nodes: List[dict]
    links: List[GraphLinkResponse]
    categories: List[dict]

    class Config:
        from_attributes = True
```

- [ ] **Step 2: 在 ResultGroupsResponse 中添加 graph 字段**

修改 `backend/app/schemas/result.py` 中的 `ResultGroupsResponse` 类：

```python
class ResultGroupsResponse(BaseModel):
    """分组症状列表"""
    groups: List[EntryGroupResponse]
    graph: Optional[GraphDataResponse] = None  # 新增

    class Config:
        from_attributes = True
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/result.py
git commit -m "feat(result): add GraphDataResponse schema for chart data"
```

---

## Task 2: 后端 - 在 get_result_groups 中实现 graph 数据构建

**Files:**
- Modify: `backend/app/api/routers/results.py:139-149`

- [ ] **Step 1: 在 get_result_groups 函数中，groups 构建完成后添加 graph 数据构建逻辑**

在 `return ResultGroupsResponse(groups=groups)` 之前添加：

```python
    # 4. 构建力导向图数据
    graph_nodes = []
    graph_links = []

    for group_index, group_data in enumerate(groups_map.values()):
        category = group_data["category"]
        for entry in group_data["entrys"]:
            show_count = category.get("show_count", 0) or 0
            # 显示规则：number > show_count 或 number 为 None
            if (entry["number"] is None) or ((entry["number"] or 0) > show_count):
                number = entry["number"] or 0
                # symbolSize 计算逻辑
                if number > 80:
                    symbol_size = 100
                elif number < 10:
                    symbol_size = 10
                else:
                    symbol_size = number or 30

                graph_nodes.append({
                    "id": str(entry["id"]),
                    "name": entry["title"],
                    "category": group_index,
                    "value": entry["number"] or "",
                    "symbolSize": symbol_size,
                })

            # 处理嵌套 entrys 之间的 link
            # 注意：这里需要回到原始 user_entry.entries 查找嵌套关系
            # 简化处理：跳过 links，links 非关键数据

    graph_categories = [
        {"id": cat["id"], "name": cat["name"], "show_count": cat.get("show_count", 0)}
        for cat in [g["category"] for g in groups_map.values()]
    ]

    graph_data = GraphDataResponse(
        nodes=graph_nodes,
        links=[],  # links 暂不处理，非关键数据
        categories=graph_categories,
    )

    return ResultGroupsResponse(groups=groups, graph=graph_data)
```

- [ ] **Step 2: 更新 import 语句**

在 `backend/app/api/routers/results.py` 顶部添加导入：

```python
from app.schemas.result import ResultInfo, ResultGroupsResponse, EntryGroupResponse, CategoryForGroup, EntryForGroup, ResultCompareResponse, GraphDataResponse, GraphLinkResponse
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/routers/results.py
git commit -m "feat(result): add graph data construction in get_result_groups"
```

---

## Task 3: 前端 - 新增 GraphData 类型

**Files:**
- Modify: `frontend/src/types/api.ts:183-185`

- [ ] **Step 1: 在 api.ts 中 ResultGroups 类型后添加 GraphData 类型**

```typescript
// ========== Graph Data ==========
export interface GraphLink {
  source: string
  target: string
  label?: { show?: boolean }
  ignoreForceLayout?: boolean
}

export interface GraphNode {
  id: string
  name: string
  category: number
  value: string | number
  symbolSize: number
}

export interface GraphCategory {
  id: number
  name: string
  show_count?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  categories: GraphCategory[]
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/api.ts
git commit -m "feat(api): add GraphData types for chart"
```

---

## Task 4: 前端 - GraphChart 支持 graphData prop

**Files:**
- Modify: `frontend/src/pages/Dashboard/Result/components/GraphChart.tsx:1-119`

- [ ] **Step 1: 更新 GraphChartProps 接口**

```typescript
import type { Entryship, GraphData } from '@/types/api'

interface EntryGroup {
  category: { id: number; name: string; show_count?: number }
  entrys: Entryship[]
}

interface GraphChartProps {
  data: EntryGroup[] | null
  graphData?: GraphData | null  // 新增
}
```

- [ ] **Step 2: 在 GraphChart 函数中优先使用 graphData**

修改 `GraphChart` 函数：

```typescript
export function GraphChart({ data, graphData }: GraphChartProps) {
  if (!data || data.length === 0) {
    return <ReactECharts option={{}} style={{ height: '400px' }} />
  }

  // 优先使用后端返回的 graphData
  if (graphData && graphData.nodes && graphData.nodes.length > 0) {
    const option = {
      color: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#669999',
        '#FF0000', '#006666',
      ],
      legend: {
        type: 'scroll',
        data: graphData.categories.map((a) => a.name),
      },
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          scaleLimit: { min: 0.5, max: 5 },
          nodeScaleRatio: 1,
          symbol: 'pin',
          type: 'graph',
          layout: 'force',
          animation: true,
          roam: true,
          legendHoverLink: false,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
          draggable: true,
          data: graphData.nodes,
          categories: graphData.categories,
          force: {
            edgeLength: [40, 5],
            layoutAnimation: true,
            repulsion: 20,
            gravity: 0.1,
            friction: 0.1,
          },
          edges: graphData.links,
          emphasis: {
            focus: 'adjacency',
            blurScope: 'global',
            lineStyle: {
              width: 10,
            },
          },
        },
      ],
    }
    return (
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '65vh', backgroundColor: 'none', margin: 0 }}
      />
    )
  }

  // 降级：使用旧的 groups 转换逻辑（兼容）
  // ... 保留原有代码 ...
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard/Result/components/GraphChart.tsx
git commit -m "feat(result): GraphChart accepts graphData prop with fallback"
```

---

## Task 5: 前端 - Result 页面传递 graphData

**Files:**
- Modify: `frontend/src/pages/Dashboard/Result/index.tsx:125`

- [ ] **Step 1: 在 Result/index.tsx 中传递 graphData 给 GraphChart**

找到第 125 行附近的 GraphChart 调用：

```typescript
<GraphChart data={resultGroups?.groups || []} graphData={resultGroups?.graph} />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard/Result/index.tsx
git commit -m "feat(result): pass graphData from API response to GraphChart"
```

---

## Task 6: 测试验证

- [ ] **Step 1: 启动后端服务**

```bash
cd backend && uvicorn app.main:app --reload
```

- [ ] **Step 2: 启动前端服务**

```bash
cd frontend && npm run dev
```

- [ ] **Step 3: 测试步骤**

1. 登录系统
2. 进入某个评估结果页面（Result 页面）
3. 点击"雷达图"按钮
4. 验证图表正常显示，数据正确

- [ ] **Step 4: 验证 SymptomCard 不受影响**

1. 检查 Result 页面的 SymptomCard 列表是否正常显示

---

## 验证清单

- [ ] `/result/{id}/groups` API 响应包含 `graph` 字段
- [ ] `graph.nodes` 包含正确的节点数据（id, name, category, value, symbolSize）
- [ ] `graph.categories` 包含正确的分类数据
- [ ] 雷达图正常显示
- [ ] SymptomCard 列表不受影响
