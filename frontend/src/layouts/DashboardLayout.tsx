import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { HomeOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Header, Sider, Content } = Layout

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user, isAuthenticated } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    // /dashboard/f/ 页面不需要鉴权
    if (!isAuthenticated && !location.pathname.startsWith('/dashboard/f/')) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate, location.pathname])

  const menuItems = [
    { key: '/dashboard/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/dashboard/user', icon: <UserOutlined />, label: '用户设置' },
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // /dashboard/f/ 不显示完整布局，只显示内容
  if (location.pathname.startsWith('/dashboard/f/')) {
    return <Outlet />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-gray-800 px-6">
        <div className="text-white text-lg font-medium">健康管理系统</div>
        <div className="flex items-center gap-4">
          <Button
            type="text"
            className="md:hidden"
            onClick={() => setCollapsed(!collapsed)}
            icon={<MenuOutlined />}
          />
          <span className="text-white">{user?.username}</span>
          <Button type="link" onClick={handleLogout} className="text-white p-0">
            <LogoutOutlined /> 退出
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className="bg-white hidden md:block"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="h-full"
          />
        </Sider>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
