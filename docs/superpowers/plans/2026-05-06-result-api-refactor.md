# Result 接口拆分重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/result/:id` 拆分为多个专注接口，后端返回前端直接可用的数据结构

**Architecture:**
- 新增 `/result/:id/info` - 返回基础信息（BasicInfo 用）
- 新增 `/result/:id/groups` - 返回已分组的症状数据（SymptomCard 用）
- 保留 `/result/:id` - 简化后仅返回基础信息（Compare 页面用）
- 前端移除复杂的 entryGroups 分组逻辑

**Tech Stack:** FastAPI, SQLAlchemy, React, TypeScript

---

## 一、需求分析

### 1.1 前端实际使用情况

#### Result 页面需要的数据

| 数据 | 用途 | 来源接口 |
|------|------|---------|
| 基础信息（name, gender, age...） | BasicInfo | `/result/:id/info` |
| 分组症状（entryGroups） | SymptomCard | `/result/:id/groups` |
| 备注/建议 | 显示 | `/result/:id/info` |

#### Compare 页面需要的数据

| 数据 | 用途 | 来源接口 |
|------|------|---------|
| 基础信息（name, created...） | 显示 | `/result/:id` |
| entry_ids 列表 | 颜色标记 | `/result/:id` |

### 1.2 现有分组逻辑（后移至后端）

```python
# 前端现有的分组逻辑（要移到后端）
entryGroups: EntryGroup[] = []
for item in entryship:
    # 1. 顶级条目按 category 分组，顶级条目 number=undefined
    existingGroup = entryGroups.find(g => g.category.id === item.category?.id)
    if existingGroup:
        existingGroup.entrys.push(item)
    else:
        entryGroups.push({ category: item.category, entrys: [item] })

    # 2. 嵌套 entrys 按嵌套条目的 category 分组，number 累加
    for subItem in item.entrys:
        existingSubGroup = entryGroups.find(g => g.category.id === subItem.category?.id)
        if existingSubGroup:
            existingEntry = existingSubGroup.entrys.find(e => e.id === subItem.id)
            if existingEntry:
                existingEntry.number += 1
            else:
                existingSubGroup.entrys.push({ ...subItem, number: 1 })
        else:
            entryGroups.push({ category: subItem.category, entrys: [{ ...subItem, number: 1 }] })

# 3. 每组内按 number 降序排序
entryGroups.forEach(group => {
    group.entrys.sort((a, b) => (b.number || 0) - (a.number || 0))
})
```

### 1.3 Compare 页面的 getSelectedIds 逻辑

```typescript
// Compare 页面：获取顶级 entryship id 列表
const getSelectedIds = (result): number[] => {
    return result.entryship.map(item => item.id)
}
```

---

## 二、后端接口设计

### 2.1 新增 Schema

**文件:** `backend/app/schemas/result.py`

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ========== 基础信息 ==========

class ResultInfo(BaseModel):
    """基础信息（BasicInfo 用）"""
    id: int
    name: str
    gender: str
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    waistline: Optional[str] = None
    systolic_pressure: Optional[str] = None
    diastolic_pressure: Optional[str] = None
    blood_sugar: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created: datetime
    remark: Optional[str] = None
    suggestion: Optional[str] = None

    class Config:
        from_attributes = True


# ========== 分组症状 ==========

class CategoryForGroup(BaseModel):
    """分组用的 category 简化版"""
    id: int
    name: str
    link: Optional[str] = None
    child_link: Optional[str] = None
    protocol: Optional[str] = "https://"
    show_count: Optional[int] = 0

    class Config:
        from_attributes = True


class EntryForGroup(BaseModel):
    """分组用的 entry 简化版"""
    id: int
    title: str
    number: Optional[int] = None  # None 表示顶级条目，不参与过滤

    class Config:
        from_attributes = True


class EntryGroupResponse(BaseModel):
    """单个分组"""
    category: CategoryForGroup
    entrys: List[EntryForGroup]

    class Config:
        from_attributes = True


class ResultGroupsResponse(BaseModel):
    """分组症状列表"""
    groups: List[EntryGroupResponse]

    class Config:
        from_attributes = True


# ========== Compare 用 ==========

class ResultCompareResponse(BaseModel):
    """Compare 页面用"""
    id: int
    name: str
    gender: str
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    waistline: Optional[str] = None
    systolic_pressure: Optional[str] = None
    diastolic_pressure: Optional[str] = None
    blood_sugar: Optional[str] = None
    phone: Optional[str] = None
    created: datetime
    remark: Optional[str] = None
    entry_ids: List[int]  # 顶级 entryship id 列表

    class Config:
        from_attributes = True
```

### 2.2 新增路由

**文件:** `backend/app/api/routers/results.py`

#### 接口 1: GET `/result/{user_entry_id}/info`

返回基础信息：

```python
@router.get("/{user_entry_id}/info", response_model=ResultInfo)
def get_result_info(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录基础信息
    """
    user_entry = db.query(UserEntry).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    return ResultInfo(
        id=user_entry.id,
        name=user_entry.name or "",
        gender=user_entry.gender or "1",
        age=user_entry.age,
        height=user_entry.height,
        weight=user_entry.weight,
        waistline=user_entry.waistline,
        systolic_pressure=user_entry.systolic_pressure,
        diastolic_pressure=user_entry.diastolic_pressure,
        blood_sugar=user_entry.blood_sugar,
        phone=user_entry.phone,
        address=user_entry.address,
        created=user_entry.created,
        remark=user_entry.remark,
        suggestion=user_entry.suggestion,
    )
```

#### 接口 2: GET `/result/{user_entry_id}/groups`

返回分组后的症状数据：

```python
@router.get("/{user_entry_id}/groups", response_model=ResultGroupsResponse)
def get_result_groups(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录分组症状
    实现前端现有的 entryGroups 分组逻辑
    """
    from sqlalchemy.orm import selectinload

    user_entry = db.query(UserEntry).options(
        selectinload(UserEntry.entries).joinedload(Entry.category),
        selectinload(UserEntry.entries).selectinload(Entry.entrys).joinedload(Entry.category),
    ).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    # 分组逻辑
    groups_map: Dict[int, Dict] = {}

    for entry in user_entry.entries:
        if entry.is_delete:
            continue

        # 处理顶级条目 - 按 category 分组
        cat_id = entry.category_id
        if cat_id not in groups_map:
            groups_map[cat_id] = {
                "category": {
                    "id": entry.category.id,
                    "name": entry.category.name,
                    "link": entry.category.link,
                    "child_link": entry.category.child_link,
                    "protocol": getattr(entry.category, 'protocol', 'https://'),
                    "show_count": getattr(entry.category, 'show_count', 0),
                },
                "entrys": []
            }
        # 顶级条目不设置 number
        groups_map[cat_id]["entrys"].append({
            "id": entry.id,
            "title": entry.title or "",
            "number": None
        })

        # 处理嵌套 entrys - 按嵌套条目的 category 分组，number 累加
        if hasattr(entry, 'entrys') and entry.entrys:
            for nested in entry.entrys:
                if nested.is_delete:
                    continue

                nested_cat_id = nested.category_id
                if nested_cat_id not in groups_map:
                    groups_map[nested_cat_id] = {
                        "category": {
                            "id": nested.category.id,
                            "name": nested.category.name,
                            "link": nested.category.link,
                            "child_link": nested.category.child_link,
                            "protocol": getattr(nested.category, 'protocol', 'https://'),
                            "show_count": getattr(nested.category, 'show_count', 0),
                        },
                        "entrys": []
                    }

                # 检查是否已存在该 entry
                existing_entry = None
                for e in groups_map[nested_cat_id]["entrys"]:
                    if e["id"] == nested.id:
                        existing_entry = e
                        break

                if existing_entry:
                    existing_entry["number"] = (existing_entry["number"] or 0) + 1
                else:
                    groups_map[nested_cat_id]["entrys"].append({
                        "id": nested.id,
                        "title": nested.title or "",
                        "number": 1
                    })

    # 转换为响应格式，每组内按 number 降序排序
    groups = []
    for group_data in groups_map.values():
        group_data["entrys"].sort(key=lambda x: (x["number"] or 0) if x["number"] is not None else -1, reverse=True)
        groups.append(EntryGroupResponse(**group_data))

    return ResultGroupsResponse(groups=groups)
```

#### 接口 3: GET `/result/{user_entry_id}/compare`

返回 Compare 页面用的简化数据：

```python
@router.get("/{user_entry_id}/compare", response_model=ResultCompareResponse)
def get_result_compare(
    user_entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户健康记录（Compare 页面用）
    返回基础信息 + 顶级 entry_ids 列表
    """
    from sqlalchemy.orm import selectinload

    user_entry = db.query(UserEntry).options(
        selectinload(UserEntry.entries),
    ).filter(
        UserEntry.id == user_entry_id,
        UserEntry.is_delete == False
    ).first()

    if not user_entry:
        raise HTTPException(status_code=404, detail="UserEntry not found")

    # 获取顶级 entryship id 列表
    entry_ids = [entry.id for entry in user_entry.entries if not entry.is_delete]

    return ResultCompareResponse(
        id=user_entry.id,
        name=user_entry.name or "",
        gender=user_entry.gender or "1",
        age=user_entry.age,
        height=user_entry.height,
        weight=user_entry.weight,
        waistline=user_entry.waistline,
        systolic_pressure=user_entry.systolic_pressure,
        diastolic_pressure=user_entry.diastolic_pressure,
        blood_sugar=user_entry.blood_sugar,
        phone=user_entry.phone,
        created=user_entry.created,
        remark=user_entry.remark,
        entry_ids=entry_ids,
    )
```

---

## 三、前端修改

### 3.1 API 层修改

**文件:** `frontend/src/api/index.ts`

添加新接口：

```typescript
export default {
  // ... 现有接口

  // Result 相关（新增）
  getResultInfo: 'GET /result/{id}/info',
  getResultGroups: 'GET /result/{id}/groups',
  getResultCompare: 'GET /result/{id}/compare',
}
```

**文件:** `frontend/src/api/request.ts`

添加新的 API 函数和 hooks：

```typescript
// 新增 ResultInfo 和 ResultGroups 类型导入（从 types/api.ts）

export const useResultInfo = (id: number) =>
  useQuery<ResultInfo, Error>({
    queryKey: ['resultInfo', id],
    queryFn: () => API.getResultInfo({ id }) as Promise<ResultInfo>,
    enabled: Boolean(id),
  })

export const useResultGroups = (id: number) =>
  useQuery<ResultGroups, Error>({
    queryKey: ['resultGroups', id],
    queryFn: () => API.getResultGroups({ id }) as Promise<ResultGroups>,
    enabled: Boolean(id),
  })

export const useResultCompare = (id: number) =>
  useQuery<ResultCompare, Error>({
    queryKey: ['resultCompare', id],
    queryFn: () => API.getResultCompare({ id }) as Promise<ResultCompare>,
    enabled: Boolean(id),
  })
```

### 3.2 类型定义

**文件:** `frontend/src/types/api.ts`

```typescript
// ========== Result Info ==========
export interface ResultInfo {
  id: number
  name: string
  gender: string
  age?: string
  height?: string
  weight?: string
  waistline?: string
  systolic_pressure?: string
  diastolic_pressure?: string
  blood_sugar?: string
  phone?: string
  address?: string
  created: string
  remark?: string
  suggestion?: string
}

// ========== Result Groups ==========
export interface CategorySimple {
  id: number
  name: string
  link?: string
  child_link?: string
  protocol?: string
  show_count?: number
}

export interface EntryForGroup {
  id: number
  title: string
  number?: number
}

export interface EntryGroup {
  category: CategorySimple
  entrys: EntryForGroup[]
}

export interface ResultGroups {
  groups: EntryGroup[]
}

// ========== Result Compare ==========
export interface ResultCompare {
  id: number
  name: string
  gender: string
  age?: string
  height?: string
  weight?: string
  waistline?: string
  systolic_pressure?: string
  diastolic_pressure?: string
  blood_sugar?: string
  phone?: string
  created: string
  remark?: string
  entry_ids: number[]
}
```

### 3.3 Result 页面修改

**文件:** `frontend/src/pages/Dashboard/Result/index.tsx`

修改为使用新接口：

```typescript
// 移除 entryGroups 相关的复杂逻辑

// 使用新的 hooks
const { data: resultInfo, isLoading: infoLoading, refetch } = useResultInfo(Number(id))
const { data: resultGroups, isLoading: groupsLoading } = useResultGroups(Number(id))

// 合并 loading 状态
const isLoading = infoLoading || groupsLoading

// 直接使用 resultGroups，无需分组处理
// entryGroups = resultGroups?.groups || []
```

### 3.4 Compare 页面修改

**文件:** `frontend/src/pages/Dashboard/Compare/index.tsx`

修改为使用新接口：

```typescript
// 使用新的 hooks
const { data: compare1, isLoading: loading1 } = useResultCompare(Number(oneId))
const { data: compare2, isLoading: loading2 } = useResultCompare(Number(twoId))

// entry_ids 直接从 compare 结果获取
const perIds = compare1?.entry_ids || []
const thisIds = compare2?.entry_ids || []

// 基础信息直接使用 compare 对象
// compare1.name, compare1.created 等
```

---

## 四、实施任务

### 后端任务

- [ ] **Task 1: 创建 Result Schema**
  - 创建: `backend/app/schemas/result.py`
  - 添加 `ResultInfo`, `CategoryForGroup`, `EntryForGroup`, `EntryGroupResponse`, `ResultGroupsResponse`, `ResultCompareResponse`

- [ ] **Task 2: 实现 GET /result/{id}/info**
  - 修改: `backend/app/api/routers/results.py`
  - 添加 `get_result_info` 端点

- [ ] **Task 3: 实现 GET /result/{id}/groups**
  - 修改: `backend/app/api/routers/results.py`
  - 添加 `get_result_groups` 端点（包含分组逻辑）

- [ ] **Task 4: 实现 GET /result/{id}/compare**
  - 修改: `backend/app/api/routers/results.py`
  - 添加 `get_result_compare` 端点

### 前端任务

- [ ] **Task 5: 添加前端类型定义**
  - 修改: `frontend/src/types/api.ts`
  - 添加 `ResultInfo`, `EntryForGroup`, `EntryGroup`, `ResultGroups`, `ResultCompare`

- [ ] **Task 6: 添加前端 API 接口**
  - 修改: `frontend/src/api/index.ts`
  - 添加新接口路由

- [ ] **Task 7: 添加前端 API 函数和 Hooks**
  - 修改: `frontend/src/api/request.ts`
  - 添加 `useResultInfo`, `useResultGroups`, `useResultCompare`

- [ ] **Task 8: 修改 Result 页面**
  - 修改: `frontend/src/pages/Dashboard/Result/index.tsx`
  - 使用新的 hooks，移除 entryGroups 分组逻辑

- [ ] **Task 9: 修改 Compare 页面**
  - 修改: `frontend/src/pages/Dashboard/Compare/index.tsx`
  - 使用新的 hooks

---

## 五、注意事项

### 5.1 逻辑正确性

1. **分组逻辑必须与前端现有逻辑完全一致**
   - 顶级条目按 category 分组，number=None
   - 嵌套 entrys 按嵌套条目的 category 分组，number 累加
   - 每组内按 number 降序排序

2. **Compare 页面的 entry_ids**
   - 只取顶级 entryship 的 id
   - 不包含嵌套的 entrys

3. **向后兼容**
   - 保留原有的 `/result/{id}` 接口（或删除，取决于前端是否还有使用）

### 5.2 测试验证

每个接口完成后需要验证：
1. 后端接口返回数据格式正确
2. 前端页面显示正常
3. 分组逻辑与之前一致
4. Compare 页面颜色标记正确
