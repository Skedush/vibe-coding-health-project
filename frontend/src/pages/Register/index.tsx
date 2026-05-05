import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRegister } from '@/api/request'
import type { RegisterData } from '@/types/api'

export default function Register() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const onFinish = async (values: RegisterData) => {
    try {
      await registerMutation.mutateAsync(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch {
      message.error('注册失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h1 className="text-xl font-bold text-center mb-6">健康管理系统 - 注册</h1>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={registerMutation.isPending}>
              注册
            </Button>
          </Form.Item>
          <div className="text-center">
            已有账号？<a href="/login" className="text-blue-500">立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}
