import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, Button, Input, Modal, message, Affix } from 'antd'
import { PageContainer } from '@/components/PageContainer'
import { useEntryInfoList, useUserEntryList, useDeleteUserEntry } from '@/api/request'
import { useQueryClient } from '@tanstack/react-query'
import type { EntryInfo } from '@/types/api'
import { EntryInfoLinks } from './components/EntryInfoLinks'
import { EntryList } from './components/EntryList'
import { CompareButton } from './components/CompareButton'
import { usePermission } from '@/hooks'

const { Search } = Input

export default function Home() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

  const { isStaff, canDelete } = usePermission()

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
    <PageContainer>
      <div>
      {isStaff && <EntryInfoLinks items={entryInfoList} />}

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
              <EntryList
                records={userEntryList || []}
                isLoading={isLoading}
                isStaff={isStaff}
                compareMode={compareMode}
                checkedList={checkedList}
                onView={(id) => navigate(`/dashboard/result/${id}`)}
                onDelete={handleDelete}
                onCheckboxChange={handleCheckboxChange}
                canDelete={canDelete}
              />
            ),
          }))}
        />
      )}

      {isStaff && selectedEntryInfo && (
        <Affix className="fixed bottom-4 right-4 md:bottom-6 md:right-6">
          <CompareButton compareMode={compareMode} onClick={handleCompare} />
        </Affix>
      )}
    </div>
    </PageContainer>
  )
}
