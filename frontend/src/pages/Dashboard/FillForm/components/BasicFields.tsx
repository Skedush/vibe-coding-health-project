import { Form, Input } from 'antd'

const { TextArea } = Input

interface Props {
  form: ReturnType<typeof Form.useForm>[0]
}

export const BasicFields = ({ form }: Props) => {
  return (
    <>
      <Form.Item
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="姓名.必填" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="phone"
        label="ID"
        rules={[{ required: true, message: '请输入ID' }]}
      >
        <Input placeholder="ID.必填" maxLength={50} />
      </Form.Item>

      <Form.Item name="address" label="地址">
        <TextArea placeholder="地址" rows={2} />
      </Form.Item>

      <Form.Item
        name="gender"
        label="性别"
        rules={[{ required: true, message: '请选择性别' }]}
      >
        <Form.Item name="gender" noStyle>
          <Input placeholder="性别" />
        </Form.Item>
      </Form.Item>
    </>
  )
}
