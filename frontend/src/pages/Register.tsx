import { Form, Input, Button, message, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import request from '@/api/request'

interface RegisterForm {
  username: string
  password: string
  email?: string
  phone?: string
}

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: RegisterForm) => {
    setLoading(true)
    try {
      await request.post('/auth/register', values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch {
      message.error('注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card title="健康管理系统注册" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/login')}>
            已有账号，去登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}
