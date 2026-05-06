import { Form, Input } from 'antd'

interface Props {
  namePrefix?: string
}

export const MedicalFields = ({ namePrefix = '' }: Props) => {
  const suffixMap: Record<string, string> = {
    age: '',
    height: 'cm',
    weight: 'kg',
    waistline: 'cm',
    systolic_pressure: 'mmHg',
    diastolic_pressure: 'mmHg',
    blood_sugar: 'mmol/L',
  }

  const labelMap: Record<string, string> = {
    age: '年龄',
    height: '身高',
    weight: '体重',
    waistline: '腰围',
    systolic_pressure: '收缩压',
    diastolic_pressure: '舒张压',
    blood_sugar: '血糖',
  }

  const fields = ['age', 'height', 'weight', 'waistline', 'systolic_pressure', 'diastolic_pressure', 'blood_sugar'] as const

  return (
    <div className="flex flex-wrap gap-4">
      {fields.map((field) => (
        <Form.Item
          key={field}
          name={namePrefix ? `${namePrefix}.${field}` : field}
          label={labelMap[field]}
          className="flex-1 min-w-[45%]"
        >
          <Input placeholder={labelMap[field]} suffix={suffixMap[field]} />
        </Form.Item>
      ))}
    </div>
  )
}
