import { Form, Input, Radio } from 'antd'

const { TextArea } = Input

export const BasicFields = () => {
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
        <Radio.Group>
          <Radio value="1">男</Radio>
          <Radio value="0">女</Radio>
        </Radio.Group>
      </Form.Item>
    </>
  )
}