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

  const fields = ['age', 'height', 'weight', 'waistline', 'systolic_pressure', 'diastolic_pressure', 'blood_sugar'] as const

  return (
    <div className="flex flex-wrap gap-4">
      {fields.map((field) => (
        <Form.Item
          key={field}
          name={namePrefix ? `${namePrefix}.${field}` : field}
          label={field.replace('_', ' ')}
          className="flex-1 min-w-[45%]"
        >
          <Input placeholder={field.replace('_', ' ')} suffix={suffixMap[field]} />
        </Form.Item>
      ))}
    </div>
  )
}
