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

export const EntryList = ({
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
  return (
    <List
      loading={isLoading}
      dataSource={records}
      renderItem={(record: UserEntry) => (
        <List.Item
          actions={[
            <Button
              key="detail"
              type="link"
              icon={<EyeOutlined />}
              onClick={() => onView(record.id)}
            >
              查看
            </Button>,
            ...(canDelete
              ? [
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(record.id)}
                  >
                    删除
                  </Button>,
                ]
              : []),
          ]}
        >
          {compareMode && isStaff && (
            <Checkbox
              checked={checkedList.includes(record.id.toString())}
              onChange={(e) =>
                onCheckboxChange(e.target.checked, record.id.toString())
              }
              className="mr-2"
            />
          )}
          {isStaff ? (
            <div className="flex justify-between w-full">
              <div>
                <a onClick={() => onView(record.id)}>{record.name}</a>
              </div>
              <div>{record.phone}</div>
              <div>{record.created}</div>
            </div>
          ) : (
            <div>{record.created}</div>
          )}
        </List.Item>
      )}
    />
  )
}
