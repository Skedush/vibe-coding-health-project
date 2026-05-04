import { Layout, Menu, Typography } from 'antd'
import { UserOutlined, HomeOutlined } from '@ant-design/icons'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from 'antd'

const { Header, Sider, Content } = Layout
const { Title } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>健康管理系统</Title>
        <Button type="link" onClick={handleLogout} style={{ color: 'white' }}>退出登录</Button>
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: '100%' }}
          />
        </Sider>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/home" element={<div>首页</div>} />
            <Route path="/user" element={<div>用户设置</div>} />
            <Route path="/" element={<Navigate to="/home" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
