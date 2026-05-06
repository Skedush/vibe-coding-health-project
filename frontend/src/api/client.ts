import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { message } from 'antd'

interface ApiErrorResponse {
  detail?: string
  message?: string
}
import { useAuthStore } from '@/stores/authStore'
import { parse, compile } from 'path-to-regexp'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 成功消息
const SUCCESS_MESSAGES: Record<string, string> = {
  add: '新增成功！',
  create: '新增成功！',
  update: '更新成功！',
  patch: '更新成功！',
  delete: '删除成功！',
  register: '注册成功！',
  login: '登录成功！',
  logout: '退出成功！',
}

// 创建 axios 实例
const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: false,
})

// 取消请求存储
window.cancelRequest = new Map()

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'

    // 取消请求 token
    config.cancelToken = new axios.CancelToken(cancel => {
      window.cancelRequest.set(Symbol(Date.now()), {
        pathname: window.location.pathname,
        cancel,
      })
    })

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
    const msg = (error.response?.data as ApiErrorResponse)?.detail || error.message
    message.error(msg || '请求失败')
    return Promise.reject(error)
  }
)

/**
 * 正则匹配 RESTful 风格 URL 并替换参数
 * eg: /userEntry/:id/ + {id: 123} → /userEntry/123/
 */
function matchRestfulUrl(url: string, data: Record<string, any>): string {
  try {
    const compiled = compile(url)
    const finalUrl = compiled(data)

    // 删除已替换的参数
    const tokens = parse(url)

    // 删除已替换的参数
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

/**
 * 根据 URL 末尾 action 自动弹出成功消息
 */
function messageWithCRUDUrl(url: string): void {
  if (!url || url.length <= 0) return

  const array = url.split('/')
  const action = array[array.length - 1].split('?')[0] // 去掉 query string

  if (SUCCESS_MESSAGES[action]) {
    message.success(SUCCESS_MESSAGES[action])
  }
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

  // RESTful URL 参数替换
  finalUrl = matchRestfulUrl(finalUrl, cloneData)

  // GET 请求处理 query 参数
  if (method.toLowerCase() === 'get' && Object.keys(cloneData).length > 0) {
    // 过滤掉 undefined 和 null 值
    const filteredData = Object.fromEntries(
      Object.entries(cloneData).filter(([_, v]) => v !== undefined && v !== null)
    )
    if (Object.keys(filteredData).length > 0) {
      finalUrl = `${finalUrl}?${new URLSearchParams(filteredData).toString()}`
    }
  }

  try {
    const response = await client({
      url: finalUrl,
      method,
      data: method.toLowerCase() !== 'get' ? cloneData : undefined,
      ...rest,
    })

    const responseData = response.data

    // 自动成功消息
    if (autoMessage) {
      messageWithCRUDUrl(finalUrl)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export default client