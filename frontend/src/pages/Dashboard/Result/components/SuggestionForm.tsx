import { Card, Form, Input, Button, message } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { API } from '@/api/request'
import type { ResultInfo } from '@/types/api'

const { TextArea } = Input

interface SuggestionFormProps {
  result: ResultInfo
  onSuccess: () => void
}

// 格式化当前时间
const formatDateTime = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function SuggestionForm({ result, onSuccess }: SuggestionFormProps) {
  const [form] = Form.useForm()

  const updateMutation = useMutation({
    mutationFn: (data: { suggestion: string }) =>
      API.updateUserEntry({ id: result.id, ...data }),
    onSuccess: () => {
      message.success('提交成功')
      form.resetFields()
      onSuccess()
    },
    onError: () => {
      message.error('提交失败，请稍后重试')
    },
  })

  const onFinish = async (values: { suggestion: string }) => {
    const timeStr = formatDateTime()
    const newSuggestion = `${timeStr}:\n${values.suggestion}${result.suggestion ? '\n\n' + result.suggestion : ''}`
    await updateMutation.mutateAsync({ suggestion: newSuggestion })
  }

  return (
    <Card title="调理方案" size="small">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="suggestion"
          rules={[{ required: true, message: '请填写参考意见！' }]}
        >
          <TextArea
            rows={3}
            maxLength={1024}
            placeholder="调理方案及备注（可多次提交升级补充方案）"
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
        >
          提交意见
        </Button>
      </Form>
    </Card>
  )
}
