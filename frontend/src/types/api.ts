// 用户类型
export interface User {
  id: number
  username: string
  email?: string
  phone?: string
  is_superuser?: boolean
  is_staff?: boolean
  is_active?: boolean
  is_title?: boolean
  is_vip?: boolean
  created?: string
}

// 认证
export interface LoginData {
  username: string
  password: string
}

export interface RegisterData extends LoginData {
  email?: string
  phone?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

// 分类
export interface Category {
  id: number
  name: string
  link?: string
  child_link?: string
  has_user_rule?: boolean
}

// 条目
export interface Entry {
  id: number
  title: string
  category_id: number
  category?: Category
}

// 标题
export interface Title {
  id: number
  title_name: string
  created?: string
}

// 条目信息
export interface EntryInfo {
  id: number
  user_id?: number
  category_id?: number
  title_id?: number
  title_name?: string
  category_name?: string
  title?: Title
  entrys?: Entry[]
  created?: string
  updated?: string
}

// 用户条目记录
export interface UserEntry {
  id: number
  entry_info_id?: number
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
  remark?: string
  suggestion?: string
  entry_ids?: number[]
  created?: string
  updated?: string
  is_delete?: boolean
}

// 条目分数 (entryship)
export interface Entryship {
  id: number
  entry_info_id?: number
  entry_id?: number
  title: string
  remark?: string
  number?: number
  category_id?: number
  category?: CategorySimple
  entrys?: Entryship[]
}

export interface CategorySimple {
  id: number
  name: string
  link?: string
  child_link?: string
  protocol?: string
  has_user_rule?: boolean
  show_count?: number
}

// 健康报告结果
export interface HealthResult {
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
  remark?: string
  suggestion?: string
  address?: string
  entryship?: Entryship[]
  created?: string
}

// 分页响应
export interface PageResponse<T> {
  content: T[]
  total: number
  page: number
  page_size: number
}

// API 通用响应
export interface ApiResponse<T = any> {
  code?: string
  message?: string
  success?: boolean
  data?: T
}

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
export interface EntryForGroup {
  id: number
  title: string
  remark?: string
  number?: number
}

export interface EntryGroup {
  category: CategorySimple
  entrys: EntryForGroup[]
}

export interface ResultGroups {
  groups: EntryGroup[]
}

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
