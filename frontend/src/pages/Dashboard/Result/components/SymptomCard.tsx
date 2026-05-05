import { Card, Button } from 'antd'
import type { Entryship, CategorySimple } from '@/types/api'

interface SymptomCardProps {
  group: {
    category: CategorySimple
    entrys: Entryship[]
  }
  index: number
  onPieClick?: () => void
  onGraphClick?: () => void
}

export function SymptomCard({ group, index, onPieClick, onGraphClick }: SymptomCardProps) {
  const { category, entrys } = group

  const navEntry = (entry: Entryship) => {
    const { remark, title } = entry
    if (remark) {
      try {
        const url = new URL(remark)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          window.open(remark)
        }
      } catch {}
    } else if (category.child_link) {
      const protocol = category.protocol || 'https://'
      window.open(`${protocol}${category.child_link}${encodeURIComponent(title)}`)
    }
  }

  return (
    <Card
      size="small"
      className="mb-4"
      title={
        <div className="flex justify-between items-center">
          <span
            className="cursor-pointer"
            onClick={() => {
              if (category.link) {
                const protocol = category.protocol || 'https://'
                window.open(`${protocol}${category.link}`)
              }
            }}
          >
            {category.name}
            {category.name === '病因' && (
              <span className="text-xs text-gray-400 ml-2">(仅供参考，不具医学效力)</span>
            )}
          </span>
          <Button type="link" size="small" onClick={index === 0 ? onGraphClick : onPieClick}>
            {index === 0 ? '雷达图' : '饼图'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap">
        {entrys
          .filter((e) => {
            if (e.number === undefined) return true
            return (e.number ?? 0) > (category.show_count ?? 0)
          })
          .map((entry) => (
            <div
              key={entry.id}
              className="w-1/2 text-center py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => navEntry(entry)}
            >
              <span>{entry.title}</span>
              {entry.number !== undefined && (
                <span className="font-bold text-red-500 ml-2">{entry.number}</span>
              )}
            </div>
          ))}
      </div>
    </Card>
  )
}
