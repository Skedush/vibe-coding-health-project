import { Button } from 'antd'

interface Props {
  compareMode: boolean
  onClick: () => void
}

export const CompareButton = ({ compareMode, onClick }: Props) => {
  return (
    <Button type="primary" onClick={onClick}>
      {compareMode ? '取消对比' : '对比'}
    </Button>
  )
}
