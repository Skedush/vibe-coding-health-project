import { Form, Input } from 'antd'

interface Props {
  namePrefix?: string
}

// 医学字段类型定义
type MedicalField = 'age' | 'height' | 'weight' | 'waistline' | 'systolic_pressure' | 'diastolic_pressure' | 'blood_sugar'

export const MedicalFields = ({ namePrefix = '' }: Props) => {
  // 字段后缀映射，使用严格类型
  const suffixMap: Record<MedicalField, string> = {
    age: '',
    height: 'cm',
    weight: 'kg',
    waistline: 'cm',
    systolic_pressure: 'mmHg',
    diastolic_pressure: 'mmHg',
    blood_sugar: 'mmol/L',
  }

  // 字段标签映射，使用严格类型
  const labelMap: Record<MedicalField, string> = {
    age: '年龄',
    height: '身高',
    weight: '体重',
    waistline: '腰围',
    systolic_pressure: '收缩压',
    diastolic_pressure: '舒张压',
    blood_sugar: '血糖',
  }

  // 字段列表，按逻辑分组排列
  const fields: MedicalField[] = [
    'age',
    'height',
    'weight',
    'waistline',
    'systolic_pressure',
    'diastolic_pressure',
    'blood_sugar',
  ]

  return (
    <div className="flex flex-wrap gap-4">
      {fields.map((field) => (
        <Form.Item
          key={field}
          name={namePrefix ? `${namePrefix}.${field}` : field}
          label={labelMap[field]}
          className="flex-1 min-w-[200px] sm:min-w-[45%]"
        >
          <Input placeholder={labelMap[field]} suffix={suffixMap[field]} />
        </Form.Item>
      ))}
    </div>
  )
}
