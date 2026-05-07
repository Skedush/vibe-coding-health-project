import { Form, Input, Radio } from 'antd'

export const BasicFields = () => {
  return (
    <>
      <Form.Item
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
        rules={[{ required: true, message: '请输入手机号' }]}
      >
        <Input placeholder="请输入手机号" maxLength={50} />
      </Form.Item>

      <Form.Item name="address" label="地址">
        <Input.TextArea placeholder="请输入地址" rows={2} />
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