import { Button, message } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import type { EntryInfo } from '@/types/api'

interface Props {
  items: EntryInfo[]
}

// 生成表单链接
const generateFormUrl = (id: number): string => `${window.location.origin}/dashboard/f/${id}`

// 复制到剪贴板
const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('链接已复制')
  } catch {
    message.error('复制失败，请手动复制')
  }
}

export const EntryInfoLinks = ({ items }: Props) => {
  if (!items || items.length === 0) return null

  const handleCopyLink = (id: number) => {
    copyToClipboard(generateFormUrl(id))
  }

  return (
    <div className="mb-2 flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <span>{item.category_name}:</span>
          <a href={`/dashboard/f/${item.id}`} target="_blank" rel="noopener noreferrer">
            {generateFormUrl(item.id)}
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
