import { Button, message } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import type { EntryInfo } from '@/types/api'

interface Props {
  items: EntryInfo[]
}

export const EntryInfoLinks = ({ items }: Props) => {
  if (!items || items.length === 0) return null

  const handleCopyLink = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/f/${id}`)
    message.success('链接已复制')
  }

  return (
    <div className="mb-2 flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <span>{item.category_name}:</span>
          <a href={`/dashboard/f/${item.id}`} target="_blank" rel="noopener noreferrer">
            {`${window.location.origin}/dashboard/f/${item.id}`}
          </a>
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => handleCopyLink(item.id)}
          >
            复制
          </Button>
        </div>
      ))}
    </div>
  )
}
