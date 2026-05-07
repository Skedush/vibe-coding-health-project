import { ComponentType } from 'react'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Dashboard/Home'
import FillForm from '@/pages/Dashboard/FillForm'
import Result from '@/pages/Dashboard/Result'
import Compare from '@/pages/Dashboard/Compare'
import User from '@/pages/Dashboard/User'
import Success from '@/pages/Dashboard/Success'
import { AuthGuard, PublicRoute } from '@/components/AuthGuard'

export interface RouteConfig {
  path: string
  component?: ComponentType
  redirect?: string
  wrapper?: ComponentType<{ children: React.ReactNode }>
}

const routes: RouteConfig[] = [
  { path: '/', redirect: '/dashboard/home' },
  { path: '/login', component: Login, wrapper: PublicRoute },
  { path: '/register', component: Register, wrapper: PublicRoute },
  { path: '/dashboard/home', component: Home, wrapper: AuthGuard },
  { path: '/dashboard/f/:id', component: FillForm },  // 不需要鉴权
  { path: '/dashboard/result/:id', component: Result, wrapper: AuthGuard },
  { path: '/dashboard/compare/:id/:oneId/:twoId', component: Compare, wrapper: AuthGuard },
  { path: '/dashboard/user', component: User, wrapper: AuthGuard },
  { path: '/dashboard/success', component: Success, wrapper: AuthGuard },
]

export default routes
