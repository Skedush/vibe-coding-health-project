import { useQuery, useMutation } from '@tanstack/react-query'
import { request } from './client'
import api from './index'
import type {
  LoginData,
  RegisterData,
  TokenResponse,
  User,
  Category,
  Entry,
  Title,
  EntryInfo,
  UserEntry,
  HealthResult,
  ResultInfo,
  ResultGroups,
  ResultCompare,
} from '@/types/api'

// API 生成器
const gen =
  <T>(apiString: string) =>
  (data?: unknown): Promise<T> => {
    const [method, url] = apiString.split(' ') as [string, string]
    return request({ method: method.toLowerCase() as any, url, data })
  }

// 从 api 定义自动生成 API 对象
const API = Object.fromEntries(
  Object.entries(api).map(([key, value]) => [key, gen(value)]),
) as {
  login: (data: LoginData) => Promise<TokenResponse>
  register: (data: RegisterData) => Promise<User>
  getCurrentUser: () => Promise<User>
  updateCurrentUser: (data: Partial<User>) => Promise<User>
  getCategories: () => Promise<Category[]>
  getCategory: (params: { id: number }) => Promise<Category>
  getEntries: () => Promise<Entry[]>
  getEntry: (params: { id: number }) => Promise<Entry>
  getTitles: () => Promise<Title[]>
  getTitle: (params: { id: number }) => Promise<Title>
  updateTitle: (data: { id: number } & Partial<Title>) => Promise<Title>
  getEntryInfoList: () => Promise<EntryInfo[]>
  getEntryInfoDetail: (params: { id: number }) => Promise<EntryInfo>
  getUserEntryList: (
    params?: { entry_info?: number; search?: string },
  ) => Promise<UserEntry[]>
  getUserEntry: (params: { id: number }) => Promise<UserEntry>
  addUserEntry: (data: Partial<UserEntry>) => Promise<UserEntry>
  updateUserEntry: (data: { id: number } & Partial<UserEntry>) => Promise<UserEntry>
  deleteUserEntry: (params: { id: number }) => Promise<void>
  getResult: (params: { id: number }) => Promise<HealthResult>
  getResultInfo: (params: { id: number }) => Promise<ResultInfo>
  getResultGroups: (params: { id: number }) => Promise<ResultGroups>
  getResultCompare: (params: { id: number }) => Promise<ResultCompare>
}

export { API }

// 工厂函数 - 简化 mutation hook 创建
const createMutationHook =
  <TData, TVariables>(
    mutationFn: (data: TVariables) => Promise<TData>
  ) =>
  () =>
    useMutation<TData, Error, TVariables>({ mutationFn })

// 工厂函数 - 简化 query hook 创建
const createQueryHook =
  <TData>(queryFn: () => Promise<TData>, queryKey: string[]) =>
  (enabled = true) =>
    useQuery<TData, Error>({
      queryKey,
      queryFn,
      enabled,
    })

// Query hooks - 全部用箭头函数包装，避免 React Query 传递 QueryOptions
export const useLogin = createMutationHook(API.login)

export const useRegister = createMutationHook(API.register)

export const useCurrentUser = () =>
  useQuery<User, Error>({ queryKey: ['currentUser'], queryFn: () => API.getCurrentUser() })

export const useUpdateUser = createMutationHook(API.updateCurrentUser)

export const useCategories = () =>
  useQuery<Category[], Error>({ queryKey: ['categories'], queryFn: () => API.getCategories() })

export const useEntries = () =>
  useQuery<Entry[], Error>({ queryKey: ['entries'], queryFn: () => API.getEntries() })

export const useEntry = (id: number) =>
  useQuery<Entry, Error>({
    queryKey: ['entry', id],
    queryFn: () => API.getEntry({ id }),
    enabled: Boolean(id),
  })

export const useTitles = () =>
  useQuery<Title[], Error>({ queryKey: ['titles'], queryFn: () => API.getTitles() })

export const useTitle = (id: number) =>
  useQuery<Title, Error>({
    queryKey: ['title', id],
    queryFn: () => API.getTitle({ id }),
    enabled: Boolean(id),
  })

export const useUpdateTitle = createMutationHook(API.updateTitle)

export const useEntryInfoList = () =>
  useQuery<EntryInfo[], Error>({ queryKey: ['entryInfoList'], queryFn: () => API.getEntryInfoList() })

export const useEntryInfoDetail = (id: number) =>
  useQuery<EntryInfo, Error>({
    queryKey: ['entryInfoDetail', id],
    queryFn: () => API.getEntryInfoDetail({ id }),
    enabled: Boolean(id),
  })

export const useUserEntryList = (params?: { entry_info?: number; search?: string }) =>
  useQuery<UserEntry[], Error>({
    queryKey: ['userEntryList', params],
    queryFn: () => API.getUserEntryList(params),
    enabled: Boolean(params?.entry_info),
  })

export const useUserEntry = (id: number) =>
  useQuery<UserEntry, Error>({
    queryKey: ['userEntry', id],
    queryFn: () => API.getUserEntry({ id }),
    enabled: Boolean(id),
  })

export const useAddUserEntry = createMutationHook(API.addUserEntry)

export const useUpdateUserEntry = createMutationHook(API.updateUserEntry)

export const useDeleteUserEntry = createMutationHook((id: number) => API.deleteUserEntry({ id }))

export const useResult = (id: number) =>
  useQuery<HealthResult, Error>({
    queryKey: ['result', id],
    queryFn: () => API.getResult({ id }),
    enabled: Boolean(id),
  })

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
