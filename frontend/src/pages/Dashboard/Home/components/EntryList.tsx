import { memo } from 'react'
import { List, Button, Checkbox } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UserEntry } from '@/types/api'

interface Props {
  records: UserEntry[]
  isLoading: boolean
  isStaff: boolean
  compareMode: boolean
  checkedList: string[]
  onView: (id: number) => void
  onDelete: (id: number) => void
  onCheckboxChange: (checked: boolean, id: string) => void
  canDelete: boolean
}

const EntryListComponent = ({
  records,
  isLoading,
  isStaff,
  compareMode,
  checkedList,
  onView,
  onDelete,
  onCheckboxChange,
  canDelete,
}: Props) => {
  // 渲染操作按钮
  const renderActions = (record: UserEntry) => {
    const actions = [
      <Button
        key="detail"
        type="link"
        icon={<EyeOutlined />}
        onClick={() => onView(record.id)}
      >
        查看
      </Button>,
    ]

    if (canDelete) {
      actions.push(
        <Button
          key="delete"
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record.id)}
        >
          删除
        </Button>,
      )
    }

    return actions
  }

  // 渲染列表项内容
  const renderContent = (record: UserEntry) => {
    if (!isStaff) {
      return <div>{record.created}</div>
    }

    return (
      <div className="flex justify-between w-full">
        <div>
          <a onClick={() => onView(record.id)}>{record.name}</a>
        </div>
        <div>{record.phone}</div>
        <div>{record.created}</div>
      </div>
    )
  }

  return (
    <List
      loading={isLoading}
      dataSource={records}
      renderItem={(record) => (
        <List.Item actions={renderActions(record)}>
          {compareMode && isStaff && (
            <Checkbox
              checked={checkedList.includes(record.id.toString())}
              onChange={(e) => onCheckboxChange(e.target.checked, record.id.toString())}
              className="mr-2"
            />
          )}
          {renderContent(record)}
        </List.Item>
      )}
    />
  )
}

EntryListComponent.displayName = 'EntryList'

export const EntryList = memo(EntryListComponent)
