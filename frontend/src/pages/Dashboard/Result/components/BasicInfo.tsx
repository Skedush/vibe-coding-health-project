import { Card, Descriptions } from 'antd'
import type { HealthResult } from '@/types/api'

interface BasicInfoProps {
  result: HealthResult
  isStaff?: boolean
}

export function BasicInfo({ result, isStaff }: BasicInfoProps) {
  if (!isStaff) return null

  return (
    <Card title="自检结果" size="small">
      <div className="text-sm text-gray-600 mb-4">
        提交时间：{result.created ? new Date(result.created).toLocaleString() : '-'}
      </div>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="姓名"><b>{result.name}</b></Descriptions.Item>
        <Descriptions.Item label="手机">{result.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="年龄">{result.age || '-'}</Descriptions.Item>
        <Descriptions.Item label="性别">{result.gender === '1' ? '男' : '女'}</Descriptions.Item>
        <Descriptions.Item label="身高">{result.height || '-'}</Descriptions.Item>
        <Descriptions.Item label="体重">{result.weight || '-'}</Descriptions.Item>
        <Descriptions.Item label="腰围">{result.waistline || '-'}</Descriptions.Item>
        <Descriptions.Item label="血糖">{result.blood_sugar || '-'}</Descriptions.Item>
        <Descriptions.Item label="收缩压">{result.systolic_pressure || '-'}</Descriptions.Item>
        <Descriptions.Item label="舒张压">{result.diastolic_pressure || '-'}</Descriptions.Item>
      </Descriptions>
      {result.address && <div className="mt-2">地址：{result.address}</div>}
    </Card>
  )
}
