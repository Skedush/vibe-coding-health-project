import { useNavigate } from 'react-router-dom'
import { Result, Button, Card } from 'antd'
import { PageContainer } from '@/components/PageContainer'

export default function Success() {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <Card className="text-center">
        <Result
          status="success"
          title="提交成功"
          subTitle="感谢您的填写，您的健康数据已保存"
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/dashboard/home')}>
              返回首页
            </Button>,
            <Button key="again" onClick={() => navigate('/dashboard/home')}>
              继续填表
            </Button>,
          ]}
        />
      </Card>
    </PageContainer>
  )
}
