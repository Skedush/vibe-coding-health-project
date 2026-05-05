import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Tabs, Button, Input, Modal, message, Checkbox, Affix } from 'antd'
import { DeleteOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons'
import { useEntryInfoList, useUserEntryList, useDeleteUserEntry } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import type { EntryInfo, UserEntry } from '@/types/api'

const { Search } = Input

export default function Home() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [selectedEntryInfo, setSelectedEntryInfo] = useState<string>('')
  const [searchParams, setSearchParams] = useState<{ page?: number; search?: string }>({})
  const [compareMode, setCompareMode] = useState(false)
  const [checkedList, setCheckedList] = useState<string[]>([])

  const { data: entryInfoList = [] } = useEntryInfoList()
  const { data: userEntryList, isLoading } = useUserEntryList({
    entry_info: selectedEntryInfo ? Number(selectedEntryInfo) : undefined,
    search: searchParams.search,
  })
  const deleteMutation = useDeleteUserEntry()

  const isStaff = user?.is_staff
  const isSuperUser = user?.is_superuser

  useEffect(() => {
    if (entryInfoList.length > 0 && !selectedEntryInfo) {
      setSelectedEntryInfo(entryInfoList[0].id.toString())
    }
  }, [entryInfoList, selectedEntryInfo])

  const handleTabChange = (key: string) => {
    setSelectedEntryInfo(key)
    setCheckedList([])
    setCompareMode(false)
  }

  const handleSearch = (value: string) => {
    setSearchParams({ ...searchParams, search: value, page: 1 })
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success('删除成功')
          queryClient.invalidateQueries({ queryKey: ['userEntryList'] })
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const handleCompare = () => {
    if (checkedList.length === 2) {
      navigate(`/dashboard/compare/${selectedEntryInfo}/${checkedList[0]}/${checkedList[1]}`)
    } else {
      setCompareMode(!compareMode)
      setCheckedList([])
    }
  }

  const handleCheckboxChange = (checked: boolean, id: string) => {
    if (checked) {
      if (checkedList.length < 2) {
        setCheckedList([...checkedList, id])
      }
    } else {
      setCheckedList(checkedList.filter((item) => item !== id))
    }
  }

  // 选中两个后自动跳转
  useEffect(() => {
    if (checkedList.length === 2 && selectedEntryInfo) {
      navigate(`/dashboard/compare/${selectedEntryInfo}/${checkedList[0]}/${checkedList[1]}`)
    }
  }, [checkedList, selectedEntryInfo, navigate])

  const handleNavForm = () => {
    if (entryInfoList.length === 1) {
      navigate(`/dashboard/f/${entryInfoList[0].id}`)
    } else {
      Modal.info({
        title: '选择表单',
        content: (
          <div className="flex flex-col gap-2 mt-4">
            {entryInfoList.map((item: EntryInfo) => (
              <Button
                key={item.id}
                type="primary"
                onClick={() => navigate(`/dashboard/f/${item.id}`)}
              >
                {item.category_name}
              </Button>
            ))}
          </div>
        ),
      })
    }
  }

  return (
    <div>
      {isStaff && (
        <div className="mb-4">
          {entryInfoList.map((item: EntryInfo) => (
            <div key={item.id} className="mb-2 flex items-center gap-2">
              <span>{item.category_name}:</span>
              <a href={`/dashboard/f/${item.id}`} target="_blank" rel="noopener noreferrer">
                {`${window.location.origin}/dashboard/f/${item.id}`}
              </a>
              <Button
                type="link"
                icon={<LinkOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/dashboard/f/${item.id}`)
                  message.success('链接已复制')
                }}
              >
                复制
              </Button>
            </div>
          ))}
        </div>
      )}

      {!isStaff && (
        <Button type="primary" onClick={handleNavForm} className="mb-4">
          点此填表
        </Button>
      )}

      {isStaff && <Search placeholder="搜索姓名或电话" onSearch={handleSearch} className="mb-4" />}

      {entryInfoList.length > 0 && (
        <Tabs
          activeKey={selectedEntryInfo}
          onChange={handleTabChange}
          type="card"
          items={entryInfoList.map((item: EntryInfo) => ({
            key: item.id.toString(),
            label: item.category_name,
            children: (
              <List
                loading={isLoading}
                dataSource={userEntryList || []}
                renderItem={(record: UserEntry) => (
                  <List.Item
                    actions={[
                      <Button
                        key="detail"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/dashboard/result/${record.id}`)}
                      >
                        查看
                      </Button>,
                      ...(isSuperUser || !isStaff
                        ? [
                            <Button
                              key="delete"
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(record.id)}
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
                          handleCheckboxChange(e.target.checked, record.id.toString())
                        }
                        className="mr-2"
                      />
                    )}
                    {isStaff ? (
                      <div className="flex justify-between w-full">
                        <div>
                          <a onClick={() => navigate(`/dashboard/result/${record.id}`)}>
                            {record.name}
                          </a>
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
            ),
          }))}
        />
      )}

      {isStaff && selectedEntryInfo && (
        <Affix className="fixed bottom-6 right-6">
          <Button type="primary" onClick={handleCompare}>
            {compareMode ? '取消对比' : '对比'}
          </Button>
        </Affix>
      )}
    </div>
  )
}
