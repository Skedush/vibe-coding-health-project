import { Form, Input, Button, message, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import request from '@/api/request'
import { useAuthStore } from '@/stores/authStore'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const res = await request.post<{ access_token: string }>('/auth/login', values)
      setAuth(res.access_token, {})
      message.success('登录成功')
      navigate('/dashboard')
    } catch {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card title="健康管理系统登录" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/register')}>
            注册账号
          </Button>
        </Form>
      </Card>
    </div>
  )
}
