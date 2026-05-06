import { Button, Message } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import type { EntryInfo } from '@/types/api'

interface Props {
  items: EntryInfo[]
}

export const EntryInfoLinks = ({ items }: Props) => {
  const handleCopyLink = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/f/${id}`)
    Message.success('链接已复制')
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <span>{items[0]?.category_name}:</span>
      <a href={`/dashboard/f/${items[0].id}`} target="_blank" rel="noopener noreferrer">
        {`${window.location.origin}/dashboard/f/${items[0].id}`}
      </a>
      <Button
        type="link"
        icon={<LinkOutlined />}
        onClick={() => handleCopyLink(items[0].id)}
      >
        复制
      </Button>
    </div>
  )
}
