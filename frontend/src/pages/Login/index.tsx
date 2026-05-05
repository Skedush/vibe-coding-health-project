import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useLogin, API } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import type { LoginData } from '@/types/api'

export default function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { login, setUser } = useAuthStore()

  const onFinish = async (values: LoginData) => {
    try {
      const response = await loginMutation.mutateAsync(values)
      login(response.access_token, { id: 0, username: values.username })
      // 获取真实用户信息
      const userInfo = await API.getCurrentUser()
      setUser(userInfo)
      message.success('登录成功')
      navigate('/dashboard/home')
    } catch {
      message.error('登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h1 className="text-xl font-bold text-center mb-6">健康管理系统 - 登录</h1>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loginMutation.isPending}>
              登录
            </Button>
          </Form.Item>
          <div className="text-center">
            还没有账号？<a href="/register" className="text-blue-500">立即注册</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}
