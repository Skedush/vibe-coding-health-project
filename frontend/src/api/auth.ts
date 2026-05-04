import request from './request'

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  username: string
  password: string
  email?: string
  phone?: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const login = (data: LoginData) =>
  request.post<TokenResponse>('/auth/login', data)

export const register = (data: RegisterData) =>
  request.post('/auth/register', data)

export const getCurrentUser = () =>
  request.get('/users/me')

export const updateCurrentUser = (data: Record<string, unknown>) =>
  request.patch('/users/me', data)
