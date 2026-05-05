import { Card, Form, Input, Button, message, Tabs } from 'antd'
import { PageContainer } from '@/components/PageContainer'
import { useUpdateUser } from '@/api/request'

export default function User() {
  const [form] = Form.useForm()
  const updateMutation = useUpdateUser()

  const onPasswordSubmit = async (values: { password: string }) => {
    try {
      await updateMutation.mutateAsync(values)
      message.success('密码修改成功')
      form.resetFields()
    } catch {
      message.error('密码修改失败')
    }
  }

  return (
    <PageContainer>
      <Card>
      <Tabs
        items={[
          {
            key: 'password',
            label: '修改密码',
            children: (
              <Form form={form} layout="vertical" onFinish={onPasswordSubmit}>
                <Form.Item
                  name="password"
                  label="新密码"
                  rules={[{ required: true, message: '请输入新密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                    确定
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Card>
    </PageContainer>
  )
}
